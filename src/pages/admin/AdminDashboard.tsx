import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Gamepad2, 
  FolderTree, 
  UserPlus, 
  ArrowRight, 
  Sparkles
} from 'lucide-react';
import { catalogService } from '../../services/catalogService';

export const AdminDashboard: React.FC = () => {
  const [gamesCount, setGamesCount] = useState(0);
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        const [games, categories] = await Promise.all([
          catalogService.getAllGames().catch(() => []),
          catalogService.getAllCategories().catch(() => []),
        ]);
        setGamesCount(games.length || 0);
        setCategoriesCount(categories.length || 0);
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, []);

  return (
    <div>
      <div className="section-title-wrap">
        <div>
          <h1 className="section-title">
            <Sparkles size={28} color="#00f2fe" /> Painel <span className="gradient-text">Administrativo</span>
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Gerenciamento de jogos, categorias e contas administrativas
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Total de Jogos</span>
            <div style={{ padding: '0.5rem', background: 'rgba(121, 40, 202, 0.2)', borderRadius: '10px', color: '#c084fc' }}>
              <Gamepad2 size={22} />
            </div>
          </div>
          <span style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>
            {loading ? '...' : gamesCount}
          </span>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Categorias Cadastradas</span>
            <div style={{ padding: '0.5rem', background: 'rgba(0, 242, 254, 0.15)', borderRadius: '10px', color: '#00f2fe' }}>
              <FolderTree size={22} />
            </div>
          </div>
          <span style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>
            {loading ? '...' : categoriesCount}
          </span>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.2rem' }}>Módulos de Gestão</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <Link to="/admin/games" className="glass-card glass-card-hover" style={{ padding: '1.8rem' }}>
          <Gamepad2 size={32} color="#c084fc" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.4rem' }}>Gestão de Jogos</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
            Cadastrar novos títulos, atualizar preços, descrições e vincular categorias.
          </p>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c084fc', fontWeight: 600, fontSize: '0.9rem' }}>
            Gerenciar Jogos <ArrowRight size={16} />
          </span>
        </Link>

        <Link to="/admin/categories" className="glass-card glass-card-hover" style={{ padding: '1.8rem' }}>
          <FolderTree size={32} color="#00f2fe" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.4rem' }}>Gestão de Categorias</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
            Criar, editar e organizar as categorias que classificam os jogos na vitrine.
          </p>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#00f2fe', fontWeight: 600, fontSize: '0.9rem' }}>
            Gerenciar Categorias <ArrowRight size={16} />
          </span>
        </Link>

        <Link to="/admin/users" className="glass-card glass-card-hover" style={{ padding: '1.8rem' }}>
          <UserPlus size={32} color="#10b981" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.4rem' }}>Gestão de Administradores</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
            Conceder privilégios administrativos e gerenciar contas no microsserviço de usuários.
          </p>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontWeight: 600, fontSize: '0.9rem' }}>
            Gerenciar Contas <ArrowRight size={16} />
          </span>
        </Link>
      </div>
    </div>
  );
};
