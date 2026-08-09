import { useState } from 'react';
import { sb as supabase } from '@/services/supabase';
import { chart, text, surface, semantic, soft } from '@/constants/theme';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);
  const [hover, setHover] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('As senhas não conferem');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      setSuccess('Conta criada com sucesso! Redirecionando para o login…');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => { window.location.href = '/login'; }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '12px', fontWeight: 600, color: text.secondary,
    marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em',
  };
  const inputStyle = (name: string): React.CSSProperties => ({
    width: '100%', padding: '12px 14px', fontSize: '14px', color: text.bright,
    background: surface.app,
    border: `1px solid ${focus === name ? chart.light : surface.borderStrong}`,
    borderRadius: '10px', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color .15s ease',
  });

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `radial-gradient(1200px 600px at 50% -10%, ${surface.hover}, transparent), ${surface.app}`,
      padding: '24px',
    }}>
      <div style={{
        width: '100%', maxWidth: '400px', background: surface.card,
        border: `1px solid ${surface.border}`, borderRadius: '16px',
        padding: '40px 32px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '11px', background: chart.light,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '22px', color: surface.app,
          }}>R</div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: text.white, letterSpacing: '-0.02em' }}>RAVO OS</div>
            <div style={{ fontSize: '12px', color: text.secondary }}>Criar nova conta</div>
          </div>
        </div>

        {error && (
          <div style={{
            marginBottom: '16px', padding: '10px 12px', fontSize: '13px', color: semantic.dangerSoft,
            background: soft.danger, border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px',
          }}>{error}</div>
        )}
        {success && (
          <div style={{
            marginBottom: '16px', padding: '10px 12px', fontSize: '13px', color: semantic.successSoft,
            background: soft.success, border: '1px solid rgba(34,197,94,0.3)', borderRadius: '10px',
          }}>{success}</div>
        )}

        <form onSubmit={handleSignup}>
          <label style={labelStyle}>Email</label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocus('email')} onBlur={() => setFocus(null)}
            required disabled={loading} autoComplete="email"
            style={{ ...inputStyle('email'), marginBottom: '16px' }}
          />

          <label style={labelStyle}>Senha</label>
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocus('password')} onBlur={() => setFocus(null)}
            required disabled={loading} autoComplete="new-password"
            style={{ ...inputStyle('password'), marginBottom: '16px' }}
          />

          <label style={labelStyle}>Confirmar Senha</label>
          <input
            type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            onFocus={() => setFocus('confirm')} onBlur={() => setFocus(null)}
            required disabled={loading} autoComplete="new-password"
            style={{ ...inputStyle('confirm'), marginBottom: '24px' }}
          />

          <button
            type="submit" disabled={loading}
            onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
            style={{
              width: '100%', padding: '12px', fontSize: '15px', fontWeight: 700, color: surface.app,
              background: loading ? 'rgba(255,255,255,0.2)' : (hover ? chart.line : chart.light),
              border: 'none', borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer', transition: 'background .15s ease',
            }}
          >
            {loading ? 'Criando conta…' : 'Criar conta'}
          </button>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: text.secondary }}>
          Já tem conta? <a href="/login" style={{ color: chart.light, fontWeight: 600, textDecoration: 'none' }}>Fazer login</a>
        </p>
      </div>
    </div>
  );
}
