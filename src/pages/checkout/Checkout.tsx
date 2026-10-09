import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  ShoppingBag, 
  Sparkles,
  Zap,
  Lock
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { ordersService } from '../../services/ordersService';
import { useToast } from '../../context/ToastContext';
import { catalogService } from '../../services/catalogService';

export const Checkout: React.FC = () => {
  const { items, totalAmount, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrders, setCreatedOrders] = useState<number[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix' | 'crypto'>('credit_card');

  const { success, error } = useToast();
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;

    try {
      setLoading(true);
      const placedIds: number[] = [];

      // Place order for each game in cart through Catalog API
      for (const game of items) {
        let externalId = game.externalId;
        if (!externalId) {
          try {
            const gameDetails = await catalogService.getGameById(game.id);
            externalId = gameDetails.externalId;
          } catch {
            // fallback
          }
        }

        if (!externalId) {
          throw new Error(`Não foi possível obter o identificador único do jogo "${game.name}".`);
        }

        const response = await ordersService.placeOrder({
          gameId: externalId,
        });
        if (response?.id) {
          placedIds.push(response.id);
        }
      }

      setCreatedOrders(placedIds);
      setOrderSuccess(true);
      clearCart();
      success('Pedido realizado com sucesso! O pagamento está sendo processado.');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; errorMessages?: string[]; errors?: Record<string, string[]> } }; message?: string };
      const apiErrors = axiosErr.response?.data?.errorMessages || 
        (axiosErr.response?.data?.errors ? Object.values(axiosErr.response.data.errors).flat() : null);
      const msg = apiErrors?.[0] || axiosErr.response?.data?.message || axiosErr.message || 'Erro ao processar pedido. Tente novamente.';
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '3rem 2rem' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            border: '2px solid rgba(16, 185, 129, 0.4)'
          }}>
            <CheckCircle2 size={42} />
          </div>

          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.8rem' }}>
            Pedido Confirmado!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Seu pedido foi publicado no RabbitMQ e enviado para o microsserviço de pagamentos. Assim que confirmado, os jogos estarão disponíveis na sua biblioteca.
          </p>

          {createdOrders.length > 0 && (
            <div style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.4rem' }}>
                Protocolo(s) do Pedido:
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {createdOrders.map((id) => (
                  <span key={id} className="badge badge-cyan" style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>
                    #{id}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/library" className="btn btn-primary" style={{ padding: '0.8rem 1.6rem' }}>
              <Zap size={18} /> Ir para Minha Biblioteca
            </Link>
            <Link to="/orders" className="btn btn-secondary" style={{ padding: '0.8rem 1.6rem' }}>
              Ver Meus Pedidos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="glass-card" style={{ maxWidth: '500px', margin: '4rem auto', padding: '3rem 2rem', textAlign: 'center' }}>
        <ShoppingBag size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Seu carrinho está vazio</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Adicione jogos antes de prosseguir para o checkout.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Ir para a Loja
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
        Finalizar <span className="gradient-text">Pedido</span>
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Confirme os detalhes da compra para liberação instantânea no ecossistema FCG
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Left Column: Items and Payment Method */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Items Summary */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingBag size={18} color="#c084fc" /> Jogos no Pedido ({items.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {items.map((game) => (
                <div key={game.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '6px', overflow: 'hidden', background: '#191c2b' }}>
                      {game.imageUrl ? (
                        <img src={game.imageUrl} alt={game.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎮</div>
                      )}
                    </div>
                    <span style={{ fontWeight: 600 }}>{game.name}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    R$ {Number(game.price || 0).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={18} color="#00f2fe" /> Método de Pagamento
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
              <button
                type="button"
                className={`btn ${paymentMethod === 'credit_card' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.8rem', flexDirection: 'column', height: '80px', borderRadius: 'var(--radius-md)' }}
                onClick={() => setPaymentMethod('credit_card')}
              >
                <CreditCard size={22} />
                <span style={{ fontSize: '0.85rem' }}>Cartão de Crédito</span>
              </button>

              <button
                type="button"
                className={`btn ${paymentMethod === 'pix' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.8rem', flexDirection: 'column', height: '80px', borderRadius: 'var(--radius-md)' }}
                onClick={() => setPaymentMethod('pix')}
              >
                <Zap size={22} />
                <span style={{ fontSize: '0.85rem' }}>PIX Instantâneo</span>
              </button>

              <button
                type="button"
                className={`btn ${paymentMethod === 'crypto' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.8rem', flexDirection: 'column', height: '80px', borderRadius: 'var(--radius-md)' }}
                onClick={() => setPaymentMethod('crypto')}
              >
                <Sparkles size={22} />
                <span style={{ fontSize: '0.85rem' }}>FCG Coins</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Order Total & Submit */}
        <div>
          <div className="glass-card" style={{ padding: '1.8rem', position: 'sticky', top: '100px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.2rem' }}>Resumo da Fatura</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal</span>
                <span>R$ {totalAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Taxa de processamento</span>
                <span style={{ color: '#10b981' }}>Grátis (0%)</span>
              </div>
              <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.5rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Total:</span>
                <span style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#fff' }}>
                  R$ {totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.95rem', fontSize: '1.05rem' }}
              onClick={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? 'Transmitindo Pedido...' : (
                <>
                  <Lock size={18} />
                  <span>Pagar R$ {totalAmount.toFixed(2)}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.2rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
              <ShieldCheck size={14} color="#10b981" />
              Transação criptografada & processada via RabbitMQ
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
