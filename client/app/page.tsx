'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface TradeOrder {
  id: string;
  type: 'BUY' | 'SELL';
  price: number;
  lotSize: number;
}

interface Player {
  id: string;
  username: string;
  balance: number;
  equity: number;
  activeOrders: TradeOrder[];
}

interface MarketTick {
  symbol: string;
  price: number;
  timestamp: number;
}

let socket: Socket;

export default function GameArena() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [marketPrice, setMarketPrice] = useState<number>(2350.0);
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const [lotSize, setLotSize] = useState<number>(1.0);
  const [username, setUsername] = useState<string>('');
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);

  useEffect(() => {
    socket = io('http://localhost:4000');

    socket.on('market:tick', (tick: MarketTick) => {
      setMarketPrice(tick.price);
      setPriceHistory((prev) => [...prev.slice(-19), tick.price]);
    });

    socket.on('player:state', (updatedPlayer: Player) => {
      setPlayer(updatedPlayer);
    });

    socket.on('player:equity', (equity: number) => {
      setPlayer((prev) => (prev ? { ...prev, equity } : null));
    });

    socket.on('leaderboard:update', (players: Player[]) => {
      setLeaderboard(players.sort((a, b) => b.equity - a.equity));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    socket.emit('player:join', username);
    setIsJoined(true);
  };

  const handleOpenOrder = (type: 'BUY' | 'SELL') => {
    socket.emit('order:open', { type, lotSize });
  };

  const handleCloseOrder = (orderId: string) => {
    socket.emit('order:close', orderId);
  };

  if (!isJoined) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <form onSubmit={handleJoin} className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full shadow-2xl space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-emerald-400">MarketPulse Arena</h1>
            <p className="text-sm text-slate-400">Live Real-Time Algorithmic Trading Simulation</p>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Trader Call-Sign</label>
            <input
              type="text"
              placeholder="e.g. AlphaTrader"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 transition text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/10"
          >
            Enter Live Arena
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      {/* Header bar */}
      <header className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-black text-emerald-400 tracking-tight">MarketPulse</h1>
          <p className="text-xs text-slate-400 font-mono">ASSET: XAUUSD (Gold Spot) • STATUS: LIVE STREAM</p>
        </div>
        <div className="flex items-center gap-6 bg-slate-900 border border-slate-800 px-5 py-2.5 rounded-xl font-mono text-sm">
          <div>
            <span className="text-slate-500 text-xs block">BALANCE</span>
            <span className="font-semibold text-slate-200">${player?.balance.toFixed(2)}</span>
          </div>
          <div className="h-7 w-px bg-slate-800" />
          <div>
            <span className="text-slate-500 text-xs block">EQUITY</span>
            <span className={`font-bold ${(player?.equity ?? 0) >= (player?.balance ?? 0) ? 'text-emerald-400' : 'text-rose-400'}`}>
              ${player?.equity.toFixed(2)}
            </span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Visualizer */}
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Spot Rate</span>
              <span className="text-4xl font-black font-mono text-amber-400 tracking-tight">${marketPrice.toFixed(2)}</span>
            </div>

            {/* Price Line Simulation */}
            <div className="h-44 bg-slate-950 border border-slate-800 rounded-xl flex items-end px-3 py-2 gap-1.5 overflow-hidden">
              {priceHistory.map((val, idx) => {
                const min = Math.min(...priceHistory);
                const max = Math.max(...priceHistory);
                const range = max - min || 1;
                const heightPercent = Math.max(15, Math.min(95, ((val - min) / range) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t transition-all duration-300 ${
                        idx > 0 && val >= priceHistory[idx - 1] ? 'bg-emerald-500/70' : 'bg-rose-500/70'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {/* Trading Desk Controls */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl">
                <span className="text-xs text-slate-400 font-semibold uppercase">Lot:</span>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="10"
                  value={lotSize}
                  onChange={(e) => setLotSize(parseFloat(e.target.value) || 0.1)}
                  className="w-16 bg-transparent text-right font-mono font-bold focus:outline-none text-slate-100"
                />
              </div>

              <button
                onClick={() => handleOpenOrder('BUY')}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-xl transition shadow-lg shadow-emerald-950"
              >
                BUY / LONG
              </button>
              <button
                onClick={() => handleOpenOrder('SELL')}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 font-bold rounded-xl transition shadow-lg shadow-rose-950"
              >
                SELL / SHORT
              </button>
            </div>
          </div>

          {/* Active Orders Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Open Positions</h2>
            {player?.activeOrders.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center font-mono">No exposure. Open a trade to start earning.</p>
            ) : (
              <div className="divide-y divide-slate-800 font-mono text-sm">
                {player?.activeOrders.map((ord) => {
                  const multiplier = ord.type === 'BUY' ? 1 : -1;
                  const pnl = (marketPrice - ord.price) * multiplier * ord.lotSize * 100;
                  return (
                    <div key={ord.id} className="py-3 flex justify-between items-center">
                      <div className="space-y-0.5">
                        <span className={`text-xs px-2 py-0.5 rounded font-bold ${ord.type === 'BUY' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                          {ord.type}
                        </span>
                        <span className="text-xs text-slate-400 ml-2">@ ${ord.price.toFixed(2)} ({ord.lotSize} Lots)</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`font-bold ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleCloseOrder(ord.id)}
                          className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-lg text-slate-300 font-semibold"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Global Arena Leaderboard */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 h-fit">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Live Leaderboard</h2>
          <div className="divide-y divide-slate-800 font-mono text-sm">
            {leaderboard.map((item, idx) => (
              <div key={item.id} className="py-2.5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 font-bold">#{idx + 1}</span>
                  <span className="font-medium text-slate-200">{item.username}</span>
                </div>
                <span className="font-semibold text-emerald-400">${item.equity.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}