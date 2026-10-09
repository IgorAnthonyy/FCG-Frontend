import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Gamepad2, Lock, Mail, User as UserIcon, ArrowRight, CreditCard, Sparkles, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCPF, validateCPF, generateCPF } from '../../utils/cpf';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect') || '/';

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
  };

  const handleGenerateCPF = () => {
    const randomCpf = generateCPF();
    setCpf(randomCpf);
    success('CPF válido gerado para testes!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !cpf) {
      error('Preencha todos os campos obrigatórios.');
      return;
    }

    if (!validateCPF(cpf)) {
      error('CPF informado é inválido. Digite um CPF válido ou use o gerador de testes.');
      return;
    }

    if (password.length < 8) {
      error('A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    if (!/^(?=.*[^A-Za-z0-9])(?=.*[A-Za-z])(?=.*[0-9]).+$/.test(password)) {
      error('A senha deve conter ao menos uma letra, um número e um caractere especial (ex: Admin@123).');
      return;
    }

    if (password !== confirmPassword) {
      error('As senhas não coincidem.');
      return;
    }

    try {
      setLoading(true);
      await register({
        name,
        email,
        password,
        cpf,
        phone: phone.trim() || '11999999999',
      });
      success('Conta criada com sucesso! Bem-vindo(a) à FIAP Cloud Games.');
      navigate(redirectPath);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> | string[]; errorMessages?: string[] } } };
      let msg = axiosErr.response?.data?.message;
      if (!msg && axiosErr.response?.data?.errors) {
        if (Array.isArray(axiosErr.response.data.errors)) {
          msg = axiosErr.response.data.errors[0];
        } else {
          msg = Object.values(axiosErr.response.data.errors).flat()[0];
        }
      }
      if (!msg && axiosErr.response?.data?.errorMessages) {
        msg = axiosErr.response.data.errorMessages[0];
      }
      error(msg || 'Falha ao registrar usuário. Tente novamente.');
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
      <div className="glass-card" style={{ maxWidth: '480px', width: '100%', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="navbar-brand-icon" style={{ margin: '0 auto 1rem', width: '48px', height: '48px' }}>
            <Gamepad2 size={26} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Criar Nova Conta</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.4rem' }}>
            Junte-se à maior plataforma cloud gaming da FIAP
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nome Completo *</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <UserIcon size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">E-mail *</label>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>CPF *</label>
              <button
                type="button"
                onClick={handleGenerateCPF}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-cyan)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: 0
                }}
              >
                <Sparkles size={12} /> Gerar CPF Válido
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="000.000.000-00"
                value={cpf}
                onChange={handleCpfChange}
                maxLength={14}
                required
              />
              <CreditCard size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Telefone (Opcional)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="tel"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Phone size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Senha * (mín. 8 caracteres, letra, número e símbolo)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Ex: Senha@123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirmar Senha *</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Repita sua senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'Criando Conta...' : (
              <>
                <span>Cadastrar</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Já possui uma conta?{' '}
          <Link to={`/login${redirectPath !== '/' ? `?redirect=${redirectPath}` : ''}`} style={{ color: '#c084fc', fontWeight: 600 }}>
            Entrar
          </Link>
        </div>
      </div>
    </div>
  );
};
