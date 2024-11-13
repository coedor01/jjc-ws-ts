import { checkExist, RoomDoc, roomDocs } from './db';

async function createRoom({
  _id,
  password,
  owner,
  isMatching,
  members,
}: RoomDoc): Promise<RoomDoc> {
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

module.exports = {
  createRoom,
  findRoomById,
  deleteRoom,
  changeRoomOwner,
  changeRoomStatus,
};
