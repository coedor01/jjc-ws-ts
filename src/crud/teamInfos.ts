import { teamInfoDocs } from './db';
import { UserGameRole, Message } from '../types';

interface CreateProps {
  _id: string;
  clientType: string;
  teamType: string;
  mates: UserGameRole[];
  startAt: number;
  messages?: Message[];
}

async function createTeamInfo({
  _id,
  clientType,
  teamType,
  mates,
  startAt,
  messages = [],
}: CreateProps) {
  const res = await teamInfoDocs.put({
    _id,
    clientType,
    teamType,
    mates,
    startAt,
    messages,
  });
  const doc = teamInfoDocs.get(res.id);
  return doc;
}

async function appendTeamMessages(_id: string, message: Message) {
  const doc = await teamInfoDocs.get(_id);
  doc.messages = [...doc.messages, message];
  return doc;
}

export { createTeamInfo, appendTeamMessages };
