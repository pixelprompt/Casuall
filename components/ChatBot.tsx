
import React, { useState, useRef, useEffect } from 'react';
import { getGeminiResponse } from '../services/geminiService';
import { ChatMessage } from '../types';

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Mission Control AI online. How can I assist your workflow today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    const response = await getGeminiResponse(userMsg);
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Chat window */}
      <div className={`transition-all duration-500 ease-in-out transform origin-bottom-right mb-6 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        <div className="w-80 md:w-96 glass border-blue-500/30 rounded-lg overflow-hidden flex flex-col h-[500px] shadow-2xl">
          {/* Header */}
          <div className="p-4 bg-blue-500/10 border-b border-blue-500/20 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_#60a5fa]" />
              <span className="mono text-xs font-bold uppercase tracking-wider text-blue-400">Mission Agent Alpha</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-grow p-4 overflow-y-auto space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 text-sm ${m.role === 'user' ? 'bg-blue-500/20 text-blue-100 rounded-l-lg rounded-tr-lg border border-blue-500/30' : 'bg-zinc-800/50 text-zinc-300 rounded-r-lg rounded-tl-lg border border-zinc-700'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/5 bg-zinc-900/50">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Query system..."
                className="flex-grow bg-black/50 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50 mono text-blue-100"
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="bg-blue-600/20 border border-blue-500/50 hover:bg-blue-600/40 text-blue-400 w-10 h-10 flex items-center justify-center rounded transition-all active:scale-95"
              >
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Button - Matches screenshot's vibrant blue brain button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all duration-300 shadow-[0_0_30px_rgba(59,130,246,0.5)] relative group overflow-hidden ${isOpen ? 'bg-zinc-900 border border-white/20 rotate-90' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/40'}`}
      >
        <div className="absolute inset-0 rounded-full bg-blue-400 opacity-20 blur-md group-hover:opacity-40 transition-opacity" />
        {isOpen ? <i className="fa-solid fa-xmark"></i> : <i className="fa-solid fa-brain"></i>}
      </button>
    </div>
  );
};

export default ChatBot;
