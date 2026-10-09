import React from 'react';
import { Gamepad2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-subtle)',
      background: '#090a0f',
      padding: '2rem 1.5rem',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1300px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div className="navbar-brand-icon" style={{ width: '28px', height: '28px' }}>
            <Gamepad2 size={16} />
          </div>
          <span style={{ fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
            FCG GAMES <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem', fontWeight: 400 }}>© 2026 Todos os direitos reservados.</span>
          </span>
        </div>
      </div>
    </footer>
  );
};
