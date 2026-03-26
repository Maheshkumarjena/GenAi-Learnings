import { NextRequest } from "next/server";
import { chatStream } from "@/lib/chatbot";

export async function POST(req: NextRequest) {
  const { message, sessionId } = await req.json();

  const stream = await chatStream(sessionId, message);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}