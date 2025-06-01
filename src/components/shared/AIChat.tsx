'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIChat = ({ isOpen, onClose }: AIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: `You are a helpful AI assistant embedded in a developer's portfolio website. You represent the developer who:
      - Works with Next.js, React, TypeScript, Node.js, and modern web technologies
      - Has experience with system design and architecture
      - Contributes to open source projects
      - Strongly prefers tea over coffee 🍵
      - Values clean code and good developer experience
      Keep responses concise, friendly, and helpful. You can answer questions about the developer's work, skills, and projects.`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when opened and handle Escape key
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure component is fully rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.message 
        }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "I'm having trouble connecting right now. Please try again later." 
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Oops! Something went wrong. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    "What technologies do you work with?",
    "Tell me about your projects",
    "Coffee or tea?",
    "What's your favorite programming language?"
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="fixed inset-x-4 bottom-4 md:inset-auto md:right-8 md:bottom-8 md:w-[420px] 
                     bg-[var(--theme-bg-primary)] backdrop-blur-xl bg-opacity-95
                     shadow-2xl shadow-black/20 dark:shadow-black/50
                     border border-[var(--theme-border)] border-opacity-50
                     z-[102] overflow-hidden rounded-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4">
            <h3 className="text-sm font-medium text-[var(--theme-text-secondary)]">
              Assistant
            </h3>
            <button
              onClick={onClose}
              className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] 
                       text-xl leading-none opacity-50 hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div ref={messagesContainerRef}
               className="h-[400px] overflow-y-auto px-6 py-4 space-y-6"
               style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--theme-border) transparent' }}>
            {messages.length === 1 && (
              <div className="text-center py-12">
                <p className="text-[var(--theme-text-secondary)] mb-8 text-sm opacity-60">
                  Start a conversation
                </p>
                <div className="flex flex-col gap-3 max-w-xs mx-auto">
                  {suggestedQuestions.map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInput(question);
                        inputRef.current?.focus();
                      }}
                      className="text-sm text-left px-4 py-3 rounded-xl
                               bg-[var(--theme-border)] bg-opacity-5 
                               hover:bg-opacity-10 transition-all
                               text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)]"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {messages.slice(1).map((message, idx) => (
              <div
                key={idx}
                className="group"
              >
                <div className={`${
                  message.role === 'user' ? 'text-right' : 'text-left'
                }`}>
                  <p className={`text-sm leading-relaxed inline-block max-w-[85%] ${
                    message.role === 'user' 
                      ? 'text-[var(--theme-text-primary)]' 
                      : 'text-[var(--theme-text-secondary)]'
                  }`}>
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="text-left">
                <div className="inline-flex gap-1">
                  <span className="w-2 h-2 bg-[var(--theme-text-secondary)] rounded-full animate-bounce opacity-20" 
                        style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-[var(--theme-text-secondary)] rounded-full animate-bounce opacity-20" 
                        style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-[var(--theme-text-secondary)] rounded-full animate-bounce opacity-20" 
                        style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="px-6 py-4 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              disabled={isLoading}
              placeholder="Send a message..."
              className="w-full px-4 py-3 bg-[var(--theme-border)] bg-opacity-10
                       rounded-xl outline-none transition-all
                       text-[var(--theme-text-primary)] placeholder-[var(--theme-text-secondary)]
                       disabled:opacity-50 text-sm
                       focus:bg-opacity-20"
            />
            <div className="absolute right-10 top-1/2 -translate-y-1/2 text-xs text-[var(--theme-text-secondary)] opacity-30">
              {!isLoading && input.length > 0 && "⌘↵"}
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 