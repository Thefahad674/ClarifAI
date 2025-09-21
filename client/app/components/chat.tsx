"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { LoaderFive } from "@/components/ui/loader";
 

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
        `https://clarifai-jm7e.onrender.com/chat?message=${encodeURIComponent(
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

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <div className="flex flex-col h-full bg-black  border-none m-6">
      {/* Scrollable chat messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 [scrollbar-width:none] h-[40vh] rounded-2xl space-y-4"
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex p-2 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <Card
              className={`max-w-[80%] max-h-[100%] shadow-md ${
                msg.role === "user"
                  ? "shadow-[5px_5px_rgba(8,_112,_184,_0.4),_10px_10px_rgba(8,_112,_184,_0.3),_15px_15px_rgba(8,_112,_184,_0.2),_20px_20px_rgba(8,_112,_184,_0.1),_25px_25px_rgba(8,_112,_184,_0.05)] text-white bg-transparent"
                  : "shadow-[-5px_5px_rgba(66,_66,_66,_0.4),_-10px_10px_rgba(66,_66,_66,_0.3),_-15px_15px_rgba(66,_66,_66,_0.2),_-20px_20px_rgba(66,_66,_66,_0.1),_-25px_25px_rgba(66,_66,_66,_0.05)] text-gray-200 bg-transparent"
              }`}
            >
              <CardContent className="p-3">
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </CardContent>
            </Card>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <Card className="bg-transparent max-w-[60%] shadow-[-5px_5px_rgba(66,_66,_66,_0.4),_-10px_10px_rgba(66,_66,_66,_0.3),_-15px_15px_rgba(66,_66,_66,_0.2),_-20px_20px_rgba(66,_66,_66,_0.1),_-25px_25px_rgba(66,_66,_66,_0.05)]">
              <CardContent className="p-3 flex items-center gap-2">
                <LoaderFive text="Generating chat..." />
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="flex gap-3 p-3 w-full m-5 rounded-2xl">
        <Input
          suppressHydrationWarning
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
          type="text"
          placeholder="Type your query here..."
          className="text-white bg-transparent border-none focus:ring-0 focus:outline-none placeholder-gray-500 flex-grow"
        />
        <Button
        suppressHydrationWarning
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
