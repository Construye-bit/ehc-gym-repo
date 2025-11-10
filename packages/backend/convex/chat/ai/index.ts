import { Agent } from "@convex-dev/agent";
import { google } from "@ai-sdk/google";
import { components } from "../../_generated/api";
import { chatTools } from "./tools";
import type { AgentComponent } from "@convex-dev/agent";

/**
 * Agente de chat con IA para asistir a clientes del gimnasio
 * 
 * El agente tiene acceso a:
 * - Perfil completo del cliente (información personal, preferencias, contacto de emergencia)
 * - Métricas de salud (peso, IMC, grasa corporal, etc.)
 * - Historial de progreso (hitos, mediciones, avances en rutinas)
 * - Contratos con entrenadores
 * 
 * Características:
 * - Usa Google Gemini 2.5 Flash como modelo de lenguaje
 * - Soporta embeddings para búsqueda semántica de mensajes
 * - Máximo 10 pasos de razonamiento por conversación
 **/

export const chatAgent: Agent<AgentComponent> = new Agent(components.agent, {
    name: "chat-agent",
    languageModel: google("gemini-2.0-flash-exp"),
    instructions: `Eres un asistente virtual para un gimnasio. Tu objetivo es ayudar a los clientes con información sobre:
- Su perfil y preferencias de entrenamiento
- Sus métricas de salud y progreso físico
- Sus contratos con entrenadores
- Consejos generales de fitness y bienestar

Sé amable, conciso y profesional. Usa un tono motivador y positivo.
Cuando proporciones información personal del cliente, sé respetuoso con su privacidad.
Si necesitas información específica, usa las herramientas disponibles para consultarla.`,
    maxSteps: 10,
    tools: chatTools,
});
