import React, { useState, useEffect } from 'react';
import { Gamepad2, Plus, Edit2, Trash2, RefreshCw, X, Link as LinkIcon } from 'lucide-react';
import type { Game, Category, RequestGameJson } from '../../types';
import { catalogService } from '../../services/catalogService';
import { useToast } from '../../context/ToastContext';
import { ConfirmModal } from '../../components/ConfirmModal';

export const AdminGames: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | string>('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [deletingGameId, setDeletingGameId] = useState<number | null>(null);

  const { success, error } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [gamesData, categoriesData] = await Promise.all([
        catalogService.getAllGames(),
        catalogService.getAllCategories(),
      ]);
      setGames(gamesData || []);
      setCategories(categoriesData || []);
    } catch {
      error('Erro ao carregar lista de jogos ou categorias.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingGame(null);
    setName('');
    setDescription('');
    setPrice('');
    setImageUrl('');
    setSelectedCategoryId(categories.length > 0 ? categories[0].id : '');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (game: Game) => {
    setEditingGame(game);
    setName(game.name);
    setDescription(game.description);
    setPrice(game.price);
    setImageUrl(game.imageUrl || '');
    const currentCatId =
      game.categories?.[0]?.id ||
      game.categoryIds?.[0] ||
      (game as unknown as { categoryId?: number }).categoryId ||
      (categories.length > 0 ? categories[0].id : '');
    setSelectedCategoryId(currentCatId);
    setIsModalOpen(true);
  };

  const handleSaveGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || price === '') {
      error('Preencha todos os campos obrigatórios.');
      return;
    }

    if (!selectedCategoryId || Number(selectedCategoryId) <= 0) {
      error('Selecione uma categoria válida para o jogo. Se não houver categorias, crie uma antes.');
      return;
    }

    const payload: RequestGameJson = {
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      categoryId: Number(selectedCategoryId),
      imageUrl: imageUrl.trim() || undefined,
    };

    try {
      setSubmitting(true);
      if (editingGame) {
        await catalogService.updateGame(editingGame.id, payload);
        success('Jogo atualizado com sucesso!');
      } else {
        await catalogService.createGame(payload);
        success('Jogo cadastrado com sucesso!');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; errorMessages?: string[]; errors?: string[] } } };
      const msg =
        axiosErr.response?.data?.message ||
        axiosErr.response?.data?.errorMessages?.join(' ') ||
        axiosErr.response?.data?.errors?.join(' ') ||
        'Erro ao salvar jogo.';
      error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGame = async () => {
    if (!deletingGameId) return;
    try {
      await catalogService.deleteGame(deletingGameId);
      success('Jogo removido com sucesso!');
      setGames((prev) => prev.filter((g) => g.id !== deletingGameId));
      setDeletingGameId(null);
    } catch {
      error('Falha ao excluir jogo.');
    }
  };

  return (
    <div>
      <div className="section-title-wrap">
        <div>
          <h1 className="section-title">
            <Gamepad2 size={28} color="#c084fc" /> Gestão de <span className="gradient-text">Jogos</span>
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Cadastre e gerencie os jogos disponíveis no catálogo</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={fetchData} title="Recarregar">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button className="btn btn-primary" onClick={handleOpenCreateModal}>
            <Plus size={16} /> Novo Jogo
          </button>
        </div>
      </div>

      {/* Games Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="badge badge-purple">Carregando jogos...</div>
        </div>
      ) : games.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Nenhum jogo cadastrado no catálogo.</p>
          <button className="btn btn-primary" onClick={handleOpenCreateModal}>
            <Plus size={16} /> Cadastrar Primeiro Jogo
          </button>
        </div>
      ) : (
        <div className="glass-card" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Jogo</th>
                <th>Preço</th>
                <th>Categoria</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => (
                <tr key={game.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '6px', overflow: 'hidden', background: '#191c2b', flexShrink: 0 }}>
                        {game.imageUrl ? (
                          <img src={game.imageUrl} alt={game.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎮</div>
                        )}
                      </div>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: '1rem', display: 'block' }}>{game.name}</span>
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>ID: #{game.id}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    R$ {Number(game.price || 0).toFixed(2)}
                  </td>
                  <td>
                    {game.categories && game.categories.length > 0 ? (
                      <span className="badge badge-purple">{game.categories[0].name}</span>
                    ) : (game as unknown as { category?: { name: string } }).category ? (
                      <span className="badge badge-purple">{(game as unknown as { category: { name: string } }).category.name}</span>
                    ) : (
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Geral</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem 0.6rem' }}
                        onClick={() => handleOpenEditModal(game)}
                        title="Editar"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '0.4rem 0.6rem' }}
                        onClick={() => setDeletingGameId(game.id)}
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
                {editingGame ? 'Editar Jogo' : 'Cadastrar Novo Jogo'}
              </h3>
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)} style={{ padding: '0.4rem 0.6rem' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveGame}>
              <div className="form-group">
                <label className="form-label">Nome do Jogo *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Cyberpunk 2077"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Preço (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  placeholder="199.90"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Categoria Principal *</label>
                {categories.length === 0 ? (
                  <div style={{ padding: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', color: '#f87171', fontSize: '0.85rem' }}>
                    Nenhuma categoria encontrada. Crie uma categoria no menu &quot;Gestão de Categorias&quot; antes de cadastrar jogos.
                  </div>
                ) : (
                  <select
                    className="form-select"
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                    required
                  >
                    <option value="">Selecione uma categoria...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} (ID: #{cat.id})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">URL da Imagem de Capa</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="url"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="https://exemplo.com/imagem.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  <LinkIcon size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Descrição do Jogo *</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Sinopse, mecânicas e requisitos..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} disabled={submitting}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting || categories.length === 0}>
                  {submitting ? 'Salvando...' : editingGame ? 'Atualizar Jogo' : 'Cadastrar Jogo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={!!deletingGameId}
        onClose={() => setDeletingGameId(null)}
        onConfirm={handleDeleteGame}
        title="Excluir Jogo"
        message="Tem certeza que deseja excluir permanentemente este jogo do catálogo?"
        confirmText="Excluir Jogo"
      />
    </div>
  );
};
