import { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <main className="w-full h-full min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;