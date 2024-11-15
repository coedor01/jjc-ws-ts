import PouchDB from 'pouchdb';
import { UserGameRole, UserStatus, UserStatusDoc } from '../types';

PouchDB.plugin(require('pouchdb-find'));

interface RoomDoc {
  _id: string;
  password: string;
  owner: string;
  isMatching: boolean;
  members: UserGameRole[];
}

interface MatchingUserRoleDoc {
  _id: string;
  roomId: string | null;
  startAt: number;
  teamTypeId: number;
  clientTypeId: number;
  kungfuId: string;
  grade: number;
  mmr: number;
  teamMembersMaxCount: number;
}

const roomDocs: PouchDB.Database<RoomDoc> = new PouchDB('db/rooms');
const userStatusDocs: PouchDB.Database<UserStatusDoc> = new PouchDB(
  'db/userStatus'
);
const matchingUserRoleDocs: PouchDB.Database<MatchingUserRoleDoc> = new PouchDB(
  'db/matchingUserRoleDoc'
);
userStatusDocs.createIndex({
  index: {
    fields: ['isMatching'],
  },
});

async function checkExist(
  db: PouchDB.Database<any>,
  _id: string
): Promise<boolean> {
  try {
    await db.get(_id);
    return true;
  } catch (err) {
    //@ts-ignore
    switch (err.status) {
      case 404:
        return false;
      default:
        throw err;
    }
  }
}

export {
  RoomDoc,
  UserStatusDoc,
  UserStatus,
  MatchingUserRoleDoc,
  roomDocs,
  userStatusDocs,
  matchingUserRoleDocs,
  checkExist,
};
