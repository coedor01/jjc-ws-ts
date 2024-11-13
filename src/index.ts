import { Server } from 'socket.io';
import logger from './log';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from './types';
import { findRoleById } from './crud/roles';
import { getRoleLabel } from './utils';

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

io.on('connection', socket => {
  logger.info(`客户端 ${socket.handshake.address} 成功建立连接`);
  socket.on('disconnect', () => {
    logger.info(`客户端 ${socket.handshake.address} 断开连接。`);
  });
  socket.on('$role', async (server, name) => {
    let role = await findRoleById(getRoleLabel(server, name));
    if (!role) {
    }
  });
});

logger.info('Socket.IO 服务在端口13000上运行。');
