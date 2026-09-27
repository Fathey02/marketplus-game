import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { MarketEngine } from './domain/MarketEngine';
import { setupSocketHandlers } from './sockets/socketHandler';

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const marketEngine = new MarketEngine('XAUUSD', 2350.0);
setupSocketHandlers(io, marketEngine);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 MarketPulse Server is running on http://localhost:${PORT}`);
});