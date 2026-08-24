import React from 'react';
import { AdminRouter } from '@/router/AdminRouter';
import { ToastContainer } from '@tms/shared/components/common/ToastContainer';

export const App: React.FC = () => {
  return (
    <>
      <AdminRouter />
      <ToastContainer />
    </>
  );
};

export default App;
