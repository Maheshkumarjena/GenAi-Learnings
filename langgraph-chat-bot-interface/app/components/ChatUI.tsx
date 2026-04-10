"use client";

import { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatUI({ sessionId }: { sessionId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to the bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Load previous chat history
  useEffect(() => {
    async function loadMessages() {
      setLoadingChat(true);
      try {
        const res = await fetch(
          `/api/chat/history?sessionId=${sessionId}`
        );
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (error) {
        console.error("Failed to load chat history:", error);
      } finally {
        setLoadingChat(false);
      }
    }

    loadMessages();
  }, [sessionId]);

  // Send a message and stream AI response
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    // Add user message to UI
    setMessages((prev) => [...prev, userMessage]);

    const messageToSend = input;
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          message: messageToSend,
          sessionId,
        }),
      });

      if (!res.body) throw new Error("Streaming not supported.");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let aiMessage: Message = {
        role: "assistant",
        content: "",
      };

      // Add placeholder for streaming response
      setMessages((prev) => [...prev, aiMessage]);

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode incoming chunk
        buffer += decoder.decode(value, { stream: true });

        // Process SSE messages
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.replace("data: ", "").trim();

            // Skip termination signals
            if (data === "[DONE]") {
              setLoading(false);
              return;
            }

            // Append streamed text
            aiMessage.content += data;

            // Update the last message in state
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = { ...aiMessage };
              return updated;
            });
          }
        }
      }
    } catch (error) {
      console.error("Streaming error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-[#343541] text-white">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {loadingChat && (
          <div className="text-gray-400">Loading chat history...</div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-3 rounded-xl max-w-[70%] whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-[#19c37d] text-black"
                  : "bg-[#444654]"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-gray-400 italic">
            Thinking...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Section */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <input
            className="flex-1 p-3 bg-[#40414f] rounded outline-none"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && !loading && sendMessage()
            }
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-[#19c37d] px-4 rounded text-black font-medium disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}