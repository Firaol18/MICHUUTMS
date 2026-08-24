import React from 'react';
import { PublicRouter } from '@/router/PublicRouter';
import { ToastContainer } from '@tms/shared/components/common/ToastContainer';

export const App: React.FC = () => {
  return (
    <>
      <PublicRouter />
      <ToastContainer />
    </>
  );
};

export default App;
