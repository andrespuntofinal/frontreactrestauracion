
import { GoogleGenAI } from "@google/genai";
import { Transaction, Category, Ministry, Person } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getFinancialInsights(
  transactions: Transaction[],
  categories: Category[],
  people: Person[]
) {
  const summary = transactions.map(t => ({
    type: t.type,
    amount: t.value,
    category: categories.find(c => c.id === t.categoryId)?.name || 'Unknown',
    date: t.date
  }));

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Analiza estos datos financieros de una comunidad religiosa/social y proporciona un resumen ejecutivo en español.
        Detecta tendencias, posibles áreas de ahorro y fuentes de ingresos principales.
        
        Datos:
        ${JSON.stringify(summary)}
      `,
      config: {
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "No se pudo generar el análisis de IA en este momento.";
  }
}

export async function askCommunityAssistant(
  query: string,
  context: {
    people: Person[],
    ministries: Ministry[],
    transactions: Transaction[],
    categories: Category[]
  }
) {
  try {
    // Simplificar el contexto para no exceder tokens y proteger privacidad sensible
    const simplifiedContext = {
      miembros: context.people.map(p => ({
        nombre: p.fullName,
        identificacion: p.identification,
        ministerio: context.ministries.find(m => m.id === p.ministryId)?.name,
        bautizado: p.isBaptized ? 'Sí' : 'No',
        poblacion: p.populationGroup
      })),
      finanzas: context.transactions.map(t => ({
        tipo: t.type,
        valor: t.value,
        categoria: context.categories.find(c => c.id === t.categoryId)?.name,
        fecha: t.date,
        concepto: t.observations
      }))
    };

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Eres el Asistente Inteligente de "ComunidadPro". Tu objetivo es ayudar al administrador a consultar datos de su comunidad.
        Responde de forma clara, profesional y amable en español.
        Si te preguntan por totales de dinero, haz los cálculos basados en los datos proporcionados.
        
        CONTEXTO DE LA COMUNIDAD:
        ${JSON.stringify(simplifiedContext)}
        
        PREGUNTA DEL USUARIO:
        "${query}"
      `,
      config: {
        temperature: 0.2, // Baja temperatura para mayor precisión en datos
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Assistant Error:", error);
    return "Lo siento, tuve un problema al procesar tu consulta. Inténtalo de nuevo.";
  }
}
