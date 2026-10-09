import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Check, 
  Star, 
  ThumbsUp, 
  MessageSquarePlus, 
  Edit3, 
  Trash2, 
  ArrowLeft,
  Gamepad,
  ShieldCheck
} from 'lucide-react';
import type { Game, Review, LibraryItem } from '../../types';
import { catalogService } from '../../services/catalogService';
import { reviewsService } from '../../services/reviewsService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ReviewModal } from '../../components/ReviewModal';
import { ConfirmModal } from '../../components/ConfirmModal';

export const GameDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const gameId = Number(id);

  const [game, setGame] = useState<Game | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userLibrary, setUserLibrary] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Review modal & confirm modal states
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  const { addToCart, isItemInCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { success, error, info } = useToast();

  const inCart = game ? isItemInCart(game.id) : false;
  const isOwned = userLibrary.some((item) => item.gameId === gameId);

  const fetchData = async () => {
    try {
      setLoading(true);
      const gameData = await catalogService.getGameById(gameId);
      setGame(gameData);

      const externalOrNumericId = gameData?.externalId || gameId;
      const reviewsData = await reviewsService.getReviewsByGameId(externalOrNumericId).catch(() => []);
      setReviews(reviewsData || []);

      if (isAuthenticated) {
        try {
          const library = await catalogService.getUserLibrary();
          setUserLibrary(library || []);
        } catch {
          // ignore
        }
      }
    } catch {
      error('Erro ao carregar detalhes do jogo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (gameId) {
      fetchData();
    }
  }, [gameId, isAuthenticated]);

  const handleHelpfulVote = async (reviewId: string) => {
    if (!isAuthenticated) {
      info('Faça login para votar em avaliações.');
      return;
    }
    try {
      await reviewsService.markHelpfulVote(reviewId);
      success('Voto registrado!');
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, helpfulVotes: (r.helpfulVotes || 0) + 1 } : r))
      );
    } catch {
      error('Não foi possível registrar seu voto.');
    }
  };

  const handleSaveReview = async (data: { rating: number; comment: string }) => {
    if (!game) return;
    try {
      const targetExternalId = game.externalId || (await catalogService.getGameById(game.id)).externalId;
      if (!targetExternalId) {
        throw new Error('Identificador único do jogo não encontrado.');
      }

      if (editingReview) {
        await reviewsService.updateReview(editingReview.id, data);
        success('Avaliação atualizada!');
      } else {
        await reviewsService.createReview({
          gameId: targetExternalId,
          rating: data.rating,
          comment: data.comment,
        });
        success('Avaliação publicada com sucesso!');
      }
      // Refresh reviews
      const updatedReviews = await reviewsService.getReviewsByGameId(targetExternalId);
      setReviews(updatedReviews || []);
      setEditingReview(null);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; errorMessages?: string[]; errors?: Record<string, string[]> } }; message?: string };
      const apiErrors = axiosErr.response?.data?.errorMessages || 
        (axiosErr.response?.data?.errors ? Object.values(axiosErr.response.data.errors).flat() : null);
      const msg = apiErrors?.[0] || axiosErr.response?.data?.message || axiosErr.message || 'Falha ao salvar avaliação.';
      error(msg);
    }
  };

  const handleDeleteReview = async () => {
    if (!deletingReviewId || !game) return;
    try {
      await reviewsService.deleteReview(deletingReviewId);
      success('Avaliação removida com sucesso.');
      setReviews((prev) => prev.filter((r) => r.id !== deletingReviewId));
      setDeletingReviewId(null);
    } catch {
      error('Erro ao remover avaliação.');
    }
  };

  const averageRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : '0.0';

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 0' }}>
        <div className="badge badge-purple" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
          Carregando informações do jogo...
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>Jogo não encontrado</h2>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Voltar para a Loja
        </Link>
      </div>
    );
  }

  const fallbackImage = `https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80`;

  return (
    <div>
      <Link to="/" className="btn btn-secondary" style={{ marginBottom: '1.5rem', padding: '0.4rem 0.8rem' }}>
        <ArrowLeft size={16} /> Voltar ao Catálogo
      </Link>

      {/* Main Game Info Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2.5rem',
        marginBottom: '3.5rem'
      }}>
        {/* Game Media */}
        <div className="glass-card" style={{ overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
          <img
            src={game.imageUrl || fallbackImage}
            alt={game.name}
            style={{ width: '100%', height: '380px', objectFit: 'cover' }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = fallbackImage;
            }}
          />
        </div>

        {/* Game Details */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            {game.categories?.map((cat) => (
              <span key={cat.id} className="badge badge-purple">
                {cat.name}
              </span>
            ))}
            {isOwned && (
              <span className="badge badge-green">
                <Check size={12} /> Na sua biblioteca
              </span>
            )}
          </div>

          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '1rem' }}>{game.name}</h1>

          {/* Rating overview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', color: '#fbbf24' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={18}
                  fill={Math.round(Number(averageRating)) >= star ? '#fbbf24' : 'transparent'}
                  color={Math.round(Number(averageRating)) >= star ? '#fbbf24' : 'var(--text-dim)'}
                />
              ))}
            </div>
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>{averageRating}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({reviews.length} avaliações)</span>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2rem' }}>
            {game.description}
          </p>

          {/* Purchase / Play Card */}
          <div
            className="glass-card"
            style={{
              marginTop: 'auto',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, rgba(25, 28, 43, 0.8) 0%, rgba(18, 20, 30, 0.9) 100%)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block' }}>Preço do Jogo</span>
              <span style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#fff' }}>
                R$ {Number(game.price || 0).toFixed(2)}
              </span>
            </div>

            {isOwned ? (
              <button className="btn btn-primary" style={{ padding: '0.8rem 1.8rem' }} onClick={() => success('Iniciando transmissão em nuvem do jogo...')}>
                <Gamepad size={20} /> Jogar Agora
              </button>
            ) : (
              <button
                className={`btn ${inCart ? 'btn-outline-cyan' : 'btn-primary'}`}
                style={{ padding: '0.8rem 1.8rem' }}
                onClick={() => addToCart(game)}
                disabled={inCart}
              >
                {inCart ? (
                  <>
                    <Check size={20} /> Adicionado ao Carrinho
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} /> Comprar Jogo
                  </>
                )}
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
            <ShieldCheck size={16} color="#10b981" /> Compra segura com processamento assíncrono via RabbitMQ
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '2.5rem' }}>
        <div className="section-title-wrap">
          <div>
            <h2 className="section-title">
              <Star size={24} color="#fbbf24" fill="#fbbf24" /> Avaliações da Comunidade
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Baseado nas opiniões de jogadores reais armazenadas no MongoDB
            </p>
          </div>

          {isAuthenticated ? (
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingReview(null);
                setIsReviewModalOpen(true);
              }}
            >
              <MessageSquarePlus size={16} /> Escrever Avaliação
            </button>
          ) : (
            <Link to="/login" className="btn btn-secondary">
              Faça login para avaliar
            </Link>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Star size={36} style={{ opacity: 0.3, marginBottom: '0.8rem' }} />
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
              Ainda não há avaliações para este jogo
            </p>
            <p style={{ fontSize: '0.9rem' }}>Seja o primeiro a compartilhar sua experiência com a comunidade!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reviews.map((rev) => {
              const isAuthor = user?.id === rev.userId;

              return (
                <div key={rev.id} className="glass-card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '1rem' }}>
                          {rev.userName || 'Jogador Anônimo'}
                        </span>
                        {isAuthor && <span className="badge badge-purple">Sua Avaliação</span>}
                      </div>

                      <div style={{ display: 'flex', color: '#fbbf24', marginTop: '0.3rem' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={14}
                            fill={rev.rating >= s ? '#fbbf24' : 'transparent'}
                            color={rev.rating >= s ? '#fbbf24' : 'var(--text-dim)'}
                          />
                        ))}
                      </div>
                    </div>

                    {isAuthor && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.6rem' }}
                          onClick={() => {
                            setEditingReview(rev);
                            setIsReviewModalOpen(true);
                          }}
                          title="Editar"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '0.35rem 0.6rem' }}
                          onClick={() => setDeletingReviewId(rev.id)}
                          title="Excluir"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                    {rev.comment}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      onClick={() => handleHelpfulVote(rev.id)}
                    >
                      <ThumbsUp size={14} /> Útil ({rev.helpfulVotes || 0})
                    </button>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('pt-BR') : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setEditingReview(null);
        }}
        onSubmit={handleSaveReview}
        initialReview={editingReview}
        gameName={game.name}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deletingReviewId}
        onClose={() => setDeletingReviewId(null)}
        onConfirm={handleDeleteReview}
        title="Excluir Avaliação"
        message="Tem certeza que deseja remover esta avaliação? Esta ação não pode ser desfeita."
        confirmText="Excluir"
      />
    </div>
  );
};
