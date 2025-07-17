import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import { FiMail, FiLock } from 'react-icons/fi';

type Props = {
  mode: 'login' | 'register' | 'forgot';
  variant?: 'login' | 'register';
};

export default function AuthForm({ mode, variant = 'login' }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const router = useRouter();

  // Função para formatar CPF
  function formatCpf(value: string) {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14);
  }
  // Função para formatar telefone
  function formatPhone(value: string) {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    if (mode === 'register') {
      if (password !== confirmPassword) {
        setMessage('As senhas não coincidem.');
        setLoading(false);
        return;
      }
    }
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setMessage(error.message);
        else router.push('/dashboard');
      } else if (mode === 'register') {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { cpf, phone } } });
        if (error) setMessage(error.message);
        else router.push('/dashboard');
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) setMessage(error.message);
        else setMessage('Email de recuperação enviado!');
      }
    } catch (err: any) {
      setMessage('Erro inesperado: ' + (err?.message || 'Tente novamente.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {mode === 'register' ? (
        <>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Crie sua conta</div>
          <div style={{ color: "#bdbdbd", fontSize: 17, marginBottom: 18 }}>Digite seu e-mail abaixo para criar sua conta</div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label htmlFor="email" style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>E-mail</label>
                <input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.9rem 1.1rem",
                    border: "1.5px solid #222",
                    borderRadius: 6,
                    fontSize: 16,
                    marginBottom: 0,
                    outline: "none",
                    background: "#181818",
                    color: "#fff",
                    boxShadow: "0 2px 8px #0002"
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label htmlFor="password" style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Senha</label>
                <input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} style={{
                  width: "100%",
                  padding: "0.9rem 1.1rem",
                  border: "1.5px solid #222",
                  borderRadius: 6,
                  fontSize: 16,
                  marginBottom: 0,
                  outline: "none",
                  background: "#181818",
                  color: "#fff",
                  boxShadow: "0 2px 8px #0002"
                }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label htmlFor="confirmPassword" style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Confirmar senha</label>
                <input id="confirmPassword" type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{
                  width: "100%",
                  padding: "0.9rem 1.1rem",
                  border: "1.5px solid #222",
                  borderRadius: 6,
                  fontSize: 16,
                  marginBottom: 0,
                  outline: "none",
                  background: "#181818",
                  color: "#fff",
                  boxShadow: "0 2px 8px #0002"
                }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label htmlFor="cpf" style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>CPF <span style={{ color: '#bdbdbd', fontWeight: 400 }}>(opcional)</span></label>
                <input id="cpf" type="text" value={cpf} onChange={e => setCpf(formatCpf(e.target.value))} placeholder="Seu CPF" style={{
                  width: "100%",
                  padding: "0.9rem 1.1rem",
                  border: "1.5px solid #222",
                  borderRadius: 6,
                  fontSize: 16,
                  marginBottom: 0,
                  outline: "none",
                  background: "#181818",
                  color: "#fff",
                  boxShadow: "0 2px 8px #0002"
                }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label htmlFor="phone" style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Telefone <span style={{ color: '#bdbdbd', fontWeight: 400 }}>(opcional)</span></label>
                <input id="phone" type="text" value={phone} onChange={e => setPhone(formatPhone(e.target.value))} placeholder="Seu telefone" style={{
                  width: "100%",
                  padding: "0.9rem 1.1rem",
                  border: "1.5px solid #222",
                  borderRadius: 6,
                  fontSize: 16,
                  marginBottom: 0,
                  outline: "none",
                  background: "#181818",
                  color: "#fff",
                  boxShadow: "0 2px 8px #0002"
                }} />
              </div>
              <button type="submit" disabled={loading} style={{
                width: "100%",
                padding: "0.9rem 1.1rem",
                background: "#eee",
                color: "#111",
                fontSize: 18,
                fontWeight: 600,
                border: "none",
                borderRadius: 6,
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: 8,
                marginBottom: 8,
                opacity: loading ? 0.7 : 1
              }}>
                {loading ? (mode === 'register' ? "Cadastrando..." : "Entrando...") : (mode === 'register' ? "Cadastrar" : "Entrar")}
              </button>
            </div>
            <div style={{ marginTop: 18, textAlign: "center", fontSize: 16, color: "#fff" }}>
              Já tem uma conta?{' '}
              <a href="/login" style={{ color: "#fff", textDecoration: "underline", fontWeight: 600 }}>
                Entrar
              </a>
            </div>
            {message && <div style={{marginTop:12, color: message.toLowerCase().includes('erro') ? '#f87171' : '#34d399', background: message.toLowerCase().includes('erro') ? '#2e1732' : '#162e2a', borderRadius:6, padding:'10px 0', textAlign:'center', fontWeight:600}}>{message}</div>}
          </form>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="w-full">
          <div className="text-center mb-8">
            {(() => {
              switch (mode as 'login' | 'register' | 'forgot') {
                case 'login':
                  return <>
                    <h2 className={variant === 'register' ? 'register-title' : 'login-title'}>Bem-vindo de volta!</h2>
                    <p className={variant === 'register' ? 'register-desc' : 'login-desc'}>Entre com suas credenciais para acessar sua conta</p>
                  </>;
                case 'register':
                  return <>
                    <h2 className={variant === 'register' ? 'register-title' : 'login-title'}>Crie sua conta</h2>
                    <p className={variant === 'register' ? 'register-desc' : 'login-desc'}>Preencha os dados para criar sua conta</p>
                  </>;
                case 'forgot':
                  return <>
                    <h2 className={variant === 'register' ? 'register-title' : 'login-title'}>Recuperar Senha</h2>
                    <p className={variant === 'register' ? 'register-desc' : 'login-desc'}>Digite seu email para recuperar a senha</p>
                  </>;
                default:
                  return null;
              }
            })()}
          </div>

          <div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#6366f1' }}>
                <FiMail size={22} />
              </span>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={variant === 'register' ? 'register-input' : 'login-input'}
                style={{ paddingLeft: 44 }}
                required
              />
            </div>

            {mode !== 'forgot' && (
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#6366f1' }}>
                  <FiLock size={22} />
                </span>
                <input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={variant === 'register' ? 'register-input' : 'login-input'}
                  style={{ paddingLeft: 44 }}
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className={variant === 'register' ? 'register-btn' : 'login-btn'}
              disabled={loading}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <div className="loading-spinner" style={{ width: 20, height: 20 }}></div>
                  Aguarde...
                </div>
              ) : (
                (() => {
                  switch (mode as 'login' | 'register' | 'forgot') {
                    case 'login':
                      return 'Entrar';
                    case 'register':
                      return 'Cadastrar';
                    case 'forgot':
                      return 'Enviar email';
                    default:
                      return '';
                  }
                })()
              )}
            </button>

            {message && (
              <div className={`${variant === 'register' ? 'register-message' : 'login-message'} ${message.includes('Erro') || message.includes('error') ? 'error' : 'success'}`}>
                {message}
              </div>
            )}
          </div>

          <div className={variant === 'register' ? 'register-links' : 'login-links'}>
            {mode === 'login' && (
              <>
                <a href="/register" className="login-link">Criar nova conta</a>
                <a href="/forgot-password" className="login-link">Esqueci minha senha</a>
              </>
            )}
            {(mode as 'login' | 'register' | 'forgot') === 'register' && (
              <a href="/login" className="register-link">Já tenho uma conta? Entrar</a>
            )}
            {(mode as 'login' | 'register' | 'forgot') === 'forgot' && (
              <a href="/login" className="login-link">Voltar ao login</a>
            )}
          </div>
        </form>
      )}
    </div>
  );
} 