import { useEffect, useRef, useState } from "react";
import { Bot, Mic, MicOff, Send } from "lucide-react";

interface ChatbotWidgetProps {
  context?: string;
}

export default function ChatbotWidget({ context }: ChatbotWidgetProps = {}) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [listening, setListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const recRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    if (!text.trim()) return;
    const mine = { role: "user" as const, text };
    setMessages((m) => [...m, mine]);
    setInput("");
    setIsTyping(true);
    
    const start = Date.now();
    try {
      const res = await fetch("/api/chat", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ 
          message: text,
          context: context 
        }) 
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      const latency = Date.now() - start;
      
      setMessages((m) => [...m, { 
        role: "assistant", 
        text: `${data.answer} (≈${Math.max(data.latency, latency)}ms)` 
      }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((m) => [...m, { 
        role: "assistant", 
        text: "Sorry, I'm having trouble connecting right now. Please try again." 
      }]);
    } finally {
      setIsTyping(false);
    }
  }

  function toggleVoice() {
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) { alert("Speech Recognition not supported in this browser."); return; }
    if (listening) {
      recRef.current?.stop(); setListening(false); return;
    }
    const rec = new SR(); recRef.current = rec; rec.lang = "en-US"; rec.continuous = false; rec.interimResults = false;
    rec.onresult = (e: any) => { const t = e.results[0][0].transcript; send(t); setListening(false); };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start(); setListening(true);
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-2 mb-3">
        <Bot className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">AI Chatbot</h3>
        <div className="ml-auto">
          <div className="text-xs text-foreground/60 bg-primary/10 px-2 py-1 rounded">
            Powered by Gemini 2.0
          </div>
        </div>
      </div>
      
      <div className="space-y-3 max-h-64 overflow-auto border rounded p-3 bg-secondary/30">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-lg px-3 py-2 ${
              m.role === "user" 
                ? "bg-primary text-primary-foreground" 
                : "bg-background border shadow-sm"
            }`}>
              <div className="text-sm whitespace-pre-wrap">{m.text}</div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-background border shadow-sm rounded-lg px-3 py-2">
              <div className="flex items-center gap-1 text-sm text-foreground/60">
                <Bot className="w-4 h-4" />
                <span>AI is thinking</span>
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {messages.length === 0 && !isTyping && (
          <div className="text-center py-4">
            <Bot className="w-8 h-8 text-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-foreground/60">
              I can help with coding, DevOps, and best practices.
            </p>
            <p className="text-xs text-foreground/40 mt-1">
              Ask me about React, Docker, or Kubernetes.
            </p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="mt-3 flex gap-2">
        <input 
          className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Type your question..." 
          onKeyDown={(e) => { 
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          disabled={isTyping}
        />
        <button 
          onClick={() => send(input)} 
          disabled={!input.trim() || isTyping}
          className="rounded-md bg-primary text-primary-foreground px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
        <button 
          onClick={toggleVoice} 
          disabled={isTyping}
          className={`rounded-md px-3 py-2 transition-colors ${
            listening 
              ? "bg-red-500 text-white hover:bg-red-600" 
              : "bg-secondary text-foreground hover:bg-secondary/80"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
