import { Server } from 'socket.io';
import logger from './log';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  TeamType,
  ClientType,
  MatchingUserGameRole,
  TypedServerSocket,
} from './types';
import {
  createUserStatus,
  findUserStatusById,
  changeUserStatus,
  changeUserRoomId,
  changeUserIsMatching,
  changeUserMatchingId,
  changeUserIsMatchingReady,
} from './crud/userStatus';
import {
  hasRoom,
  createRoom,
  findRoomById,
  changeRoomMembers,
} from './crud/rooms';
import { endMatching, getUserRoom, matchJJC } from './services';
import { getRoleInfo, getJJCPerformance } from './api';
import {
  createMatchingId,
  getMatchingLabel,
  getRandomInt,
  getRoomLabel,
  getSTimestamp,
  readLocalJsonFile,
} from './utils';
import {
  createMatchingUserRole,
  deleteMatchingUserRole,
  findAllMatchingUserRole,
} from './crud/matchingUserRole';
import {
  createMatchingInfo,
  deleteMatchingInfo,
  findMatchingInfoById,
  changeMatchingInfoMates,
  findAllMatchingInfo,
} from './crud/matchingInfos';

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

const userSockets: Map<string, TypedServerSocket> = new Map();
const teamTypes: TeamType[] = readLocalJsonFile('teamTypes.json');
const clientTypes: ClientType[] = readLocalJsonFile('clientTypes.json');

io.on('connection', async socket => {
  socket.on('disconnect', () => {
    logger.info(`客户端 ${fingerprint} 断开连接。`);
    userSockets.delete(fingerprint);
  });

  socket.on('$startSingleMatch', async (teamTypeId, clientTypeId) => {
    logger.info(`teamTypeId=${teamTypeId} clientTypeId=${clientTypeId}`);
    const userStatus = await changeUserIsMatching(socket.data.userId, true);
    const roleInfo = getRoleInfo(socket.data.server, socket.data.name);
    const jjcPerf = getJJCPerformance(socket.data.server, socket.data.name);
    await createMatchingUserRole({
      userId: socket.data.userId,
      server: socket.data.server,
      name: socket.data.name,
      clientTypeId,
      teamTypeId,
      kungfuId: roleInfo.kungfuId,
      grade: jjcPerf.grade,
      mmr: jjcPerf.mmr,
    });
    socket.emit('$userStatus', userStatus);
  });

  socket.on('$cancelSingleMatch', async () => {
    const userStatus = await changeUserIsMatching(socket.data.userId, false);
    await deleteMatchingUserRole(socket.data.userId);
    socket.emit('$userStatus', userStatus);
  });

  socket.on('$newRoom', async password => {
    // 创建房间
    let rand = '';
    do {
      rand = getRandomInt(100000, 999999).toString();
    } while (await hasRoom(rand));
    const gameRole = getRoleInfo(socket.data.server, socket.data.name);
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
    const gameRole = getRoleInfo(socket.data.server, socket.data.name);
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

  socket.on('$acceptMatching', async () => {
    const userStatus = await findUserStatusById(socket.data.userId);

    if (userStatus && userStatus.matchingId) {
      const matchingInfo = await findMatchingInfoById(userStatus.matchingId);

      if (matchingInfo) {
        // 修改匹配记录中的准备状态
        const newMates = [];
        for (const mate of matchingInfo.mates) {
          if (mate.userId === socket.data.userId) {
            newMates.push({ ...mate, isReady: true });
          } else {
            newMates.push(mate);
          }
        }
        const newMatchingInfo = await changeMatchingInfoMates(
          userStatus.matchingId,
          newMates
        );
        io.to(getMatchingLabel(userStatus.matchingId)).emit(
          '$matchingInfo',
          newMatchingInfo
        );

        // 修改用户的准备状态
        const newUserStatus = await changeUserIsMatchingReady(
          socket.data.userId,
          true
        );
        socket.emit('$userStatus', newUserStatus);
      }
    }
  });

  socket.on('$rejectMatching', async () => {
    const userStatus = await findUserStatusById(socket.data.userId);
    if (userStatus && userStatus.matchingId) {
      const matchingInfo = await findMatchingInfoById(userStatus.matchingId);
      // 修改匹配成员的用户状态
      if (matchingInfo) {
        await endMatching(matchingInfo, userSockets);
      }
      // 删除匹配信息
      await deleteMatchingInfo(userStatus.matchingId);
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
    const gameRole = getRoleInfo(server, name);
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
        break;
      case 'AtMatching':
        if (userStatus.matchingId) {
          const matchingInfo = await findMatchingInfoById(
            userStatus.matchingId
          );
          if (matchingInfo) {
            const { _id, clientType, teamType, mates, startAt } = matchingInfo;
            socket.emit('$matchingInfo', {
              _id,
              clientType,
              teamType,
              mates,
              startAt,
            });
          }
        }
        break;
    }
  }
});

logger.info('Socket.IO 服务在端口13000上运行。');

logger.info('准备启动匹配服务。');
setInterval(async () => {
  const res = await findAllMatchingUserRole();
  const docs = res.rows.map(item => item.doc);

  const maxMateCountMap: Map<number, number> = new Map();
  for (const item of teamTypes) {
    maxMateCountMap.set(item.id, item.maxMemberCount);
  }

  //@ts-ignore
  const matchResult = matchJJC(docs, maxMateCountMap);
  for (const result of matchResult.results) {
    const mates: MatchingUserGameRole[] = result.mates.map(item => ({
      userId: item._id,
      gameRole: getRoleInfo(item.server, item.name),
      jjcPerf: getJJCPerformance(item.server, item.name),
      isReady: false,
    }));
    const matchingId = createMatchingId();
    const clientType = clientTypes[result.clientTypeId - 1].label;
    const teamType = teamTypes[result.teamTypeId - 1].label;
    const now = new Date();
    const startAt = getSTimestamp(now);

    // 新建匹配记录
    await createMatchingInfo({
      _id: matchingId,
      clientType,
      teamType,
      mates,
      startAt,
    });

    for (const mate of result.mates) {
      // 将用户从匹配列表中删除
      await deleteMatchingUserRole(mate._id);

      // 更改用户状态
      await changeUserStatus(mate._id, 'AtMatching');
      await changeUserIsMatching(mate._id, false);
      const userStatus = await changeUserMatchingId(mate._id, matchingId);

      // 若在线则推送
      const mateSocket = userSockets.get(mate._id);
      if (mateSocket) {
        mateSocket.emit('$matchingInfo', {
          _id: matchingId,
          clientType,
          teamType,
          mates,
          startAt,
        });
        mateSocket.emit('$userStatus', userStatus);

        // 加入匹配广播房间
        mateSocket.join(getMatchingLabel(matchingId));
      }
    }
  }

  console.log(`matchResult=${JSON.stringify(matchResult)}`);
}, 1000);
logger.info('匹配服务已启动。');

logger.info('准备启动匹配倒计时服务。');
setInterval(async () => {
  const res = await findAllMatchingInfo();
  const docs = res.rows.map(item => item.doc);
  const now = new Date();
  const currentTs = getSTimestamp(now);
  for (const doc of docs) {
    if (doc) {
      const delta = currentTs - doc.startAt;
      if (delta < 60) {
        io.to(getMatchingLabel(doc._id)).emit('$matchingCountdown', 60 - delta);
      } else {
        await endMatching(doc, userSockets);
      }
    }
  }
}, 1000);
logger.info('匹配倒计时服务启动成功。');
