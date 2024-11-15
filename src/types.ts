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

interface UserGameRole {
  userId: string;
  gameRole: GameRole;
}

const defaultUserGameRole: UserGameRole = {
  userId: "",
  gameRole: {
    zoneName: "",
    roleName: "",
    serverName: "",
    kungfuId: "",
    panelList: { score: 0, panel: [] },
  },
};

interface PanelList {
  score: number;
  panel: {
    name: string;
    percent: boolean;
    value: number;
  }[];
}

interface UserStatusDoc {
  _id: string;
  status: UserStatus;
  isMatching: boolean;
  roomId: string | null;
  teamId: string | null;
}

type UserStatus = "AtHome" | "AtRoom" | "AtTeam";

interface ServerToClientEvents {
  $error: (code: number, detail: string) => void;
  $userAlreadyOnline: () => void;
  $userStatus: (data: UserStatusDoc) => void;
  $roleInfo: (data: UserGameRole) => void;
  $staticData: (teamTypes: TeamType[], clientTypes: ClientType[]) => void;
  $roomInfo: (
    _id: string,
    members: UserGameRole[],
    owner: string,
    isMatching: boolean
  ) => void;
  $roomMembers: (members: UserGameRole[]) => void;
  $roomStatus: (status: string) => void;
}

interface ClientToServerEvents {
  $role: (server: string, name: string) => void;
  $newRoom: (password: string) => void;
  $joinRoom: (roomId: string, password: string) => void;
  $startSingleMatch: (teamTypeId: string, clientTypeId: string) => void;
  $cancelSingleMatch: () => void;
  $startRoomMatch: (teamTypeId: string, clientTypeId: string) => void;
  $cacnelRoomMatch: () => void;
  $exitRoom: () => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  userId: string;
  server: string;
  name: string;
}

export type {
  Server,
  TeamType,
  ClientType,
  UserStatus,
  UserStatusDoc,
  GameRole,
  PanelList,
  UserGameRole,
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
};

export { defaultUserGameRole };
