import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';

let io: Server;

export function initWebSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    socket.on('join', (room: string) => socket.join(room));
    socket.on('leave', (room: string) => socket.leave(room));
  });
}

export function emitEvent(room: string, event: string, data: any) {
  if (io) io.to(room).emit(event, data);
}
