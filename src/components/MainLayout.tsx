import { useRouter } from 'next/router';
import Sidebar, { SidebarProps } from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { ReactNode, useState, useEffect, useRef } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, loading: userLoading } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && containerRef.current) {
      const html = document.documentElement;
      if (html.classList.contains('light')) {
        containerRef.current.style.backgroundColor = '#fff';
      } else {
        containerRef.current.style.backgroundColor = '#020204';
      }
    }
    const observer = new MutationObserver(() => {
      if (containerRef.current) {
        const html = document.documentElement;
        if (html.classList.contains('light')) {
          containerRef.current.style.backgroundColor = '#fff';
        } else {
          containerRef.current.style.backgroundColor = '#020204';
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  if (userLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#09090B' }}>
        <p style={{ color: 'white' }}>Carregando...</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ display: 'flex', minHeight: 'calc(100vh + 5cm)', backgroundColor: '#020204' }}>
      <div
        style={{
          width: open ? 300 : 96,
          minWidth: open ? 300 : 96,
          maxWidth: open ? 300 : 96,
          transition: 'width 0.2s',
        }}
      >
        <Sidebar open={open} setOpen={setOpen} />
      </div>
      <main
        style={{
          flex: 1,
          minWidth: 0,
          padding: '2rem',
          transition: 'all 0.2s',
          minHeight: 'calc(100vh + 5cm)',
        }}
      >
        {children}
      </main>
    </div>
  );
}