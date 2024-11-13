import { GameRole } from '../types';
import { roleDocs, checkExist, RoleDoc, RoleStatus } from './db';

async function findRoleById(_id: string): Promise<RoleDoc | null> {
  let doc = null;
  if (await checkExist(roleDocs, _id)) {
    doc = await roleDocs.get(_id);
  }
  return doc;
}

async function createRole({
  _id,
  status,
  isMatching,
  roomId,
  teamId,
  attribute,
}: RoleDoc): Promise<RoleDoc> {
  const res = await roleDocs.put({
    _id,
    status,
    isMatching,
    roomId,
    teamId,
    attribute,
  });
  const doc = await roleDocs.get(res.id);
  return doc;
}

async function patchRoleStatus(
  _id: string,
  status: RoleStatus
): Promise<RoleDoc> {
  const doc = await roleDocs.get(_id);
  doc.status = status;
  roleDocs.put(doc);
  return doc;
}

async function patchRoleIsMatching(
  _id: string,
  isMatching: boolean
): Promise<RoleDoc> {
  const doc = await roleDocs.get(_id);
  doc.isMatching = isMatching;
  roleDocs.put(doc);
  return doc;
}

async function patchRoleRoomId(
  _id: string,
  roomId: number | null
): Promise<RoleDoc> {
  const doc = await roleDocs.get(_id);
  doc.roomId = roomId;
  roleDocs.put(doc);
  return doc;
}

async function patchRoleTeamId(
  _id: string,
  teamId: number | null
): Promise<RoleDoc> {
  const doc = await roleDocs.get(_id);
  doc.teamId = teamId;
  roleDocs.put(doc);
  return doc;
}

async function patchRoleAttribute(
  _id: string,
  attribute: GameRole
): Promise<RoleDoc> {
  const doc = await roleDocs.get(_id);
  doc.attribute = attribute;
  roleDocs.put(doc);
  return doc;
}

export {
  findRoleById,
  createRole,
  patchRoleStatus,
  patchRoleIsMatching,
  patchRoleRoomId,
  patchRoleTeamId,
  patchRoleAttribute,
};
