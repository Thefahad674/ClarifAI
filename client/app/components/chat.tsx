"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface Doc {
  pageContent: string;
  metadata?: {
    loc?: { pageNumber?: number };
    source?: string;
  };
}

interface IMessage {
  role: "assistant" | "user";
  content?: string;
  documents?: Doc[];
}

const ChatComponent: React.FC = () => {
  const [message, setMessage] = React.useState<string>("");
  const [messages, setMessages] = React.useState<IMessage[]>([]);
  const [loading, setLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const handleSendChatMessage = async () => {
    if (!message.trim()) return;

    const currentMessage = message;
    setMessage("");
    setMessages((prev) => [...prev, { role: "user", content: currentMessage }]);
    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:8000/chat?message=${encodeURIComponent(
          currentMessage
        )}`
      );
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data?.message,
          documents: data?.docs,
        },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: " Something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll to bottom
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-neutral-00 via-black to-neutral-950 border-none m-6 ">
      {/* Scrollable chat messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 overflow-y-scroll [scrollbar-width:none] h-full">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <Card
              className={`max-w-[80%] max-h-[100%] shadow-md ${
                msg.role === "user"
                  ? " flex items-center justify-center bg-indigo-800 text-white border-none"
                  : "bg-neutral-800 text-gray-200 border-none"
              }`}
            >
              <CardContent className="p-3">
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {/* {msg.role === "assistant" && msg.documents && (
                  <div className="mt-2 border-t border-gray-700 pt-2 text-xs text-gray-400">
                    <p className="font-semibold">Sources:</p>
                    <ul className="list-disc list-inside">
                      {msg.documents.map((doc, i) => (
                        <li key={i}>
                          Page {doc.metadata?.loc?.pageNumber ?? "?"}:{" "}
                          {doc.pageContent.slice(0, 60)}...
                        </li>
                      ))}
                    </ul>
                  </div>
                )} */}
              </CardContent>
            </Card>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <Card className="bg-neutral-800 text-gray-200 max-w-[60%] shadow-md">
              <CardContent className="p-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                <span>Assistant is typing...</span>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="flex gap-3  p-3 border-t border-none shadow-lg w-full m-5 rounded-2xl">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
          type="text"
          placeholder="Type your query here..."
          className="flex-1 bg-neutral-800 border-neutral-700 text-white placeholder-gray-400"
        />
        <Button
          onClick={handleSendChatMessage}
          disabled={!message.trim() || loading}
          className="bg-indigo-800 hover:bg-indigo-900 text-white"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send"}
        </Button>
      </div>
    </div>
  );
};

export default ChatComponent;
