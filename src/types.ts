import { Socket } from "socket.io";

export type TypedServerSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>


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

interface JJCPerformance {
  mmr: number;
  grade: number;
  ranking: string;
  winCount: number;
  totalCount: number;
  mvpCount: number;
  pvpType: string;
  winRate: number;
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
  matchingId: string | null;
  isMatchingReady: boolean;
}

type UserStatus = "AtHome" | "AtRoom" | "AtMatching" | "AtTeam";

interface MatchingUserGameRole extends UserGameRole {
  jjcPerf: JJCPerformance;
  isReady: boolean;
}

interface MatchingInfoDoc {
  _id: string;
  clientType: string;
  teamType: string;
  mates: MatchingUserGameRole[];
  startAt: number;
}

interface TeamInfo {
  _id: string;
  mates: UserGameRole[];
}

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
  $matchingInfo: (data: MatchingInfoDoc) => void;
  $matchingCountdown: (tick: number) => void;
  $matchingSuccess: (data: TeamInfo) => void;
  $matchingFailed: () => void;
}

interface ClientToServerEvents {
  $role: (server: string, name: string) => void;
  $newRoom: (password: string) => void;
  $joinRoom: (roomId: string, password: string) => void;
  $startSingleMatch: (teamTypeId: number, clientTypeId: number) => void;
  $cancelSingleMatch: () => void;
  $startRoomMatch: (teamTypeId: number, clientTypeId: number) => void;
  $cacnelRoomMatch: () => void;
  $exitRoom: () => void;
  $acceptMatching: () => void;
  $rejectMatching: () => void;
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
  MatchingUserGameRole,
  JJCPerformance,
  PanelList,
  UserGameRole,
  MatchingInfoDoc,
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData
};

export { defaultUserGameRole };
