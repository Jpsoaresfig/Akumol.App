import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as admin from "firebase-admin";
import Stripe from "stripe";

admin.initializeApp();
const db = admin.firestore();

if (!process.env.STRIPE_SECRET_KEY) {
  logger.warn("STRIPE_SECRET_KEY not set. Payment functions will fail.");
}
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const PLANS_AMOUNTS: Record<string, { amount: number; label: string }> = {
  premium: { amount: 1990, label: "Akumol Premium" },
  plus: { amount: 4990, label: "Akumol Plus" },
  ultimate: { amount: 9990, label: "Akumol Ultimate" },
};

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

export const askRadar = onCall({ cors: true }, async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Você precisa estar logado.");
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new HttpsError("internal", "Chave do Gemini não configurada no servidor.");
    }

    const { query } = request.data;
    if (!query || typeof query !== 'string') {
      throw new HttpsError("invalid-argument", "Query inválida.");
    }

    const systemPrompt = `Você é o Agente Radar Akumol, especialista em economia inteligente no Brasil.
Com base no produto ou loja informado, sugira oportunidades reais e conhecidas de economia para consumidores brasileiros.

Para o produto/loja informado, liste:
1. Portais de cashback conhecidos no Brasil (Méliuz, Inter Shop, Ame Digital, C6 Bank, Nubank Rewards, PicPay, Livelo) com percentuais típicos por categoria
2. Cupons e estratégias de desconto em varejistas brasileiros relevantes (Americanas, Magazine Luiza, Shopee, Amazon BR, Mercado Livre, Casas Bahia)
3. Oportunidades de acúmulo de milhas/pontos (Livelo, Esfera, TudoAzul, Smiles, Latam Pass) para a categoria do produto

Use conhecimento real sobre esses programas — percentuais típicos, como ativar, onde se cadastrar.

Responda SOMENTE com um array JSON válido, sem texto adicional, sem markdown, sem explicações.
Formato exato:
[
  {
    "type": "cashback",
    "title": "Título curto e claro",
    "description": "Descrição concreta com detalhes da oportunidade, portal e como ativar",
    "potentialValue": 0,
    "actionText": "Ver Oferta",
    "actionUrl": "https://url-real-do-portal.com.br"
  }
]

Tipos válidos: "cashback", "coupon", "miles"
potentialValue: estimativa de economia em BRL (número inteiro, pode ser 0 se percentual variável)
actionUrl: URL real e válida do portal (ex: meliuz.com.br, interpag.com.br, livelo.com.br)
Retorne entre 4 e 6 resultados variados. Baseie-se em programas reais existentes no Brasil.`;

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const result = await model.generateContent({
        systemInstruction: { role: "user", parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: `Encontre oportunidades de cashback, cupons e milhas para: ${query}` }] }],
        generationConfig: { temperature: 0.3 },
      });

      const text = result.response.text();
      return { insights: text };
    } catch (error) {
      logger.error("Radar Gemini error", error);
      throw new HttpsError("internal", "Erro ao buscar oportunidades com a inteligência artificial.");
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

export const createCheckoutSession = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Você precisa estar logado.");
  }
  if (!stripe) {
    throw new HttpsError("internal", "Stripe não configurado. Configure STRIPE_SECRET_KEY.");
  }

  const { plan } = request.data;
  if (!plan || !PLANS_AMOUNTS[plan]) {
    throw new HttpsError("invalid-argument", "Plano inválido.");
  }

  const planConfig = PLANS_AMOUNTS[plan];
  const origin = request.rawRequest?.headers?.origin || "http://localhost:5173";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "brl",
          product_data: { name: planConfig.label },
          recurring: { interval: "month" },
          unit_amount: planConfig.amount,
        },
        quantity: 1,
      }],
      client_reference_id: request.auth.uid,
      metadata: { plan, userId: request.auth.uid },
      success_url: `${origin}/?payment=success&plan=${plan}`,
      cancel_url: `${origin}/planos?payment=canceled`,
    });

    return { url: session.url };
  } catch (error: any) {
    logger.error("Stripe checkout error", error);
    throw new HttpsError("internal", "Erro ao criar sessão de checkout.");
  }
});

export const stripeWebhook = onRequest({ cors: true }, async (req, res) => {
  if (!stripe) {
    res.status(500).json({ error: "Stripe não configurado." });
    return;
  }

  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !endpointSecret) {
    res.status(400).json({ error: "Signature missing or not configured." });
    return;
  }

  let event: any;
  try {
    event = stripe.webhooks.constructEvent(
      (req as any).rawBody || "",
      sig as string,
      endpointSecret
    );
  } catch {
    res.status(400).json({ error: "Invalid signature." });
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan;

    if (userId && plan) {
      await db.collection("users").doc(userId).update({ plan });
      logger.info(`User ${userId} upgraded to ${plan} via Stripe`);
    }
  }

  res.json({ received: true });
});

export const saveMonthlySnapshot = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Você precisa estar logado.");
  }

  const userId = request.auth.uid;
  const userRef = db.collection("users").doc(userId);

  try {
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      throw new HttpsError("not-found", "Usuário não encontrado.");
    }

    const data = userDoc.data()!;
    const financialData = data.financialData || {};
    const totalInvested = financialData.totalInvested || 0;
    const balance = financialData.balance || 0;
    const total = totalInvested + balance;
    const economia = financialData.savingsRatio || 0;

    const now = new Date();
    const monthLabel = now.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
    const monthCapitalized = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

    await db.collection("users").doc(userId).collection("snapshots").add({
      total,
      economia,
      month: monthCapitalized,
      timestamp: admin.firestore.Timestamp.now(),
    });

    return { success: true, month: monthCapitalized, total };
  } catch (error: any) {
    logger.error("Error saving snapshot", error);
    throw new HttpsError("internal", "Erro ao salvar snapshot.");
  }
});

export const autoSnapshot = onSchedule("0 0 1 * *", async () => {
  logger.info("Running monthly auto-snapshot for all users");

  const users = await db.collection("users").get();
  const now = new Date();
  const monthLabel = now.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
  const monthCapitalized = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
  const batch = db.batch();
  let count = 0;

  users.forEach((userDoc) => {
    const data = userDoc.data();
    const financialData = data.financialData || {};
    const total = (financialData.totalInvested || 0) + (financialData.balance || 0);
    const economia = financialData.savingsRatio || 0;

    const ref = db.collection("users").doc(userDoc.id).collection("snapshots").doc();
    batch.set(ref, {
      total,
      economia,
      month: monthCapitalized,
      timestamp: admin.firestore.Timestamp.now(),
    });
    count++;
  });

  await batch.commit();
  logger.info(`Snapshots saved for ${count} users`);
});
