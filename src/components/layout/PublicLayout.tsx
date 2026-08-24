import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { PublicNavbar } from './PublicNavbar';
import { PublicFooter } from './PublicFooter';
import { NewsletterSection } from '@/components/common/NewsletterSection';
import { ChatbotWidget } from '@/components/common/ChatbotWidget';
import { useUIStore } from '@/store/useUIStore';

export const PublicLayout: React.FC = () => {
  const { theme } = useUIStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <PublicNavbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      {/* Universal Newsletter Section above footer across all public pages */}
      <NewsletterSection />
      <PublicFooter />
      {/* Global AI Chatbot Support Widget */}
      <ChatbotWidget />
    </div>
  );
};
