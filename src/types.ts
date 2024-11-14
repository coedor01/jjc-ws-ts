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

interface GameRole {
  zoneName: string;
  roleName: string;
  serverName: string;
  kungfuId: string;
  panelList: PanelList;
}

interface PanelList {
  score: number;
  panel: {
    name: string;
    percent: boolean;
    value: number;
  }[];
}
type RoleStatus = "RoleSelecting" | "AtHome" | "AtRoom" | "AtTeam";

interface ServerToClientEvents {
  $error: (code: number, detail: string) => void;
  $roleAlreadyOnline: () => void;
  $roleStatus: (status: RoleStatus, isMatching: boolean) => void;
  $roleInfo: (data: GameRole) => void;
  $staticData: (
    server: Server[],
    teamTypes: TeamType[],
    clientTypes: ClientType[]
  ) => void;
  $roomInfo: (
    _id: number,
    members: GameRole[],
    isOnwer: boolean,
    isMatching: boolean
  ) => void;
  $roomMembers: (members: GameRole[]) => void;
  $roomStatus: (status: string) => void;
}

interface ClientToServerEvents {
  $role: (server: string, name: string) => void;
  $newRoom: (password: string) => void;
  $joinRoom: (roomId: number, password: string) => void;
  $startSingleMatch: (clientTypeId: number, number: string) => void;
  $cancelSingleMatch: () => void;
  $startRoomMatch: (clientTypeId: number, number: string) => void;
  $cacnelRoomMatch: () => void;
  $exitRoom: () => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  server: string;
  name: string;
}

export type {
  Server,
  TeamType,
  ClientType,
  RoleStatus,
  GameRole,
  PanelList,
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
};
