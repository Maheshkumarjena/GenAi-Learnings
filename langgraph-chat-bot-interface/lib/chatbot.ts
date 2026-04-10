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

  // Store user message
  sessions[sessionId].push({
    role: "user",
    content: input,
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let fullResponse = "";

      try {
        // Stream response from Groq via LangChain
        const response = await llm.stream(sessions[sessionId]);

        for await (const chunk of response) {
          const token = chunk.content?.toString() || "";
          if (!token) continue;

          fullResponse += token;

          // Send token in SSE format
          controller.enqueue(
            encoder.encode(`data: ${token}\n\n`)
          );
        }

        // Store assistant response in session history
        sessions[sessionId].push({
          role: "assistant",
          content: fullResponse,
        });

        // Signal stream completion
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (error) {
        console.error("Streaming Error:", error);
        controller.enqueue(
          encoder.encode("data: Error generating response.\n\n")
        );
      } finally {
        controller.close();
      }
    },
  });

  return stream;
}

export function getSessionMessages(sessionId: string) {
  return sessions[sessionId] || [];
}