import { matchingUserRoleDocs } from './db';
import { getSTimestamp } from '../utils';

interface createProps {
  userId: string;
  server: string;
  name: string;
  clientTypeId: number;
  teamTypeId: number;
  kungfuId: string;
  grade: number;
  mmr: number;
  roomId?: string | null;
}

async function createMatchingUserRole({
  userId,
  server,
  name,
  clientTypeId,
  teamTypeId,
  kungfuId,
  grade,
  mmr,
  roomId = null,
}: createProps) {
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
    kungfuId,
    grade,
    mmr,
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
