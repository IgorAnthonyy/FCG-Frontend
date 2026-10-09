import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Gamepad2, ShoppingCart, User as UserIcon, LogOut, ShieldAlert, BookOpen, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { items, openCartDrawer } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <div className="navbar-brand-icon">
            <Gamepad2 size={22} />
          </div>
          <span>
            FCG <span className="gradient-text">GAMES</span>
          </span>
        </Link>

        {/* Links */}
        <div className="navbar-links">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Loja
          </NavLink>

          {isAuthenticated && (
            <>
              <NavLink to="/library" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <BookOpen size={16} />
                Minha Biblioteca
              </NavLink>
              <NavLink to="/orders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Clock size={16} />
                Meus Pedidos
              </NavLink>
            </>
          )}

          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <ShieldAlert size={16} color="#00f2fe" />
              <span style={{ color: '#00f2fe' }}>Painel Admin</span>
            </NavLink>
          )}
        </div>

        {/* Actions */}
        <div className="navbar-actions">
          {/* Cart button */}
          <button className="btn btn-secondary cart-btn-wrap" onClick={openCartDrawer} title="Carrinho de Compras">
            <ShoppingCart size={18} />
            {items.length > 0 && <span className="cart-badge">{items.length}</span>}
          </button>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/profile" className="btn btn-secondary" style={{ padding: '0.5rem 0.9rem' }}>
                <UserIcon size={16} />
                <span>{user?.name?.split(' ')[0] || 'Perfil'}</span>
              </Link>

              <button className="btn btn-secondary" onClick={handleLogout} title="Sair" style={{ padding: '0.5rem 0.8rem' }}>
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary">
                Entrar
              </Link>
              <Link to="/register" className="btn btn-primary">
                Criar Conta
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
