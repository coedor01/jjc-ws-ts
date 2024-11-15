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

const roomDocs: PouchDB.Database<RoomDoc> = new PouchDB('db/rooms');
const userStatusDocs: PouchDB.Database<UserStatusDoc> = new PouchDB(
  'db/userStatus'
);

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
  roomDocs,
  userStatusDocs,
  checkExist,
};
