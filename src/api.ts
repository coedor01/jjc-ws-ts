import { GameRole } from './types';

async function getRoleInfo(server: string, name: string): Promise<GameRole> {
  return {
    zoneName: '',
    roleName: name,
    serverName: server,
    kungfuId: '10028',
    panelList: { score: 466666, panel: [] },
  };
}

export { getRoleInfo };
