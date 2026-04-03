'use client';

import { useState, useRef, useEffect } from 'react';
import { FiSend, FiMessageSquare, FiX, FiMic, FiMinimize2 } from 'react-icons/fi';
import axios from 'axios';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatBotProps {
  lat: number;
  lon: number;
}

export default function ChatBot({ lat, lon }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! 👋 I'm your Air Quality assistant. Ask me anything about air pollution, health impacts, or safety recommendations!",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Call backend API
      const response = await axios.post(
        'http://localhost:8000/chat',
        {
          message: inputValue,
          lat: lat,
          lon: lon,
        }
      );

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.reply || 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '❌ Unable to connect to the server. Please try again later.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        text: "Hi! 👋 I'm your Air Quality assistant. Ask me anything about air pollution, health impacts, or safety recommendations!",
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
  };

  // Chat Closed State
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full p-4 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 z-40 flex items-center gap-2 font-semibold"
      >
        <FiMessageSquare size={24} />
        <span className="hidden sm:inline">Chat with AI</span>
      </button>
    );
  }

  // Chat Minimized State
  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full p-4 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 z-40"
      >
        <FiMessageSquare size={24} />
      </button>
    );
  }

  // Full Chat Window
  return (
    <div className="fixed bottom-6 right-6 w-96 max-h-[600px] bg-white rounded-2xl shadow-2xl flex flex-cols overflow-hidden z-50 flex-col border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-5 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg">Air Quality ChatBot 🌍</h3>
          <p className="text-xs opacity-90">Powered by Gemini AI</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="hover:bg-white/20 p-2 rounded transition"
            title="Minimize"
          >
            <FiMinimize2 size={18} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-white/20 p-2 rounded transition"
            title="Close"
          >
            <FiX size={18} />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            } animate-fadeIn`}
          >
            <div
              className={`max-w-xs px-4 py-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
              } shadow-sm`}
            >
              <p className="text-sm leading-relaxed">{message.text}</p>
              <span
                className={`text-xs mt-2 block ${
                  message.sender === 'user'
                    ? 'text-blue-100'
                    : 'text-gray-500'
                }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 border border-gray-200 px-4 py-3 rounded-lg rounded-bl-none">
              <div className="flex gap-2">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        {/* Quick suggestions */}
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            onClick={() => setInputValue('What is the current AQI?')}
            className="text-xs bg-gray-100 hover:bg-blue-100 text-gray-700 px-3 py-1 rounded-full transition"
          >
            AQI Info?
          </button>
          <button
            onClick={() => setInputValue('Is it safe to go outside?')}
            className="text-xs bg-gray-100 hover:bg-blue-100 text-gray-700 px-3 py-1 rounded-full transition"
          >
            Safe Outside?
          </button>
          <button
            onClick={() => setInputValue('What precautions should I take?')}
            className="text-xs bg-gray-100 hover:bg-blue-100 text-gray-700 px-3 py-1 rounded-full transition"
          >
            Precautions?
          </button>
        </div>

        {/* Input form */}
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about air quality..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg p-2 transition transform hover:scale-105"
            title="Send message"
          >
            <FiSend size={20} />
          </button>
        </form>

        {/* Clear button */}
        <button
          onClick={clearChat}
          className="w-full mt-2 text-xs text-gray-500 hover:text-gray-700 transition"
        >
          Clear chat history
        </button>
      </div>

      {/* Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounce {
          0%, 80%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          40% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
}
