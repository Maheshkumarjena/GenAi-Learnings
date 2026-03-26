"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatUI from "./components/ChatUI";

export default function Page() {
  const [chats, setChats] = useState<string[]>(["chat-1"]);
  const [currentChat, setCurrentChat] = useState("chat-1");

  const createNewChat = () => {
    const newId = `chat-${Date.now()}`;
    setChats((prev) => [...prev, newId]);
    setCurrentChat(newId);
  };

  return (
    <div className="flex">
      <Sidebar
        chats={chats}
        currentChat={currentChat}
        setCurrentChat={setCurrentChat}
        createNewChat={createNewChat}
      />

      <ChatUI sessionId={currentChat} />
    </div>
  );
}