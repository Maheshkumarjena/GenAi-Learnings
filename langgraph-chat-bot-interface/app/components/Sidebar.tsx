"use client";

export default function Sidebar({
  chats,
  currentChat,
  setCurrentChat,
  createNewChat,
}: any) {
  return (
    <div className="w-64 sticky top-0 bg-[#202123] text-white h-screen p-3">
      <button
        onClick={createNewChat}
        className="w-full mb-4 bg-[#343541] p-2 rounded"
      >
        + New Chat
      </button>

      <div className="space-y-2">
        {chats.map((chatId: string) => (
          <div
            key={chatId}
            onClick={() => setCurrentChat(chatId)}
            className={`p-2 rounded cursor-pointer ${
              currentChat === chatId ? "bg-[#343541]" : ""
            }`}
          >
            {chatId}
          </div>
        ))}
      </div>
    </div>
  );
}