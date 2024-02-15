interface Request {
  type: RequestType;
  data: string;
  id: 0;
}
type RequestType =
  | 'reg'
  | 'create_room'
  | 'add_user_to_room'
  | 'add_ships'
  | 'attack'
  | 'randomAttack';
interface Response {
  type: ResponseType;
  data: string;
  id: 0;
}
type ResponseType =
  | 'reg'
  | 'update_winners'
  | 'create_game'
  | 'update_room'
  | 'start_game'
  | 'attack'
  | 'turn'
  | 'finish';
type ResponseTypeInterface =
  | RegResponse
  | UpdateWinnersResponse[]
  | CreateGameResponse
  | UpdateRoomStateResponse[]
  | StartGameResponse
  | AttackResponse
  | PlayerTurnResponse
  | FinishGameResponse;
interface RegRequest {
  name: string;
  password: string;
}
interface RegResponse {
  name: string;
  index: number;
  error: boolean;
  errorText: string;
}
interface UpdateWinnersResponse {
  name: string;
  wins: number;
}
interface CreateRoomRequest {
  data: '';
}
interface AddUserToRoomRequest {
  indexRoom: number;
}
interface CreateGameResponse {
  idGame: number;
  idPlayer: number;
}
interface UpdateRoomStateResponse {
  roomId: number;
  roomUsers: [
    {
      name: string;
      index: number;
    },
  ];
}
interface AddShipsRequest {
  gameId: number;
  ships: Ship[];
  indexPlayer: number;
}
interface StartGameResponse {
  ships: Ship[];
  currentPlayerIndex: number;
}
interface Ship {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: 'small' | 'medium' | 'large' | 'huge';
}
interface AttackRequest {
  gameId: number;
  x: number;
  y: number;
  indexPlayer: number;
}
interface AttackResponse {
  position: {
    x: number;
    y: number;
  };
  currentPlayer: number;
  status: 'miss' | 'killed' | 'shot';
}
interface RandomAttackRequest {
  gameId: number;
  indexPlayer: number;
}
interface PlayerTurnResponse {
  currentPlayer: number;
}
interface FinishGameResponse {
  winPlayer: number;
}

interface UserInfo {
  name: string;
  index: number;
}

export {
  Request,
  Response,
  RequestType,
  ResponseType,
  ResponseTypeInterface,
  RegRequest,
  RegResponse,
  UpdateWinnersResponse,
  CreateRoomRequest,
  AddUserToRoomRequest,
  CreateGameResponse,
  UpdateRoomStateResponse,
  AddShipsRequest,
  StartGameResponse,
  Ship,
  AttackRequest,
  AttackResponse,
  RandomAttackRequest,
  PlayerTurnResponse,
  FinishGameResponse,
  UserInfo,
};
