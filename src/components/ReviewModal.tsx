import React, { useState, useEffect } from 'react';
import { Star, X } from 'lucide-react';
import type { Review } from '../types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { rating: number; comment: string }) => Promise<void>;
  initialReview?: Review | null;
  gameName: string;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialReview,
  gameName,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (initialReview) {
      setRating(initialReview.rating || 5);
      setComment(initialReview.comment || '');
    } else {
      setRating(5);
      setComment('');
    }
  }, [initialReview, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setLoading(true);
      await onSubmit({ rating, comment });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
              {initialReview ? 'Editar Avaliação' : 'Avaliar Jogo'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{gameName}</p>
          </div>
          <button className="btn btn-secondary" onClick={onClose} style={{ padding: '0.4rem 0.6rem' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ alignItems: 'center', marginBottom: '1.5rem' }}>
            <span className="form-label" style={{ marginBottom: '0.5rem' }}>Sua Nota:</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.2rem',
                    transition: 'transform 0.15s'
                  }}
                >
                  <Star
                    size={32}
                    fill={(hoverRating || rating) >= star ? '#fbbf24' : 'transparent'}
                    color={(hoverRating || rating) >= star ? '#fbbf24' : 'var(--text-dim)'}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Seu comentário ou análise:</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="O que você achou da jogabilidade, gráficos e história?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || !comment.trim()}>
              {loading ? 'Salvando...' : initialReview ? 'Atualizar Avaliação' : 'Publicar Avaliação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
