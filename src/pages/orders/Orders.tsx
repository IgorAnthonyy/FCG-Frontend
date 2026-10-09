import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw, ShoppingBag, CheckCircle, AlertCircle, Hourglass } from 'lucide-react';
import type { GameOrder, Game } from '../../types';
import { ordersService } from '../../services/ordersService';
import { catalogService } from '../../services/catalogService';
import { useToast } from '../../context/ToastContext';

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<GameOrder[]>([]);
  const [gamesMap, setGamesMap] = useState<Record<number, Game>>({});
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  const fetchOrdersAndGames = async () => {
    try {
      setLoading(true);
      const [ordersData, gamesData] = await Promise.all([
        ordersService.getUserOrders().catch(() => []),
        catalogService.getAllGames().catch(() => []),
      ]);

      const map: Record<number, Game> = {};
      if (Array.isArray(gamesData)) {
        gamesData.forEach((g) => {
          map[g.id] = g;
        });
      }
      setGamesMap(map);
      setOrders(ordersData || []);
    } catch {
      error('Não foi possível carregar o histórico de pedidos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersAndGames();
  }, []);

  const getStatusBadge = (status: string | number | unknown) => {
    let s = '';
    if (typeof status === 'number') {
      if (status === 0) s = 'pending';
      else if (status === 1) s = 'approved';
      else if (status === 2) s = 'rejected';
      else s = String(status);
    } else {
      s = String(status ?? '').toLowerCase();
    }

    if (s === 'completed' || s === 'paid' || s === 'approved' || s === '1') {
      return (
        <span className="badge badge-green">
          <CheckCircle size={12} /> Aprovado / Concluído
        </span>
      );
    }
    if (s === 'pending' || s === 'processing' || s === '0') {
      return (
        <span className="badge badge-yellow">
          <Hourglass size={12} /> Processando
        </span>
      );
    }
    if (s === 'rejected' || s === 'failed' || s === '2') {
      return (
        <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <AlertCircle size={12} /> Rejeitado
        </span>
      );
    }
    return (
      <span className="badge badge-purple">
        <AlertCircle size={12} /> {String(status)}
      </span>
    );
  };

  return (
    <div>
      <div className="section-title-wrap">
        <div>
          <h1 className="section-title">
            <Clock size={28} color="#00f2fe" /> Meus <span className="gradient-text">Pedidos</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Histórico completo de transações e status de processamento
          </p>
        </div>

        <button className="btn btn-secondary" onClick={fetchOrdersAndGames} title="Atualizar Pedidos">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="badge badge-purple">Carregando pedidos...</div>
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '550px', margin: '3rem auto' }}>
          <ShoppingBag size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Nenhum pedido realizado</h2>
          <p style={{ color: 'var(--text-muted)' }}>Você ainda não realizou compras na plataforma.</p>
        </div>
      ) : (
        <div className="glass-card" style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Protocolo</th>
                <th>Nome do Jogo</th>
                <th>ID do Jogo</th>
                <th>Valor Pago</th>
                <th>Status</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const game = gamesMap[order.gameId];
                const gameName = order.gameName || game?.name || `Jogo #${order.gameId}`;
                const price = order.price ?? game?.price;

                return (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>#{order.id}</td>
                    <td style={{ fontWeight: 700, color: '#fff' }}>{gameName}</td>
                    <td style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>#{order.gameId}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      {price !== undefined && price !== null ? `R$ ${Number(price).toFixed(2)}` : '-'}
                    </td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleString('pt-BR') : 'Recente'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
