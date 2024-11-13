interface Server {
  id: number;
  name: string;
}

interface TeamType {
  id: number;
  label: string;
  maxMemberCount: number;
}

interface ClientType {
  id: number;
  label: string;
}

export interface GameRole {
  zoneName: string;
  roleName: string;
  serverName: string;
  kungfuId: string;
  panelList: panelList;
}

export interface panelList {
  score: number;
  panel: {
    name: string;
    percent: boolean;
    value: number;
  }[];
}

export interface ServerToClientEvents {
  $error: (code: number, detail: string) => void;
  $roleStatus: (status: string, isMatching: boolean) => void;
  $roleInfo: (data: GameRole) => void;
  $staticData: (
    server: Server[],
    teamType: TeamType[],
    clientType: ClientType[]
  ) => void;
  $roomInfo: (
    _id: number,
    members: GameRole[],
    isOnwer: boolean,
    status: string
  ) => void;
  $roomMembers: (members: GameRole[]) => void;
  $roomStatus: (status: string) => void;
}

export interface ClientToServerEvents {
  $role: (server: string, name: string) => void;
  $newRoom: (password: string) => void;
  $joinRoom: (roomId: number, password: string) => void;
  $startSingleMatch: (clientTypeId: number, number: string) => void;
  $cancelSingleMatch: () => void;
  $startRoomMatch: (clientTypeId: number, number: string) => void;
  $cacnelRoomMatch: () => void;
  $exitRoom: () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  server: string;
  name: number;
}
