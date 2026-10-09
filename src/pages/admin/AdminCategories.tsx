import React, { useState, useEffect } from 'react';
import { FolderTree, Plus, Edit2, Trash2, RefreshCw, X } from 'lucide-react';
import type { Category, RequestCategoryJson } from '../../types';
import { catalogService } from '../../services/catalogService';
import { useToast } from '../../context/ToastContext';
import { ConfirmModal } from '../../components/ConfirmModal';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [deletingCatId, setDeletingCatId] = useState<number | null>(null);

  const { success, error } = useToast();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await catalogService.getAllCategories();
      setCategories(data || []);
    } catch {
      error('Falha ao carregar categorias.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload: RequestCategoryJson = {
      name: name.trim(),
      description: description.trim() || undefined,
    };

    try {
      setSubmitting(true);
      if (editingCategory) {
        await catalogService.updateCategory(editingCategory.id, payload);
        success('Categoria atualizada com sucesso!');
      } else {
        await catalogService.createCategory(payload);
        success('Categoria criada com sucesso!');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      error(axiosErr.response?.data?.message || 'Erro ao salvar categoria.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCatId) return;
    try {
      await catalogService.deleteCategory(deletingCatId);
      success('Categoria excluída com sucesso!');
      setCategories((prev) => prev.filter((c) => c.id !== deletingCatId));
      setDeletingCatId(null);
    } catch {
      error('Erro ao excluir categoria.');
    }
  };

  return (
    <div>
      <div className="section-title-wrap">
        <div>
          <h1 className="section-title">
            <FolderTree size={28} color="#00f2fe" /> Gestão de <span className="gradient-text">Categorias</span>
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Classifique e organize os gêneros de jogos da plataforma</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={fetchCategories} title="Recarregar">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button className="btn btn-primary" onClick={handleOpenCreateModal}>
            <Plus size={16} /> Nova Categoria
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="badge badge-cyan">Carregando categorias...</div>
        </div>
      ) : categories.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Nenhuma categoria cadastrada.</p>
          <button className="btn btn-primary" onClick={handleOpenCreateModal}>
            <Plus size={16} /> Criar Primeira Categoria
          </button>
        </div>
      ) : (
        <div className="glass-card" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Descrição</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>#{cat.id}</td>
                  <td style={{ fontWeight: 600 }}>{cat.name}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {cat.description || '—'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem 0.6rem' }}
                        onClick={() => handleOpenEditModal(cat)}
                        title="Editar"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '0.4rem 0.6rem' }}
                        onClick={() => setDeletingCatId(cat.id)}
                        title="Excluir"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)} style={{ padding: '0.4rem 0.6rem' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory}>
              <div className="form-group">
                <label className="form-label">Nome da Categoria *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: RPG, Ação, Estratégia"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Descrição</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Breve descrição dos jogos desta categoria..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} disabled={submitting}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Salvando...' : editingCategory ? 'Atualizar Categoria' : 'Criar Categoria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={!!deletingCatId}
        onClose={() => setDeletingCatId(null)}
        onConfirm={handleDeleteCategory}
        title="Excluir Categoria"
        message="Tem certeza que deseja remover esta categoria? Jogos vinculados a ela serão desvinculados."
        confirmText="Excluir Categoria"
      />
    </div>
  );
};
