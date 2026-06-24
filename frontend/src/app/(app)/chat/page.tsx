'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User, HeartPulse, Loader2 } from 'lucide-react';
import { sendMessage } from '@/services/chat';
import { useAuth } from '@/features/auth/AuthProvider';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello ${user?.name || 'there'}! I'm your ClariMed AI Health Assistant. I have context of your uploaded clinical reports and biomarker trends. How can I help you today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessage(userMessage.content);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.reply
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col pb-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-50 flex items-center">
          <Bot className="mr-3 h-8 w-8 text-blue-600" />
          AI Health Assistant
        </h1>
        <p className="text-gray-500 mt-2">Ask questions about your health, lab reports, and biomarkers.</p>
      </div>

      <Card className="flex-1 flex flex-col border-0 ring-1 ring-gray-200 dark:ring-zinc-800 overflow-hidden bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl h-full">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="h-10 w-10 shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <HeartPulse className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
                
                <div className={`max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-sm' 
                    : 'bg-white dark:bg-zinc-900 ring-1 ring-gray-200 dark:ring-zinc-800 text-gray-800 dark:text-zinc-200 rounded-tl-sm'
                }`}>
                  <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
                    {msg.content}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="h-10 w-10 shrink-0 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                )}
              </motion.div>
            ))}
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="flex gap-4 justify-start"
              >
                <div className="h-10 w-10 shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <HeartPulse className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="max-w-[75%] rounded-2xl px-5 py-4 bg-white dark:bg-zinc-900 ring-1 ring-gray-200 dark:ring-zinc-800 rounded-tl-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  <span className="text-sm text-gray-500">Analyzing clinical data...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-gray-50/50 dark:bg-zinc-900/50 border-t border-gray-100 dark:border-zinc-800">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your vitamin D levels, cholesterol, or recent trends..."
              className="pr-14 h-14 rounded-full bg-white dark:bg-zinc-950 border-gray-200 dark:border-zinc-800 shadow-sm text-[15px]"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon"
              className="absolute right-2 h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700 transition-all shrink-0"
              disabled={!input.trim() || isLoading}
            >
              <Send className="h-4 w-4 text-white ml-0.5" />
            </Button>
          </form>
          <div className="text-center mt-3">
            <span className="text-[11px] text-gray-400 font-medium tracking-wide">
              AI-generated clinical guidance. Always consult your physician.
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
