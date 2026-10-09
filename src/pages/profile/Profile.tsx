import React, { useState } from 'react';
import { User, Lock, Mail, Shield, Save, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';

export const Profile: React.FC = () => {
  const { user, updateUserContext } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      setUpdatingProfile(true);
      await authService.updateUser(user.id, { name, email });
      updateUserContext({ name, email });
      success('Perfil atualizado com sucesso!');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      error(axiosErr.response?.data?.message || 'Erro ao atualizar perfil.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    if (newPassword !== confirmNewPassword) {
      error('A nova senha e a confirmação não coincidem.');
      return;
    }

    try {
      setChangingPassword(true);
      await authService.changePassword({ currentPassword, newPassword });
      success('Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      error(axiosErr.response?.data?.message || 'Falha ao alterar senha. Verifique sua senha atual.');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div className="section-title-wrap">
        <div>
          <h1 className="section-title">
            <User size={28} color="#c084fc" /> Minha <span className="gradient-text">Conta</span>
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Gerencie suas credenciais e dados pessoais</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
        {/* Profile Info */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'var(--accent-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '1.4rem',
                fontWeight: 800,
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{user?.name}</h3>
              <span className={`badge ${user?.role === 'Admin' ? 'badge-cyan' : 'badge-purple'}`} style={{ marginTop: '0.3rem' }}>
                <Shield size={12} /> {user?.role || 'Usuário'}
              </span>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label className="form-label">Nome Completo</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <User size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">E-mail</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={updatingProfile}>
              <Save size={16} /> {updatingProfile ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <KeyRound size={20} color="#00f2fe" /> Alterar Senha
          </h3>

          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label">Senha Atual</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Sua senha atual"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <Lock size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Nova Senha</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <Lock size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirmar Nova Senha</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Repita a nova senha"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
                <Lock size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              </div>
            </div>

            <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem' }} disabled={changingPassword}>
              <KeyRound size={16} /> {changingPassword ? 'Alterando...' : 'Atualizar Senha'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
