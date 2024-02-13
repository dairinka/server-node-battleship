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
interface Responce {
  type: ResponceType;
  data: string;
  id: 0;
}
type ResponceType =
  | 'reg'
  | 'update_winners'
  | 'create_game'
  | 'update_room'
  | 'start_game'
  | 'attack'
  | 'turn'
  | 'finish';
type ResponceTypeInterface =
  | RegResponse
  | UpdateWinnersResponce[]
  | CreateGameResponce
  | UpdateRoomStateResponce[]
  | StartGameResponce
  | AttackResponce
  | PlayerTurnResponce
  | FinishGameResponce;
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
interface UpdateWinnersResponce {
  name: string;
  wins: number;
}
interface CreateRoomRequest {
  data: '';
}
interface AddUserToRoomRequest {
  indexRoom: number;
}
interface CreateGameResponce {
  idGame: number;
  idPlayer: number;
}
interface UpdateRoomStateResponce {
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
interface StartGameResponce {
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
interface AttackResponce {
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
interface PlayerTurnResponce {
  currentPlayer: number;
}
interface FinishGameResponce {
  winPlayer: number;
}

export {
  Request,
  Responce,
  RequestType,
  ResponceType,
  ResponceTypeInterface,
  RegRequest,
  RegResponse,
  UpdateWinnersResponce,
  CreateRoomRequest,
  AddUserToRoomRequest,
  CreateGameResponce,
  UpdateRoomStateResponce,
  AddShipsRequest,
  StartGameResponce,
  Ship,
  AttackRequest,
  AttackResponce,
  RandomAttackRequest,
  PlayerTurnResponce,
  FinishGameResponce,
};
