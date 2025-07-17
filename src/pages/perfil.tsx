import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ProfileInfo from '../components/ProfileInfo';
import { useRouter } from 'next/router';
import styles from '../styles/perfil.module.css';

export default function PerfilPage(props) {
    const { user, loading } = useAuth();
    const router = useRouter();
    useEffect(() => {
      if (!loading && !user) {
        router.replace('/login');
      }
    }, [user, loading, router]);
    if (loading || !user) {
     return <div>Carregando...</div>;
   }
    const mainRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      if (typeof window !== 'undefined' && mainRef.current) {
        const html = document.documentElement;
        if (html.classList.contains('light')) {
          mainRef.current.style.background = '#fff';
        } else {
          mainRef.current.style.background = '#020204';
        }
      }
      const observer = new MutationObserver(() => {
        if (mainRef.current) {
          const html = document.documentElement;
          if (html.classList.contains('light')) {
            mainRef.current.style.background = '#fff';
          } else {
            mainRef.current.style.background = '#020204';
          }
        }
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      return () => observer.disconnect();
    }, []);
    return (
      <div ref={mainRef} style={{
        width: '100%',
        boxSizing: 'border-box',
        overflowX: 'auto',
        paddingTop: '2rem',
        minHeight: 'calc(100vh + 5cm)',
        background: '#020204',
      }}>
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '0 2rem',
        }}>
          <main style={{ flex: 1, minWidth: 0, padding: '2rem' }}>
            <ProfileInfo user={user} />
          </main>
        </div>
      </div>
    );
} 