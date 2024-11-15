import { matchingUserRoleDocs } from './db';
import { getSTimestamp } from '../utils';

async function createMatchingUserRole(
  userId: string,
  server: string,
  name: string,
  clientTypeId: number,
  teamTypeId: number,
  teamMembersMaxCount: number,
  roomId: string | null = null
) {
  const now = new Date();
  const startAt = getSTimestamp(now);
  await matchingUserRoleDocs.put({
    _id: userId,
    server,
    name,
    roomId,
    startAt,
    clientTypeId,
    teamTypeId,
    teamMembersMaxCount,
  });
}

async function findAllMatchingUserRole() {
  const res = await matchingUserRoleDocs.allDocs({ include_docs: true });
  return res;
}

async function deleteMatchingUserRole(userId: string) {
  const doc = await matchingUserRoleDocs.get(userId);
  await matchingUserRoleDocs.remove(doc);
}

export {
  createMatchingUserRole,
  findAllMatchingUserRole,
  deleteMatchingUserRole,
};
