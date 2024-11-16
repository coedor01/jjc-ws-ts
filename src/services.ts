import { RoomDoc, MatchingUserRoleDoc } from './crud/db';
import {
  changeUserIsMatchingReady,
  changeUserMatchingId,
  changeUserStatus,
  findUserStatusById,
} from './crud/userStatus';
import { findRoomById } from './crud/rooms';
import { MatchingInfoDoc, TypedServerSocket } from './types';
import { getMatchingLabel } from './utils';

async function getUserRoom(userId: string): Promise<RoomDoc | null> {
  const userStatus = await findUserStatusById(userId);
  let room: RoomDoc | null = null;
  if (userStatus?.roomId) {
    room = await findRoomById(userStatus.roomId);
  }
  return room;
}

function getMatchingGroupKey(item: MatchingUserRoleDoc): string {
  return `${item.clientTypeId}|${item.teamTypeId}`;
}

interface MatchResultItem {
  clientTypeId: number;
  teamTypeId: number;
  mates: MatchingUserRoleDoc[];
}

interface MatchResult {
  results: MatchResultItem[];
  matched: string[];
  unmatched: string[];
}

/* 匹配规则
 * 1. 最高段位和最低段位不能超过一段
 * 2. 最高竞技分和最低竞技分差值不能超过200分
 * 3. 每组人数等于该类招募的最高人数
 * 4. 一个用户只能被分到一个组
 **/
function matchJJC(
  items: MatchingUserRoleDoc[],
  maxMateCountMap: Map<number, number>
): MatchResult {
  // 分组
  const grouped: { [key: string]: MatchingUserRoleDoc[] } = {};
  items.forEach(item => {
    if (item) {
      const key = getMatchingGroupKey(item);
      //@ts-ignore
      if (!grouped[key]) {
        //@ts-ignore
        grouped[key] = [];
      }
      //@ts-ignore
      grouped[key].push(item);
    }
  });

  // 结果存储
  const results: MatchResultItem[] = [];
  const matched = new Set<string>();
  const unmatched: string[] = [];

  // 针对每组进行处理
  Object.entries(grouped).forEach(([key, groupItems]) => {
    const [teamTypeId, clientTypeId] = key.split('|').map(Number);
    const teamSize = maxMateCountMap.get(teamTypeId); // 获取固定的组大小
    if (!teamSize) return;

    // 排序（按 grade 和 mmr 排序）
    groupItems.sort((a, b) => a.grade - b.grade || a.mmr - b.mmr);

    // 分组逻辑
    let currentGroup: MatchingUserRoleDoc[] = [];

    for (const item of groupItems) {
      // 在遍历分组内的用户时，跳过已经被分组的用户
      if (matched.has(item._id)) continue;
      // 如果当前组已满员或不符合规则，则保存当前组并开始新组
      if (
        currentGroup.length > 0 &&
        (Math.abs(item.grade - currentGroup[0].grade) > 1 ||
          Math.abs(item.mmr - currentGroup[0].mmr) > 200 ||
          currentGroup.length >= teamSize)
      ) {
        if (currentGroup.length === teamSize) {
          results.push({
            clientTypeId: clientTypeId,
            teamTypeId: teamTypeId,
            mates: currentGroup,
          });
          currentGroup.forEach(member => matched.add(member._id));
        }
        currentGroup = [];
      }
      currentGroup.push(item);
    }

    // 保存最后一个组
    if (currentGroup.length === teamSize) {
      results.push({
        clientTypeId: clientTypeId,
        teamTypeId: teamTypeId,
        mates: currentGroup,
      });
      currentGroup.forEach(member => matched.add(member._id));
    }
  });

  // 找到未分组的用户
  items.forEach(item => {
    if (!matched.has(item._id)) {
      unmatched.push(item._id);
    }
  });

  return { results, matched: Array.from(matched), unmatched };
}

async function endMatching(
  matchingInfo: MatchingInfoDoc,
  userSockets: Map<string, TypedServerSocket>
) {
  for (const mate of matchingInfo.mates) {
    const userStatus = await findUserStatusById(mate.userId);
    if (userStatus) {
      // 如果用户有房间则退回到房间，如果没有则退回到主页
      if (userStatus.roomId) {
        await changeUserStatus(mate.userId, 'AtRoom');
      } else {
        await changeUserStatus(mate.userId, 'AtHome');
      }
      await changeUserIsMatchingReady(mate.userId, false);
      const newUserStatus = await changeUserMatchingId(mate.userId, null);

      // 如果用户在线则推送状态，并退出队内广播
      const mateSocket = userSockets.get(mate.userId);
      if (mateSocket) {
        mateSocket.emit('$userStatus', newUserStatus);
        mateSocket.leave(getMatchingLabel(matchingInfo._id));
      }
    }
  }
}

export { getUserRoom, getMatchingGroupKey, matchJJC, endMatching };
