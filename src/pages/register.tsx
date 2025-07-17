import { StarBackground } from "../components/StarBackground";
import AuthForm from '../components/AuthForm';
import React, { useEffect } from 'react';

export default function RegisterPage() {
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.margin = '';
      document.documentElement.style.padding = '';
    };
  }, []);
  return (
    <>
      <style global jsx>{`
        html, body {
          zoom: 1 !important;
          background: #09090B !important;
        }
      `}</style>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', overflow: 'hidden', background: '#09090B', zIndex: 0 }}>
        <StarBackground />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center', padding: '24px 0' }}>
          <div className="w-full max-w-sm" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="login-zoom">
              <AuthForm mode="register" variant="register" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 