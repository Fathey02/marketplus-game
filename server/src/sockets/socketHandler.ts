import { Server, Socket } from 'socket.io';
import { MarketEngine } from '../domain/MarketEngine';
import { Player, TradeOrder } from '../interfaces';

export function setupSocketHandlers(io: Server, engine: MarketEngine) {
  const players = new Map<string, Player>();

  io.on('connection', (socket: Socket) => {
    socket.on('player:join', (username: string) => {
      const newPlayer: Player = {
        id: socket.id,
        username: username?.trim() || `Trader_${socket.id.substring(0, 4)}`,
        balance: 10000,
        equity: 10000,
        activeOrders: [],
      };
      players.set(socket.id, newPlayer);
      socket.emit('player:state', newPlayer);
      io.emit('leaderboard:update', Array.from(players.values()));
    });

    socket.on('order:open', (data: { type: 'BUY' | 'SELL'; lotSize: number }) => {
      const player = players.get(socket.id);
      if (!player) return;

      const order: TradeOrder = {
        id: `ord_${Date.now()}`,
        playerId: socket.id,
        type: data.type,
        price: engine.getCurrentPrice(),
        lotSize: Math.max(0.1, data.lotSize || 1),
        openTime: Date.now(),
      };

      player.activeOrders.push(order);
      socket.emit('order:opened', order);
      socket.emit('player:state', player);
    });

    socket.on('order:close', (orderId: string) => {
      const player = players.get(socket.id);
      if (!player) return;

      const index = player.activeOrders.findIndex((o) => o.id === orderId);
      if (index !== -1) {
        const order = player.activeOrders[index];
        const profit = engine.calculatePnL(order, engine.getCurrentPrice());
        player.balance = parseFloat((player.balance + profit).toFixed(2));
        player.activeOrders.splice(index, 1);

        socket.emit('order:closed', { orderId, profit });
        socket.emit('player:state', player);
        io.emit('leaderboard:update', Array.from(players.values()));
      }
    });

    socket.on('disconnect', () => {
      players.delete(socket.id);
      io.emit('leaderboard:update', Array.from(players.values()));
    });
  });

  setInterval(() => {
    const tick = engine.generateNextTick();
    io.emit('market:tick', tick);

    players.forEach((player) => {
      let floatingProfit = 0;
      player.activeOrders.forEach((order) => {
        floatingProfit += engine.calculatePnL(order, tick.price);
      });
      player.equity = parseFloat((player.balance + floatingProfit).toFixed(2));
      io.to(player.id).emit('player:equity', player.equity);
    });
  }, 1000);
}