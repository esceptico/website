'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  XMarkIcon,
  RocketLaunchIcon,
  HeartIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';

// Dynamic import with SSR disabled
const AIChat = dynamic(() => import('./AIChat').then(mod => mod.AIChat), {
  ssr: false,
  loading: () => null
});

interface Command {
  id: string;
  name: string;
  description?: string;
  icon?: React.ReactNode;
  action: () => void;
}

export const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showTeaMessage, setShowTeaMessage] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    {
      id: 'coffee',
      name: 'Buy me a coffee',
      description: 'Please?',
      icon: <HeartIcon className="w-5 h-5" />,
      action: () => {
        setShowTeaMessage(true);
        setTimeout(() => {
          setShowTeaMessage(false);
          setIsOpen(false);
        }, 2000);
      }
    },
    {
      id: 'ai-chat',
      name: 'Ask AI',
      description: 'It\'s a bit rude...',
      icon: <SparklesIcon className="w-5 h-5" />,
      action: () => {
        setShowAIChat(true);
        setIsOpen(false);
      }
    },
    {
      id: 'resume',
      name: 'Download Resume',
      description: 'Get my latest CV',
      icon: <RocketLaunchIcon className="w-5 h-5" />,
      action: () => {
        window.open('/resume.pdf', '_blank');
        setIsOpen(false);
      }
    },
    {
      id: '404',
      name: '404',
      description: 'Eh?',
      icon: <XMarkIcon className="w-5 h-5" />,
      action: () => {
        window.open('/404', '_blank');
        setIsOpen(false);
      }
    }
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.name.toLowerCase().includes(search.toLowerCase()) ||
    cmd.description?.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle with Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      
      // Close with Escape
      if (e.key === 'Escape') {
        setIsOpen(false);
      }

      // Navigate with arrow keys
      if (isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
        } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
          e.preventDefault();
          filteredCommands[selectedIndex].action();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSearch('');
      setSelectedIndex(0);
      setShowTeaMessage(false);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100]"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Command Palette - positioned higher */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className={`fixed inset-x-0 top-[35%] -translate-y-1/2 mx-auto ${
                showTeaMessage ? 'w-[80%] max-w-sm' : 'w-[90%] max-w-2xl'
              } bg-[var(--theme-bg-primary)] border border-[var(--theme-border)] rounded-lg shadow-2xl z-[101] overflow-hidden`}
            >
              {/* Search Input */}
              {!showTeaMessage && (
                <div className="flex items-center px-4 py-3 border-b border-[var(--theme-border)]">
                  <MagnifyingGlassIcon className="w-5 h-5 text-[var(--theme-text-secondary)] mr-3" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Type a command or search..."
                    className="flex-1 bg-transparent outline-none text-[var(--theme-text-primary)] placeholder-[var(--theme-text-secondary)]"
                  />
                  <button
                    onClick={() => setIsOpen(false)}
                    className="ml-3 text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Commands List */}
              <div className="max-h-96 overflow-y-auto py-2">
                {showTeaMessage ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="px-4 py-8 text-center"
                  >
                    <div className="text-[var(--theme-text-primary)] font-medium text-lg">
                      dude, I only drink tea 🍵
                    </div>
                  </motion.div>
                ) : filteredCommands.length === 0 ? (
                  <div className="px-4 py-8 text-center text-[var(--theme-text-secondary)]">
                    No commands found
                  </div>
                ) : (
                  filteredCommands.map((cmd, index) => (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full px-4 py-3 flex items-center justify-between transition-colors ${
                        selectedIndex === index
                          ? 'bg-[var(--theme-border)] bg-opacity-20'
                          : 'hover:bg-[var(--theme-border)] hover:bg-opacity-10'
                      }`}
                    >
                      <div className="flex items-center">
                        {cmd.icon && (
                          <span className="mr-3 text-[var(--theme-text-secondary)]">
                            {cmd.icon}
                          </span>
                        )}
                        <div className="text-left">
                          <div className="text-[var(--theme-text-primary)] font-medium">
                            {cmd.name}
                          </div>
                          {cmd.description && (
                            <div className="text-sm text-[var(--theme-text-secondary)]">
                              {cmd.description}
                            </div>
                          )}
                        </div>
                      </div>
                      {selectedIndex === index && (
                        <span className="text-xs text-[var(--theme-text-secondary)]">
                          Press Enter
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Footer */}
              {!showTeaMessage && (
                <div className="px-4 py-2 border-t border-[var(--theme-border)] text-xs text-[var(--theme-text-secondary)] flex justify-between">
                  <span>Navigate with ↑↓ • Select with Enter</span>
                  <span>Press Esc to close</span>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* AI Chat Component */}
      <AIChat isOpen={showAIChat} onClose={() => setShowAIChat(false)} />
    </>
  );
}; 