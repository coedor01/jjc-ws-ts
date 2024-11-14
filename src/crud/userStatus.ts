import { userStatusDocs, checkExist, UserStatusDoc, UserStatus } from './db';

async function findUserStatusById(_id: string): Promise<UserStatusDoc | null> {
  let doc = null;
  if (await checkExist(userStatusDocs, _id)) {
    doc = await userStatusDocs.get(_id);
  }
  return doc;
}

async function createUserStatus(
  _id: string,
  status: UserStatus = 'AtHome',
  isMatching: boolean = false,
  roomId: number | null = null,
  teamId: number | null = null
): Promise<UserStatusDoc> {
  const res = await userStatusDocs.put({
    _id,
    status,
    isMatching,
    roomId,
    teamId,
  });
  const doc = await userStatusDocs.get(res.id);
  return doc;
}

async function patchUserStatus(
  _id: string,
  status: UserStatus
): Promise<UserStatusDoc> {
  const doc = await userStatusDocs.get(_id);
  doc.status = status;
  userStatusDocs.put(doc);
  return doc;
}

async function patchUserIsMatching(
  _id: string,
  isMatching: boolean
): Promise<UserStatusDoc> {
  const doc = await userStatusDocs.get(_id);
  doc.isMatching = isMatching;
  userStatusDocs.put(doc);
  return doc;
}

async function patchUserRoomId(
  _id: string,
  roomId: number | null
): Promise<UserStatusDoc> {
  const doc = await userStatusDocs.get(_id);
  doc.roomId = roomId;
  userStatusDocs.put(doc);
  return doc;
}

async function patchUserTeamId(
  _id: string,
  teamId: number | null
): Promise<UserStatusDoc> {
  const doc = await userStatusDocs.get(_id);
  doc.teamId = teamId;
  userStatusDocs.put(doc);
  return doc;
}

export {
  findUserStatusById,
  createUserStatus,
  patchUserStatus,
  patchUserIsMatching,
  patchUserRoomId,
  patchUserTeamId,
};
