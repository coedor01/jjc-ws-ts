import { Server, Socket } from 'socket.io';
import logger from './log';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from './types';
import { createUserStatus, findUserStatusById } from './crud/userStatus';
import { getRoleInfo } from './api';
import { readLocalJsonFile } from './utils';

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
const teamTypes = readLocalJsonFile('teamTypes.json');
const clientTypes = readLocalJsonFile('clientTypes.json');

io.on('connection', async socket => {
  socket.on('disconnect', () => {
    logger.info(`客户端 ${fingerprint} 断开连接。`);
    userSockets.delete(fingerprint);
  });

  const { fingerprint, server, name } = socket.handshake.auth;
  socket.data.server = server;
  socket.data.name = name;
  const anotherSocket = userSockets.get(fingerprint);

  // 单点登陆
  if (anotherSocket) {
    // 多个用户登陆时处理逻辑
    logger.info(`用户 ${fingerprint} 被挤下线。`);
    socket.emit('$userAlreadyOnline');
    anotherSocket.disconnect(true);
    socket.disconnect(true);
  } else {
    // 正常登陆情况
    userSockets.set(fingerprint, socket);
    logger.info(`用户 ${fingerprint} 登陆。`);

    // 推送用户状态
    let userStatus = await findUserStatusById(fingerprint);
    if (!userStatus) {
      userStatus = await createUserStatus(fingerprint);
    }
    socket.emit('$userStatus', userStatus);

    // 推送角色信息
    const roleInfo = await getRoleInfo(server, name);
    socket.emit('$roleInfo', roleInfo);

    // 推送静态信息
    socket.emit('$staticData', teamTypes, clientTypes);
  }
});

logger.info('Socket.IO 服务在端口13000上运行。');
