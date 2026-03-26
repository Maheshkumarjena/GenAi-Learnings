import { ChatGroq } from "@langchain/groq";

const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY!,
  model: "llama-3.1-8b-instant",
  temperature: 0,
});

const sessions: Record<string, any[]> = {};

export async function chatStream(sessionId: string, input: string) {
  if (!sessions[sessionId]) {
    sessions[sessionId] = [];
  }

  sessions[sessionId].push({
    role: "user",
    content: input,
  });

  const stream = new ReadableStream({
    async start(controller) {
      let fullResponse = "";

      const response = await llm.stream(sessions[sessionId]);

      for await (const chunk of response) {
        const token = chunk.content || "";
        fullResponse += token;

        controller.enqueue(token);
      }

      sessions[sessionId].push({
        role: "assistant",
        content: fullResponse,
      });

      controller.close();
    },
  });

  return stream;
}

export function getSessionMessages(sessionId: string) {
  return sessions[sessionId] || [];
}