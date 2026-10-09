import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Gamepad, Star, RefreshCw, ShoppingBag } from 'lucide-react';
import type { LibraryItem } from '../../types';
import { catalogService } from '../../services/catalogService';
import { useToast } from '../../context/ToastContext';

export const Library: React.FC = () => {
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  const fetchLibrary = async () => {
    try {
      setLoading(true);
      const items = await catalogService.getUserLibrary();
      setLibrary(items || []);
    } catch {
      error('Não foi possível carregar a sua biblioteca.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  const fallbackImage = `https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80`;

  return (
    <div>
      <div className="section-title-wrap">
        <div>
          <h1 className="section-title">
            <BookOpen size={28} color="#c084fc" /> Minha <span className="gradient-text">Biblioteca</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Seus jogos adquiridos prontos para jogar na nuvem
          </p>
        </div>

        <button className="btn btn-secondary" onClick={fetchLibrary} title="Atualizar Biblioteca">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="games-grid">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="glass-card" style={{ height: '280px', opacity: 0.5 }} />
          ))}
        </div>
      ) : library.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '550px', margin: '3rem auto' }}>
          <BookOpen size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Sua biblioteca está vazia</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Você ainda não possui nenhum jogo cadastrado. Visite a loja para adquirir os melhores títulos.
          </p>
          <Link to="/" className="btn btn-primary">
            <ShoppingBag size={18} /> Explorar Loja
          </Link>
        </div>
      ) : (
        <div className="games-grid">
          {library.map((item) => {
            const title = item.name || item.gameName || 'Jogo';
            const desc = item.description || item.gameDescription || 'Pronto para execução em nuvem.';
            const img = item.imageUrl || item.gameImageUrl || fallbackImage;
            const targetId = item.id || item.gameId;

            return (
              <div key={item.id || item.externalId} className="glass-card glass-card-hover game-card">
                <div className="game-card-img-wrap">
                  <img
                    src={img}
                    alt={title}
                    className="game-card-img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = fallbackImage;
                    }}
                  />
                </div>

                <div className="game-card-body">
                  <h3 className="game-card-title">{title}</h3>
                  <p className="game-card-desc">{desc}</p>

                  <div className="game-card-footer" style={{ border: 'none', paddingTop: '0' }}>
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                      onClick={() => success(`Conectando aos servidores Cloud para "${title}"...`)}
                    >
                      <Gamepad size={16} /> Jogar
                    </button>
                    {targetId && (
                      <Link
                        to={`/games/${targetId}`}
                        className="btn btn-secondary"
                        style={{ padding: '0.55rem 0.8rem' }}
                        title="Ver Detalhes e Avaliações"
                      >
                        <Star size={16} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
