import { RoomDoc } from './crud/db';
import { findUserStatusById } from './crud/userStatus';
import { findRoomById } from './crud/rooms';

async function getUserRoom(userId: string): Promise<RoomDoc | null> {
  const userStatus = await findUserStatusById(userId);
  let room: RoomDoc | null = null;
  if (userStatus?.roomId) {
    room = await findRoomById(userStatus.roomId);
  }
  return room;
}

export { getUserRoom };
