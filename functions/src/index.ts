import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { GoogleGenerativeAI } from "@google/generative-ai";

// A função segura que o React vai chamar
export const askCounselor = onCall({ cors: true }, async (request) => {
    // 1. Segurança: Verifica se o usuário está logado
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Você precisa estar logado para falar com o conselheiro.");
    }

    try {
      // 2. Puxa a chave do arquivo .env que criamos no servidor
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Chave do Gemini não configurada no servidor.");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // 3. Pega os dados que o Front-end enviou
      const { messages, userFinancials } = request.data;

      // 4. Cria a instrução de sistema (Regras da IA)
      const systemInstruction = `Você é o Conselheiro Akumol, um assistente financeiro de elite...
      Saldo: R$ ${userFinancials.saldo}
      Investido: R$ ${userFinancials.investido}
      Horas Salvas: ${userFinancials.horasSalvas}
      Seja firme, analítico e evite que o usuário gaste à toa.`;

      // 5. Prepara o histórico para o Gemini
      const chat = model.startChat({
        systemInstruction,
        history: messages.map((msg: any) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        })),
      });

      // 6. Pega a última mensagem do usuário para enviar
      const lastMessage = messages[messages.length - 1].content;
      const result = await chat.sendMessage(lastMessage);

      // 7. Devolve a resposta para o React
      return {
        reply: result.response.text()
      };

    } catch (error) {
      logger.error("Erro no Gemini", error);
      throw new HttpsError("internal", "Erro ao comunicar com a inteligência artificial.");
    }
});