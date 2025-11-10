# Chat con IA - Documentación

Este módulo implementa un asistente de IA para clientes del gimnasio usando Convex Agent y Google Gemini.

## Características

- **Acceso a información del cliente**: El agente puede consultar el perfil, métricas de salud, progreso y contratos del usuario autenticado
- **Streaming de respuestas**: Soporte para mostrar respuestas en tiempo real
- **Búsqueda semántica**: Usa embeddings para buscar mensajes relevantes en el historial
- **Herramientas (Tools)**: El agente puede llamar funciones para obtener información actualizada

## Arquitectura

```
chat/ai/
├── index.ts         # Configuración del agente (chatAgent)
├── tools.ts         # Herramientas disponibles para el agente
├── queries.ts       # Queries para listar mensajes y threads
├── mutations.ts     # Mutations para crear threads y gestionar mensajes
└── actions.ts       # Actions para generar respuestas del agente
```

## Herramientas disponibles

El agente tiene acceso a las siguientes herramientas:

### 1. `getClientProfile`
Obtiene el perfil completo del cliente autenticado:
- Información personal (nombre, email, teléfono, documento)
- Preferencias de entrenamiento (horarios, tipo de rutina, objetivos)
- Métricas de salud más recientes (peso, altura, IMC, grasa corporal)
- Contacto de emergencia

### 2. `getHealthMetrics`
Obtiene el historial de métricas de salud:
- Peso, altura, IMC, porcentaje de grasa corporal
- Soporta filtros por fecha y límite de resultados

### 3. `getClientProgress`
Obtiene el historial de progreso del cliente:
- Hitos alcanzados
- Mediciones de rendimiento (RM, tiempos)
- Avances en rutinas

### 4. `getClientContracts`
Obtiene los contratos con entrenadores:
- Contratos activos, inactivos o bloqueados
- Fechas de inicio y fin
- Notas asociadas

## Uso desde el cliente

### 1. Crear o continuar una conversación

```typescript
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

function ChatComponent() {
  const startConversation = useMutation(api.chat.ai.actions.startConversation);
  
  const handleStart = async () => {
    const result = await startConversation({
      prompt: "Hola, ¿cuál es mi peso actual?",
      metadata: {
        title: "Nueva conversación",
      },
    });
    
    console.log(result.text); // Respuesta del agente
    console.log(result.threadId); // ID del thread para continuar
  };
  
  return <button onClick={handleStart}>Iniciar chat</button>;
}
```

### 2. Continuar una conversación existente

```typescript
const generateResponse = useMutation(api.chat.ai.actions.generateResponse);

const handleSendMessage = async (threadId: string, message: string) => {
  const result = await generateResponse({
    threadId,
    prompt: message,
  });
  
  console.log(result.text); // Respuesta del agente
};
```

### 3. Listar mensajes de un thread

```typescript
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

function ChatMessages({ threadId }: { threadId: string }) {
  const messages = useQuery(api.chat.ai.queries.listThreadMessages, {
    threadId,
    paginationOpts: { numItems: 50, cursor: null },
  });
  
  if (!messages) return <div>Cargando...</div>;
  
  return (
    <div>
      {messages.page.map((msg) => (
        <div key={msg.key}>
          <strong>{msg.role}:</strong> {msg.text}
        </div>
      ))}
    </div>
  );
}
```

### 4. Streaming de respuestas

Para implementar streaming en el cliente, usa el hook `useUIMessages` con `stream: true`:

```typescript
import { useUIMessages } from "@convex-dev/agent/react";
import { api } from "../convex/_generated/api";

function ChatWithStreaming({ threadId }: { threadId: string }) {
  const { results, status, loadMore } = useUIMessages(
    api.chat.ai.queries.listThreadMessages,
    { threadId },
    { 
      initialNumItems: 10,
      stream: true, // Habilitar streaming
    }
  );
  
  return (
    <div>
      {results.map((message) => (
        <div key={message.key}>
          <strong>{message.role}:</strong>
          <p>{message.text}</p>
          {message.status === "streaming" && <span>Escribiendo...</span>}
        </div>
      ))}
      {status === "LoadingMore" && <div>Cargando más mensajes...</div>}
    </div>
  );
}
```

## Actualización optimista

Para una mejor experiencia de usuario, usa `optimisticallySendMessage`:

