import { NextRequest } from "next/server";
import { chatStream } from "@/lib/chatbot";

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json();

    if (!message || !sessionId) {
      return new Response(
        JSON.stringify({ error: "Missing message or sessionId" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get streaming response from the chatbot service
    const stream = await chatStream(sessionId, message);

    return new Response(stream, {
      headers: {
        // Required for Server-Sent Events (SSE)
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",

        // Prevent buffering in proxies (e.g., Nginx, Vercel)
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}