import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

export const askCounselor = onCall({ cors: true }, async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Você precisa estar logado para falar com o conselheiro.");
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new HttpsError("internal", "Chave do Gemini não configurada no servidor.");
    }

    const { messages, userFinancials } = request.data;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        throw new HttpsError("invalid-argument", "Histórico de mensagens inválido.");
    }

    if (!userFinancials || typeof userFinancials.saldo !== 'number' || typeof userFinancials.investido !== 'number') {
        throw new HttpsError("invalid-argument", "Dados financeiros inválidos ou ausentes.");
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const systemInstruction = `Você é o Conselheiro Akumol, um assistente financeiro de elite, rigoroso e extremamente analítico.
      O seu objetivo principal é blindar o patrimônio do usuário e evitar que ele gaste dinheiro impulsivamente.
      Regras de conduta:
      1. Questione incisivamente a necessidade de qualquer compra mencionada.
      2. Mostre o custo de oportunidade (o que ele poderia ganhar investindo esse valor).
      3. Seja firme e direto ao ponto. Não seja complacente com justificativas fúteis.
      
      Dados atuais do usuário:
      Saldo em Conta: R$ ${userFinancials.saldo}
      Total Investido: R$ ${userFinancials.investido}
      Horas de Vida Salvas: ${userFinancials.horasSalvas}h`;

      const chat = model.startChat({
        systemInstruction,
        history: messages.slice(0, -1).map((msg: any) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        })),
      });

      const lastMessage = messages[messages.length - 1].content;
      const result = await chat.sendMessage(lastMessage);

      return { reply: result.response.text() };

    } catch (error) {
      logger.error("Erro no Gemini", error);
      throw new HttpsError("internal", "Erro ao comunicar com a inteligência artificial.");
    }
});

export const updateBalance = onCall({ cors: true }, async (request) => {
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "Operação não permitida.");
    }

    const { amount, type } = request.data;

    if (typeof amount !== 'number' || amount <= 0 || !['deposit', 'withdraw'].includes(type)) {
        throw new HttpsError("invalid-argument", "Parâmetros de transação inválidos.");
    }

    const userRef = db.collection('users').doc(request.auth.uid);
    
    try {
        await db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) {
                throw new HttpsError("not-found", "Usuário não encontrado.");
            }
            
            const currentBalance = userDoc.data()?.financialData?.balance || 0;
            let newBalance = currentBalance;

            if (type === 'deposit') {
                newBalance += amount;
            } else if (type === 'withdraw') {
                if (amount > currentBalance) {
                    throw new HttpsError("failed-precondition", "Saldo insuficiente.");
                }
                newBalance -= amount;
            }

            transaction.update(userRef, { 'financialData.balance': newBalance });
        });
        return { success: true };
    } catch (error: any) {
        throw new HttpsError("internal", error.message || "Erro ao processar a transação financeira.");
    }
});