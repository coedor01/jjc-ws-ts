import PouchDB from 'pouchdb';
import { GameRole, RoleStatus } from '../types';

PouchDB.plugin(require('pouchdb-find'));

interface RoomDoc {
  _id: string;
  password: string;
  owner: string;
  isMatching: boolean;
  members: GameRole[];
}

interface RoleDoc {
  _id: string;
  status: RoleStatus;
  isMatching: boolean;
  roomId: number | null;
  teamId: number | null;
  attribute: GameRole;
}

const roomDocs: PouchDB.Database<RoomDoc> = new PouchDB('db/rooms');
const roleDocs: PouchDB.Database<RoleDoc> = new PouchDB('db/roles');

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

export { RoleDoc, RoomDoc, RoleStatus, roomDocs, roleDocs, checkExist };
