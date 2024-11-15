import { Server, Socket } from 'socket.io';
import logger from './log';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from './types';
import {
  createUserStatus,
  findUserStatusById,
  changeUserStatus,
  changeUserRoomId,
  changeUserIsMatching,
} from './crud/userStatus';
import {
  hasRoom,
  createRoom,
  findRoomById,
  changeRoomMembers,
} from './crud/rooms';
import { getUserRoom } from './services';
import { getRoleInfo } from './api';
import { getRandomInt, getRoomLabel, readLocalJsonFile } from './utils';

logger.info('准备启动 Socket.IO 服务');

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(13000, {
  cors: {
    origin: '*',
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

  socket.on('$startSingleMatch', async (teamTypeId, clientTypeId) => {
    logger.info(`teamTypeId=${teamTypeId} clientTypeId=${clientTypeId}`);
    const userStatus = await changeUserIsMatching(socket.data.userId, true);
    socket.emit('$userStatus', userStatus);
  });

  socket.on('$cancelSingleMatch', async () => {
    const userStatus = await changeUserIsMatching(socket.data.userId, false);
    socket.emit('$userStatus', userStatus);
  });

  socket.on('$newRoom', async password => {
    // 创建房间
    let rand = '';
    do {
      rand = getRandomInt(100000, 999999).toString();
    } while (await hasRoom(rand));
    const gameRole = await getRoleInfo(socket.data.server, socket.data.name);
    const room = await createRoom(rand, password, socket.data.userId, [
      {
        userId: socket.data.userId,
        gameRole,
      },
    ]);

    // 给房主发送房间信息
    const { _id, members, owner, isMatching } = room;
    socket.emit('$roomInfo', _id, members, owner, isMatching);

    // 更改用户状态
    await changeUserStatus(socket.data.userId, 'AtRoom');
    const userStatus = await changeUserRoomId(socket.data.userId, room._id);
    socket.emit('$userStatus', userStatus);

    // 加入socketio的room，可以接收到房间内广播
    socket.join(getRoomLabel(room._id));
  });

  socket.on('$joinRoom', async (roomId, password) => {
    const room = await findRoomById(roomId);
    if (!room) {
      socket.emit('$error', 10000, '房间不存在');
      return;
    }
    if (room?.password !== password) {
      socket.emit('$error', 10001, '房间密码错误');
      return;
    }

    // 更新房间成员列表
    const gameRole = await getRoleInfo(socket.data.server, socket.data.name);
    const newMembers = [
      ...room.members,
      {
        userId: socket.data.userId,
        gameRole,
      },
    ];
    const newRoom = await changeRoomMembers(roomId, newMembers);

    // 给新加入者发送房间信息
    const { _id, members, owner, isMatching } = newRoom;
    socket.emit('$roomInfo', _id, members, owner, isMatching);
    await changeUserStatus(socket.data.userId, 'AtRoom');
    const userStatus = await changeUserRoomId(socket.data.userId, _id);

    // 给新加入者更新用户状态
    await socket.emit('$userStatus', userStatus);

    // 给现有成员发送新成员信息
    io.to(getRoomLabel(room._id)).emit('$roomMembers', members);

    // 新成员加入socketio的room，可以接收到房间内广播
    socket.join(getRoomLabel(room._id));
  });

  socket.on('$exitRoom', async () => {
    const room = await getUserRoom(socket.data.userId);
    if (room) {
      // 离开socketio的room，收不到房间内广播
      socket.leave(getRoomLabel(room._id));

      const newMembers = room.members.filter(
        item => item.userId !== socket.data.userId
      );
      await changeRoomMembers(room._id, newMembers);
      io.to(getRoomLabel(room._id)).emit('$roomMembers', newMembers);

      await changeUserStatus(socket.data.userId, 'AtHome');
      const userStatus = await changeUserRoomId(socket.data.userId, null);
      socket.emit('$userStatus', userStatus);
    }
  });

  const { fingerprint, server, name } = socket.handshake.auth;
  socket.data.userId = fingerprint;
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
    const gameRole = await getRoleInfo(server, name);
    socket.emit('$roleInfo', { userId: socket.data.userId, gameRole });

    // 推送静态信息
    socket.emit('$staticData', teamTypes, clientTypes);

    // 不同状态下的首次推送
    switch (userStatus.status) {
      case 'AtRoom':
        if (userStatus.roomId) {
          const room = await findRoomById(userStatus.roomId);
          if (room) {
            const { _id, members, owner, isMatching } = room;
            socket.emit('$roomInfo', _id, members, owner, isMatching);
            socket.join(getRoomLabel(room._id));
          }
        }
    }
  }
});

logger.info('Socket.IO 服务在端口13000上运行。');
