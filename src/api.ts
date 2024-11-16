import { GameRole, JJCPerformance } from './types';

function getRoleInfo(server: string, name: string): GameRole {
  return {
    zoneName: '',
    roleName: name,
    serverName: server,
    kungfuId: '10028',
    panelList: { score: 466666, panel: [] },
  };
}

function getJJCPerformance(server: string, name: string): JJCPerformance {
  console.log(`Mock ${name}·${server} 的JJC数据`);
  return {
    mmr: 2787,
    grade: 15,
    ranking: '-',
    winCount: 326,
    totalCount: 615,
    mvpCount: 61,
    pvpType: '',
    winRate: 53,
  };
}

export { getRoleInfo, getJJCPerformance };
