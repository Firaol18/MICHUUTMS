import React, { useState, useRef, useEffect } from 'react';
import { useLanguageStore } from '@tms/shared/store/useLanguageStore';
import { MessageSquare, X, Send, Bot } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

const FAQ_KNOWLEDGE_BASE = [
  {
    keywords: ['danakil', 'simien', 'season', 'best time', 'weather'],
    reply: 'The best time to visit Ethiopia’s highlands (Simien, Lalibela) and Danakil is October to February (Dry Season). Rains occur June–September.',
  },
  {
    keywords: ['payment', 'telebirr', 'cbe', 'card', 'bank', 'pay'],
    reply: 'We accept Telebirr, CBE Birr, Visa / Mastercard, and Direct Bank Transfer across all tour packages and hotel bookings.',
  },
  {
    keywords: ['visa', 'passport', 'entry', 'e-visa'],
    reply: 'International tourists can obtain an Ethiopian Tourist E-Visa online at evisa.gov.et prior to departure. Processing takes 24–48 hours.',
  },
  {
    keywords: ['4x4', 'transport', 'car', 'land cruiser', 'charter'],
    reply: 'Yes! You can add private 4x4 Toyota Land Cruiser charters with professional English-speaking drivers directly in your booking cart.',
  },
  {
    keywords: ['guide', 'ranger', 'abebe', 'safari'],
    reply: 'All MICHUU expeditions include certified, multilingual Ethiopian Eco-Ranger Guides fluent in Amharic, Oromo, and English.',
  },
];

export const ChatbotWidget: React.FC = () => {
  const { currentLanguage } = useLanguageStore();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');

  const welcomeText =
    currentLanguage === 'om'
      ? 'Akkam! Baga nagaan dhuftan. Akkamitti imala Itoophiyaa keessan har\'a isin gargaaruu?'
      : currentLanguage === 'am'
        ? 'ሰላም! እንኳን ደህና መጡ። የኢትዮጵያ ጉዞዎን ዛሬ እንዴት ልርዳዎት?'
        : 'Hello & Welcome! I am MICHUU AI. How can I assist your Ethiopian travel plans today?';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: welcomeText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputMsg.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMsg('');

    // Generate intelligent AI response
    setTimeout(() => {
      const lower = text.toLowerCase();
      let matched = FAQ_KNOWLEDGE_BASE.find((k) => k.keywords.some((kw) => lower.includes(kw)));

      let botReply = matched
        ? matched.reply
        : 'Thank you for contacting MICHUU! Our travel concierge has received your request. You can also reach us directly at concierge@michuutours.et or +251 911 00 22 33.';

      const botMsg: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: 'bot',
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  return (
    <>
      {/* Floating Chat Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 999,
          width: 54,
          height: 54,
          borderRadius: '50%',
          backgroundColor: '#2563eb',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 6px 20px rgba(37, 99, 235, 0.28), 0 2px 6px rgba(0, 0, 0, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 99, 235, 0.38), 0 4px 8px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.28), 0 2px 6px rgba(0, 0, 0, 0.12)';
        }}
        title="Live Travel Concierge & AI Assistance"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Floating Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '88px',
            right: '24px',
            zIndex: 999,
            width: '380px',
            maxWidth: 'calc(100vw - 2rem)',
            height: '520px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Chat Window Header */}
          <div
            style={{
              padding: '1rem 1.25rem',
              background: 'linear-gradient(135deg, var(--brand-primary) 0%, #06b6d4 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={22} style={{ color: '#ffffff' }} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)' }}>
                  MICHUU Concierge AI
                </div>
                <div style={{ fontSize: '10px', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#4ade80' }} />
                  Online • Amharic / Oromiffa / English
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{ color: '#ffffff', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Body */}
          <div
            style={{
              flex: 1,
              padding: '1rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.875rem',
              backgroundColor: 'var(--bg-primary)',
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                }}
              >
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: msg.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    backgroundColor: msg.sender === 'user' ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                    color: msg.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                    fontSize: 'var(--font-size-xs)',
                    lineHeight: 1.5,
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  {msg.text}
                </div>
                <div
                  style={{
                    fontSize: '9px',
                    color: 'var(--text-muted)',
                    marginTop: '0.2rem',
                    textAlign: msg.sender === 'user' ? 'right' : 'left',
                  }}
                >
                  {msg.timestamp}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Quick FAQ Suggestion Chips */}
          <div
            style={{
              padding: '0.5rem 0.75rem',
              borderTop: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              display: 'flex',
              gap: '0.35rem',
              overflowX: 'auto',
            }}
          >
            <button
              onClick={() => handleSend('Best season to visit Danakil & Simien?')}
              style={{
                fontSize: '10px',
                padding: '0.25rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-secondary)',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              ☀️ Best Season?
            </button>

            <button
              onClick={() => handleSend('Payment methods accepted?')}
              style={{
                fontSize: '10px',
                padding: '0.25rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-secondary)',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              💳 Payment Methods?
            </button>

            <button
              onClick={() => handleSend('Ethiopian Tourist E-Visa info?')}
              style={{
                fontSize: '10px',
                padding: '0.25rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-secondary)',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              🛂 E-Visa?
            </button>
          </div>

          {/* Chat Input Field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: '0.75rem',
              backgroundColor: 'var(--bg-secondary)',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              gap: '0.5rem',
            }}
          >
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Ask a question..."
              style={{
                flex: 1,
                padding: '0.5rem 0.875rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: 'var(--font-size-xs)',
              }}
            />
            <button
              type="submit"
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                backgroundColor: 'var(--brand-primary)',
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
