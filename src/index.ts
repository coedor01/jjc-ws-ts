import { Server, Socket } from 'socket.io';
import logger from './log';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from './types';

logger.info('准备启动 Socket.IO 服务');

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(13000, {
  cors: {
    origin: ['http://127.0.0.1:3000', 'http://localhost:3000'],
    credentials: true,
  },
});

const userSockets: Map<string, Socket> = new Map();

io.on('connection', socket => {
  socket.on('disconnect', () => {
    logger.info(`客户端 ${fingerPrint} 断开连接。`);
    userSockets.delete(fingerPrint);
  });

  const { fingerPrint, server, name } = socket.handshake.auth;
  socket.data.server = server;
  socket.data.name = name;

  const anotherSocket = userSockets.get(fingerPrint);
  if (anotherSocket) {
    logger.info(`用户 ${fingerPrint} 被挤下线。`);
    socket.emit('$roleAlreadyOnline');
    anotherSocket.disconnect(true);
    socket.disconnect(true);
  } else {
    userSockets.set(fingerPrint, socket);
    logger.info(`用户 ${fingerPrint} 登陆。`);
  }
});

logger.info('Socket.IO 服务在端口13000上运行。');
