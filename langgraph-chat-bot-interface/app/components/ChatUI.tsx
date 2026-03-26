"use client";

import { useEffect, useRef, useState } from "react";

export default function ChatUI({ sessionId }: { sessionId: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<any>(null);
  const [loadingChat, setLoadingChat] = useState(false);

  useEffect(() => {
    async function loadMessages() {
      setLoadingChat(true);

      const res = await fetch(`/api/chat/history?sessionId=${sessionId}`);
      const data = await res.json();

      setMessages(data.messages || []);
      setLoadingChat(false);
    }

    loadMessages();
  }, [sessionId]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        message: input,
        sessionId,
      }),
    });

    const reader = res.body?.getReader();
    let aiMessage = { role: "assistant", content: "" };

    setMessages((prev) => [...prev, aiMessage]);

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;

      const chunk = new TextDecoder().decode(value);

      aiMessage.content += chunk;

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...aiMessage };
        return updated;
      });
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col flex-1 bg-[#343541] text-white">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-3 rounded-xl max-w-[70%] ${
                msg.role === "user"
                  ? "bg-[#19c37d] text-black"
                  : "bg-[#444654]"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && <div className="text-gray-400">Thinking...</div>}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <input
            className="flex-1 p-3 bg-[#40414f] rounded"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-[#19c37d] px-4 rounded text-black"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}