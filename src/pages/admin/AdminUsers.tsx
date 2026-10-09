import React, { useState } from 'react';
import { UserPlus, ShieldAlert, Mail, User as UserIcon, Trash2, ShieldCheck, CreditCard, Sparkles, Phone } from 'lucide-react';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import { ConfirmModal } from '../../components/ConfirmModal';
import { formatCPF, validateCPF, generateCPF } from '../../utils/cpf';

export const AdminUsers: React.FC = () => {
  // Admin create form
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminCpf, setAdminCpf] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  // User delete form
  const [userIdToDelete, setUserIdToDelete] = useState('');
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);

  const { success, error } = useToast();

  const handleGenerateCPF = () => {
    const randomCpf = generateCPF();
    setAdminCpf(randomCpf);
    success('CPF válido gerado para testes!');
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName.trim() || !adminEmail.trim() || !adminCpf.trim()) {
      error('Preencha todos os campos obrigatórios.');
      return;
    }

    if (!validateCPF(adminCpf)) {
      error('CPF informado é inválido. Digite um CPF válido ou use o gerador de testes.');
      return;
    }

    try {
      setCreatingAdmin(true);
      await authService.registerAdmin({
        name: adminName.trim(),
        email: adminEmail.trim(),
        cpf: adminCpf.trim(),
        phone: adminPhone.trim() || '11999999999',
      });
      success(`Administrador "${adminName}" cadastrado com sucesso!`);
      setAdminName('');
      setAdminEmail('');
      setAdminCpf('');
      setAdminPhone('');
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
      error(msg || 'Falha ao registrar novo administrador.');
    } finally {
      setCreatingAdmin(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userIdToDelete.trim()) return;

    try {
      setDeletingUser(true);
      await authService.deleteUser(userIdToDelete.trim());
      success('Usuário removido com sucesso do sistema.');
      setUserIdToDelete('');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      error(axiosErr.response?.data?.message || 'Erro ao deletar usuário. Verifique o GUID informado.');
    } finally {
      setDeletingUser(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="section-title-wrap">
        <div>
          <h1 className="section-title">
            <ShieldAlert size={28} color="#10b981" /> Gestão de <span className="gradient-text">Usuários & Admins</span>
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Crie novos administradores ou efetue remoções com permissão elevada
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        {/* Create Admin Form */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
            <UserPlus size={22} color="#10b981" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Novo Administrador</h3>
          </div>

          <form onSubmit={handleCreateAdmin}>
            <div className="form-group">
              <label className="form-label">Nome Completo *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Nome do administrador"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  required
                />
                <UserIcon size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">E-mail Corporativo *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="admin@fiap.com.br"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
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
                  value={adminCpf}
                  onChange={(e) => setAdminCpf(formatCPF(e.target.value))}
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
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                />
                <Phone size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={creatingAdmin}>
              <ShieldCheck size={18} />
              {creatingAdmin ? 'Criando Administrador...' : 'Criar Administrador'}
            </button>
          </form>
        </div>

        {/* Delete User by GUID */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
            <Trash2 size={22} color="#f87171" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Excluir Usuário</h3>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            Informe o GUID do usuário que deseja remover permanentemente do banco de dados de autenticação.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (userIdToDelete.trim()) setIsConfirmDeleteOpen(true);
            }}
          >
            <div className="form-group">
              <label className="form-label">ID do Usuário (GUID)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: 550e8400-e29b-41d4-a716-446655440000"
                value={userIdToDelete}
                onChange={(e) => setUserIdToDelete(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-danger" style={{ width: '100%', marginTop: '1rem' }} disabled={deletingUser || !userIdToDelete.trim()}>
              <Trash2 size={16} /> Excluir Conta do Usuário
            </button>
          </form>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleDeleteUser}
        title="Confirmar Exclusão de Usuário"
        message={`Tem certeza que deseja deletar o usuário ${userIdToDelete}? Esta operação é irreversível.`}
        confirmText="Confirmar Exclusão"
      />
    </div>
  );
};
