import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check, Gamepad } from 'lucide-react';
import type { Game } from '../types';
import { useCart } from '../context/CartContext';

interface GameCardProps {
  game: Game;
  isOwned?: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({ game, isOwned = false }) => {
  const { addToCart, isItemInCart } = useCart();
  const inCart = isItemInCart(game.id);

  const fallbackImage = `https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80`;

  return (
    <div className="glass-card glass-card-hover game-card">
      <Link to={`/games/${game.id}`} className="game-card-img-wrap">
        <img
          src={game.imageUrl || fallbackImage}
          alt={game.name}
          className="game-card-img"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackImage;
          }}
        />
        {isOwned && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(16, 185, 129, 0.9)',
            color: '#fff',
            padding: '0.2rem 0.6rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            boxShadow: '0 2px 10px rgba(0,0,0,0.5)'
          }}>
            <Check size={12} /> Adquirido
          </div>
        )}
      </Link>

      <div className="game-card-body">
        <Link to={`/games/${game.id}`}>
          <h3 className="game-card-title">{game.name}</h3>
        </Link>
        <p className="game-card-desc">{game.description}</p>

        {(game.category || (game.categories && game.categories.length > 0)) && (
          <div className="game-card-categories">
            {game.category ? (
              <span className="badge badge-purple">{game.category.name}</span>
            ) : (
              game.categories?.map((cat) => (
                <span key={cat.id} className="badge badge-purple">
                  {cat.name}
                </span>
              ))
            )}
          </div>
        )}

        <div className="game-card-footer">
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Preço</span>
            <span className="game-price">R$ {Number(game.price || 0).toFixed(2)}</span>
          </div>

          {isOwned ? (
            <Link to={`/games/${game.id}`} className="btn btn-secondary" style={{ padding: '0.5rem 0.8rem' }}>
              <Gamepad size={16} /> Jogar
            </Link>
          ) : (
            <button
              className={`btn ${inCart ? 'btn-outline-cyan' : 'btn-primary'}`}
              style={{ padding: '0.55rem 0.9rem' }}
              onClick={() => addToCart(game)}
              disabled={inCart}
            >
              {inCart ? (
                <>
                  <Check size={16} /> No Carrinho
                </>
              ) : (
                <>
                  <ShoppingCart size={16} /> Comprar
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
