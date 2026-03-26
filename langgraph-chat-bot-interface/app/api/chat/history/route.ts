import { NextRequest, NextResponse } from "next/server";
import { getSessionMessages } from "@/lib/chatbot";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  const messages = getSessionMessages(sessionId);

  return NextResponse.json({ messages });
}