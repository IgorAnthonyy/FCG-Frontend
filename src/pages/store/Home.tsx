import React, { useState, useEffect, useMemo } from 'react';
import { Search, Sparkles, Filter, RefreshCw, Flame, Gamepad2 } from 'lucide-react';
import type { Game, Category, LibraryItem } from '../../types';
import { catalogService } from '../../services/catalogService';
import { GameCard } from '../../components/GameCard';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const Home: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [userLibrary, setUserLibrary] = useState<LibraryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const { isAuthenticated } = useAuth();
  const { error } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [gamesData, categoriesData] = await Promise.all([
        catalogService.getAllGames(),
        catalogService.getAllCategories(),
      ]);

      setGames(gamesData || []);
      setCategories(categoriesData || []);

      if (isAuthenticated) {
        try {
          const libraryData = await catalogService.getUserLibrary();
          setUserLibrary(libraryData || []);
        } catch {
          // ignore library fetch error if user is unauthenticated
        }
      }
    } catch {
      error('Não foi possível carregar os jogos do catálogo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  const ownedGameIds = useMemo(() => {
    return new Set(userLibrary.map((item) => item.gameId));
  }, [userLibrary]);

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const name = game.name ?? '';
      const desc = game.description ?? '';
      const query = (searchQuery ?? '').toLowerCase();

      const matchesSearch =
        name.toLowerCase().includes(query) ||
        desc.toLowerCase().includes(query);

      const matchesCategory =
        selectedCategory === null ||
        game.categoryIds?.includes(selectedCategory) ||
        game.categories?.some((c) => c.id === selectedCategory) ||
        (game as unknown as { categoryId?: number }).categoryId === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [games, searchQuery, selectedCategory]);

  return (
    <div>
      {/* Hero Banner */}
      <div
        className="glass-card"
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '3rem 2rem',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '2.5rem',
          background: 'linear-gradient(135deg, rgba(121, 40, 202, 0.3) 0%, rgba(18, 20, 30, 0.9) 60%)',
          border: '1px solid rgba(121, 40, 202, 0.3)',
        }}
      >
        <div style={{ maxWidth: '650px', position: 'relative', zIndex: 2 }}>
          <div className="badge badge-purple" style={{ marginBottom: '1rem' }}>
            <Sparkles size={14} /> FIAP Cloud Gaming 2026
          </div>
          <h1 style={{ fontSize: '2.8rem', lineHeight: 1.1, marginBottom: '1rem', fontWeight: 900 }}>
            Jogue Sem Limites na <span className="gradient-text">Nuvem</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Explore centenas de títulos, compre instantaneamente e jogue em qualquer dispositivo com a melhor arquitetura de microsserviços.
          </p>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href="#catalogo" className="btn btn-primary" style={{ padding: '0.8rem 1.6rem' }}>
              <Flame size={18} /> Explorar Catálogo
            </a>
          </div>
        </div>

        {/* Ambient background glow decoration */}
        <div style={{
          position: 'absolute',
          right: '-50px',
          top: '-50px',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 0, 128, 0.25) 0%, transparent 70%)',
          filter: 'blur(30px)',
          zIndex: 1
        }} />
      </div>

      {/* Catalog Section */}
      <div id="catalogo">
        {/* Controls: Search and Filters */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem'
        }}>
          {/* Search */}
          <div style={{ position: 'relative', minWidth: '280px', flex: '1 1 300px' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Buscar jogos por título ou descrição..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          </div>

          {/* Refresh button */}
          <button className="btn btn-secondary" onClick={fetchData} title="Atualizar Catálogo">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Categories Pills */}
        <div style={{
          display: 'flex',
          gap: '0.6rem',
          overflowX: 'auto',
          paddingBottom: '0.75rem',
          marginBottom: '1.5rem',
          scrollbarWidth: 'none'
        }}>
          <button
            className={`btn ${selectedCategory === null ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)', padding: '0.4rem 1rem', fontSize: '0.85rem' }}
            onClick={() => setSelectedCategory(null)}
          >
            <Filter size={14} /> Todos ({games.length})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`btn ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 'var(--radius-full)', padding: '0.4rem 1rem', fontSize: '0.85rem' }}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Games List */}
        {loading ? (
          <div className="games-grid">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="glass-card" style={{ height: '320px', opacity: 0.5, animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <Gamepad2 size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Nenhum jogo encontrado</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              Tente alterar os termos da busca ou limpar os filtros de categoria.
            </p>
          </div>
        ) : (
          <div className="games-grid">
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                isOwned={ownedGameIds.has(game.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
