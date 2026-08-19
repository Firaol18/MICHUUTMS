import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { PublicNavbar } from './PublicNavbar';
import { PublicFooter } from './PublicFooter';
import { ChatbotWidget } from '@tms/shared/components/common/ChatbotWidget';
import { useUIStore } from '@tms/shared/store/useUIStore';

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
      <PublicFooter />
      {/* Global AI Chatbot Support Widget */}
      <ChatbotWidget />
    </div>
  );
};
