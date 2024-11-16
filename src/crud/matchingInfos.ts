import { MatchingInfoDoc, MatchingUserGameRole } from '../types';
import { matchingInfoDocs, checkExist } from '../crud/db';

interface createProps {
  _id: string;
  clientType: string;
  teamType: string;
  mates: MatchingUserGameRole[];
  startAt: number;
}

async function createMatchingInfo({
  _id,
  clientType,
  teamType,
  mates,
  startAt,
}: createProps): Promise<MatchingInfoDoc> {
  const res = await matchingInfoDocs.put({
    _id,
    clientType,
    teamType,
    mates,
    startAt,
  });
  const doc = await matchingInfoDocs.get(res.id);
  return doc;
}

async function deleteMatchingInfo(_id: string) {
  const doc = await matchingInfoDocs.get(_id);
  await matchingInfoDocs.remove(doc);
}

async function findMatchingInfoById(_id: string) {
  let doc = null;
  if (await checkExist(matchingInfoDocs, _id)) {
    doc = await matchingInfoDocs.get(_id);
  }
  return doc;
}

async function changeMatchingInfoMates(
  _id: string,
  mates: MatchingUserGameRole[]
) {
  const doc = await matchingInfoDocs.get(_id);
  doc.mates = mates;
  matchingInfoDocs.put(doc);
  return doc;
}

async function findAllMatchingInfo() {
  const res = await matchingInfoDocs.allDocs({ include_docs: true });
  return res;
}

export {
  createMatchingInfo,
  deleteMatchingInfo,
  findMatchingInfoById,
  changeMatchingInfoMates,
  findAllMatchingInfo,
};