```typescript
import { useMutation } from "convex/react";
import { optimisticallySendMessage } from "@convex-dev/agent/react";
import { api } from "../convex/_generated/api";

function ChatInput({ threadId }: { threadId: string }) {
  const sendMessage = useMutation(
    api.chat.ai.actions.generateResponse
  ).withOptimisticUpdate(
    optimisticallySendMessage(api.chat.ai.queries.listThreadMessages)
  );
  
  const handleSend = (prompt: string) => {
    sendMessage({ threadId, prompt });
  };
  
  // ...
}
```

## Configuración del agente

El agente está configurado en `chat/ai/index.ts`:

```typescript
export const chatAgent = new Agent(components.agent, {
  name: "chat-agent",
  languageModel: google.chat("gemini-2.5-flash"),
  textEmbedding: google.textEmbedding("text-embedding-004"),
  instructions: "...", // Instrucciones del sistema
  maxSteps: 10,
  tools: chatTools,
});
```

### Personalizar instrucciones

Puedes modificar las `instructions` para cambiar el comportamiento del agente:

```typescript
instructions: `Eres un asistente especializado en nutrición deportiva...`
```

### Cambiar el modelo

Para usar otro modelo de Google AI:

```typescript
languageModel: google.chat("gemini-1.5-pro"), // Modelo más potente
```

## Agregar nuevas herramientas

Para agregar una nueva herramienta, edita `chat/ai/tools.ts`:

```typescript
export const myNewTool = createTool({
  description: "Descripción de la herramienta",
  args: z.object({
    param1: z.string().describe("Descripción del parámetro"),
  }),
  handler: async (ctx, args) => {
    // ctx tiene: agent, userId, threadId, messageId, auth, storage, runQuery, etc.
    const result = await ctx.runQuery(api.some.query, { ... });
    return result;
  },
});

// Agregar al objeto chatTools
export const chatTools = {
  // ... herramientas existentes
  myNewTool,
};
```

## Contexto y RAG

El agente usa automáticamente:
- **Mensajes recientes**: Últimos 100 mensajes del thread
- **Búsqueda semántica**: Encuentra mensajes relevantes usando embeddings
- **Herramientas**: Consulta información actualizada cuando es necesario

### Personalizar el contexto

Puedes personalizar cómo se obtiene el contexto:

```typescript
const result = await thread.generateText(
  { prompt },
  {
    contextOptions: {
      recentMessages: 50, // Reducir a 50 mensajes
      searchOptions: {
        limit: 5,
        textSearch: true,
        vectorSearch: true,
      },
    },
  }
);
```

## Seguridad y permisos

- **Autenticación requerida**: Todas las queries, mutations y actions verifican que el usuario esté autenticado
- **Acceso solo a datos propios**: Las herramientas solo pueden acceder a información del usuario autenticado
- **Validación de threads**: Se verifica que el usuario tenga permiso para acceder a cada thread

## Testing

Ejemplo de cómo probar el agente:

```typescript
// En un test
import { test } from "vitest";
import { convexTest } from "convex-test";

test("el agente responde correctamente", async () => {
  const t = convexTest();
  
  // Autenticar usuario
  const asUser = t.withIdentity({ subject: "user123" });
  
  // Iniciar conversación
  const result = await asUser.action(api.chat.ai.actions.startConversation, {
    prompt: "¿Cuál es mi peso actual?",
  });
  
  expect(result.success).toBe(true);
  expect(result.text).toContain("peso");
});
```

## Troubleshooting

### El agente no responde
1. Verifica que el usuario esté autenticado
2. Verifica que las variables de entorno estén configuradas (Google API Key)
3. Revisa los logs del servidor para errores

### Las herramientas no se ejecutan
1. Asegúrate de que las descripciones de las herramientas sean claras
2. Verifica que los parámetros tengan descripciones usando `.describe()`
3. Aumenta `maxSteps` si el agente necesita más pasos

### Problemas de embeddings
1. Verifica que `textEmbedding` esté configurado en el agente
2. Asegúrate de que el modelo de embeddings sea compatible
3. Revisa que los mensajes se estén guardando correctamente

## Recursos

- [Convex Agent Documentation](https://docs.convex.dev/components/agent)
- [Google AI SDK](https://github.com/google/generative-ai-js)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
