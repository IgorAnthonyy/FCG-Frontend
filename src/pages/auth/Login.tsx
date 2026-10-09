import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Gamepad2, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setLoading(true);
      await login({ email, password });
      success('Login realizado com sucesso! Bem-vindo(a).');
      navigate(redirectPath);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; errors?: string[] } } };
      const msg = axiosErr.response?.data?.message || 
                  axiosErr.response?.data?.errors?.[0] || 
                  'Credenciais inválidas. Verifique seu e-mail e senha.';
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="navbar-brand-icon" style={{ margin: '0 auto 1rem', width: '48px', height: '48px' }}>
            <Gamepad2 size={26} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Acesse sua Conta</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.4rem' }}>
            Entre para acessar seu catálogo, pedidos e biblioteca
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Senha</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1.2rem', padding: '0.85rem' }}
            disabled={loading}
          >
            {loading ? 'Entrando...' : (
              <>
                <span>Entrar</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Não tem uma conta?{' '}
          <Link to={`/register${redirectPath !== '/' ? `?redirect=${redirectPath}` : ''}`} style={{ color: '#c084fc', fontWeight: 600 }}>
            Cadastre-se gratuitamente
          </Link>
        </div>
      </div>
    </div>
  );
};
