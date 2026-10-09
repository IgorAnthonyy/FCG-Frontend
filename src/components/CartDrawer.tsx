import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const CartDrawer: React.FC = () => {
  const { isCartDrawerOpen, closeCartDrawer, items, removeFromCart, totalAmount, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isCartDrawerOpen) return null;

  const handleProceedToCheckout = () => {
    closeCartDrawer();
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <>
      <div className="cart-drawer-backdrop" onClick={closeCartDrawer} />
      <div className="cart-drawer">
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingBag size={20} color="#c084fc" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Meu Carrinho</h3>
            <span className="badge badge-purple">{items.length} itens</span>
          </div>
          <button className="btn btn-secondary" onClick={closeCartDrawer} style={{ padding: '0.4rem 0.6rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Items list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <ShoppingBag size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                Seu carrinho está vazio
              </p>
              <p style={{ fontSize: '0.9rem' }}>Navegue pela loja e adicione jogos incríveis ao seu carrinho!</p>
            </div>
          ) : (
            items.map((game) => (
              <div
                key={game.id}
                className="glass-card"
                style={{
                  padding: '0.9rem',
                  display: 'flex',
                  gap: '0.9rem',
                  alignItems: 'center'
                }}
              >
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  background: '#191c2b',
                  flexShrink: 0
                }}>
                  {game.imageUrl ? (
                    <img src={game.imageUrl} alt={game.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
                      🎮
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {game.name}
                  </h4>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    R$ {Number(game.price || 0).toFixed(2)}
                  </span>
                </div>

                <button
                  className="btn btn-danger"
                  style={{ padding: '0.4rem 0.6rem' }}
                  onClick={() => removeFromCart(game.id)}
                  title="Remover item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        {items.length > 0 && (
          <div style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            background: 'rgba(10, 11, 16, 0.7)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total a pagar:</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#fff' }}>
                R$ {totalAmount.toFixed(2)}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={clearCart}>
                Limpar
              </button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleProceedToCheckout}>
                <span>Finalizar Pedido</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
