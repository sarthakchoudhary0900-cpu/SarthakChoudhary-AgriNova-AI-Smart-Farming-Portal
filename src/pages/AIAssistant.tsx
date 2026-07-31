import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Send, Mic, MicOff, User, Sparkles, Trash2, Loader2,
} from 'lucide-react';
import { streamAIResponse } from '@/services/aiAssistant';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import type { ChatMessage } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';

const suggestions = [
  'What crop should I grow this season?',
  'How to treat tomato leaf blight?',
  'Best fertilizer for wheat?',
  'Tell me about PM-KISAN scheme',
  'How to improve soil health organically?',
  'When should I irrigate my paddy field?',
];

export function AIAssistant() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { transcript, isListening, isSupported, startListening, stopListening, reset } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(20);
      if (data && data.length > 0) setMessages(data as ChatMessage[]);
      setHistoryLoaded(true);
    })();
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading, streamingText]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    setInput('');
    reset();

    const userMsg: ChatMessage = {
      id: 'temp-' + Date.now(),
      user_id: user?.id ?? '',
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setStreamingText('');

    if (user) {
      await supabase.from('chat_history').insert({ user_id: user.id, role: 'user', content: text });
    }

    let fullResponse = '';
    try {
      fullResponse = await streamAIResponse(text, messages, (chunk) => {
        setStreamingText((prev) => prev + chunk);
      });
    } catch {
      fullResponse = 'Sorry, I encountered an error. Please try again.';
      setStreamingText(fullResponse);
    }

    const aiMsg: ChatMessage = {
      id: 'temp-ai-' + Date.now(),
      user_id: user?.id ?? '',
      role: 'assistant',
      content: fullResponse,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, aiMsg]);
    setStreamingText('');
    setLoading(false);

    if (user) {
      await supabase.from('chat_history').insert({ user_id: user.id, role: 'assistant', content: fullResponse });
    }
  };

  const handleVoice = () => {
    if (!isSupported) {
      toast('Voice input is not supported in your browser.', 'error');
      return;
    }
    if (isListening) stopListening();
    else startListening();
  };

  const clearChat = async () => {
    if (!user) return;
    await supabase.from('chat_history').delete().eq('user_id', user.id);
    setMessages([]);
    toast('Chat history cleared.', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-forest-800 dark:text-brand-50">AI Farming Assistant</h1>
          <p className="text-forest-500 dark:text-brand-200/60 mt-2">Ask me anything about farming — crops, weather, diseases, schemes, and more.</p>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} className="btn-ghost !py-2 !px-3 text-sm">
            <Trash2 size={16} /> Clear
          </button>
        )}
      </motion.div>

      <GlassCard className="!p-0 overflow-hidden flex flex-col h-[600px]">
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && !loading && historyLoaded ? (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-forest-600 flex items-center justify-center shadow-glow mb-4">
                <Bot className="text-white" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-forest-700 dark:text-brand-100">How can I help you today?</h3>
              <p className="text-sm text-forest-500 dark:text-brand-200/60 mt-2 mb-6 text-center max-w-md">
                I'm your AI farming assistant. Try one of these suggestions or ask your own question.
              </p>
              <div className="grid gap-2 sm:grid-cols-2 w-full max-w-lg">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-left p-3 rounded-xl bg-brand-50 dark:bg-forest-800/40 hover:bg-brand-100 dark:hover:bg-forest-800/60 transition text-sm text-forest-700 dark:text-brand-100"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-forest-500 to-brand-600'
                      : 'bg-gradient-to-br from-brand-500 to-forest-600'
                  }`}>
                    {msg.role === 'user' ? <User className="text-white" size={18} /> : <Bot className="text-white" size={18} />}
                  </div>
                  <div className={`max-w-[80%] p-3.5 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white rounded-tr-sm'
                      : 'bg-brand-50 dark:bg-forest-800/60 text-forest-700 dark:text-brand-100 rounded-tl-sm'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}

              {/* Streaming message */}
              {(loading || streamingText) && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-forest-600 flex items-center justify-center shrink-0">
                    <Bot className="text-white" size={18} />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-brand-50 dark:bg-forest-800/60 rounded-tl-sm">
                    {streamingText ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {streamingText}
                        <span className="inline-block w-1.5 h-4 bg-brand-500 ml-0.5 animate-pulse" />
                      </p>
                    ) : (
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-forest-200/40 dark:border-brand-400/10 p-4">
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
            className="flex items-center gap-2"
          >
            {isSupported && (
              <button
                type="button"
                onClick={handleVoice}
                className={`p-3 rounded-xl transition shrink-0 ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'glass-soft hover:bg-white/70 dark:hover:bg-forest-800/60'
                }`}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} className="text-forest-600 dark:text-brand-200" />}
              </button>
            )}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? 'Listening...' : 'Ask about crops, weather, diseases...'}
              className="glass-input flex-1"
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()} className="btn-primary !px-4 disabled:opacity-50 shrink-0">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            </button>
          </form>
          <p className="text-xs text-forest-400 dark:text-brand-200/40 mt-2 flex items-center gap-1.5">
            <Sparkles size={12} /> Powered by Gemini AI • Responses are for guidance only
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
