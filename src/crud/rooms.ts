import { checkExist, RoomDoc, roomDocs } from './db';
import { UserGameRole } from '../types';

async function hasRoom(_id: string) {
  return await checkExist(roomDocs, _id);
}

async function createRoom(
  _id: string,
  password: string,
  owner: string,
  members: UserGameRole[],
  isMatching: boolean = false
): Promise<RoomDoc> {
  const res = await roomDocs.put({ _id, password, owner, isMatching, members });
  const doc = await roomDocs.get(res.id);
  return doc;
}

async function findRoomById(_id: string): Promise<RoomDoc | null> {
  let doc = null;
  if (await checkExist(roomDocs, _id)) {
    doc = await roomDocs.get(_id);
  }
  return doc;
}

async function deleteRoom(_id: string) {
  const doc = await roomDocs.get(_id);
  await roomDocs.remove(doc);
}

async function changeRoomOwner(_id: string, owner: string): Promise<RoomDoc> {
  const doc = await roomDocs.get(_id);
  doc.owner = owner;
  roomDocs.put(doc);
  return doc;
}

async function changeRoomStatus(
  _id: string,
  isMatching: boolean
): Promise<RoomDoc> {
  const doc = await roomDocs.get(_id);
  doc.isMatching = isMatching;
  roomDocs.put(doc);
  return doc;
}

async function changeRoomMembers(
  _id: string,
  members: UserGameRole[]
): Promise<RoomDoc> {
  const doc = await roomDocs.get(_id);
  doc.members = members;
  roomDocs.put(doc);
  return doc;
}

export {
  hasRoom,
  createRoom,
  findRoomById,
  deleteRoom,
  changeRoomOwner,
  changeRoomStatus,
  changeRoomMembers,
};
