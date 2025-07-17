import * as React from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export function LoginForm() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message || "Erro ao fazer login");
    } else {
      setSuccess("Login realizado com sucesso!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    }
    setLoading(false);
  }

  return (
    <div>
      <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Entrar na sua conta</div>
      <div style={{ color: "#bdbdbd", fontSize: 17, marginBottom: 18 }}>Digite seu e-mail abaixo para acessar sua conta</div>
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
                border: "1.5px solid #1A0938",
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label htmlFor="password" style={{ fontWeight: 600, fontSize: 16 }}>Senha</label>
              <a
                href="#"
                style={{ color: "#fff", fontWeight: 600, fontSize: 15, textDecoration: "none" }}
              >
                Esqueceu a senha?
              </a>
            </div>
            <input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} style={{
              width: "100%",
              padding: "0.9rem 1.1rem",
              border: "1.5px solid #1A0938",
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
            {loading ? "Entrando..." : "Entrar"}
          </button>
          <button type="button" style={{
            width: "100%",
            padding: "0.9rem 1.1rem",
            background: "#181818",
            color: "#fff",
            fontSize: 18,
            fontWeight: 600,
            border: "1.5px solid #1A0938",
            borderRadius: 6,
            cursor: "pointer",
            marginBottom: 8
          }}>
            Entrar com Google
          </button>
        </div>
        <div style={{ marginTop: 18, textAlign: "center", fontSize: 16, color: "#fff" }}>
          Não tem uma conta?{' '}
          <a href="/register" style={{ color: "#fff", textDecoration: "underline", fontWeight: 600 }}>
            Cadastre-se
          </a>
        </div>
        {error && <div style={{marginTop:12, color:'#f87171', background:'#2e1732', borderRadius:6, padding:'10px 0', textAlign:'center', fontWeight:600}}>{error}</div>}
        {success && <div style={{marginTop:12, color:'#34d399', background:'#162e2a', borderRadius:6, padding:'10px 0', textAlign:'center', fontWeight:600}}>{success}</div>}
      </form>
    </div>
  );
} 