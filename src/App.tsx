import React from 'react';
import { AppRouter } from '@/router/AppRouter';
import { ToastContainer } from '@/components/common/ToastContainer';

export const App: React.FC = () => {
  return (
    <>
      <AppRouter />
      <ToastContainer />
    </>
  );
};

export default App;
