interface Request {
  type: 'reg';
  data: [];
  id: 0;
}
interface RegRequest {
  type: 'reg';
  data: {
    name: string;
    password: string;
  };
  id: 0;
}
interface RegResponse {
  type: 'reg';
  data: {
    name: string;
    index: number;
    error: boolean;
    errorText: string;
  };
  id: 0;
}
interface UpdateWinnersResponce {
  type: 'update_winners';
  data: [
    {
      name: string;
      wins: number;
    },
  ];
}
interface CreateRoomRequest {
  type: 'create_room';
  data: '';
  id: 0;
}
interface AddUserToRoomRequest {
  type: 'add_user_to_room';
  data: {
    indexRoom: number;
  };
  id: 0;
}
interface CreateGameResponce {
  type: 'create_game';
  data: {
    idGame: number;
    idPlayer: number;
  };
  id: 0;
}
interface UpdateRoomStateResponce {
  type: 'update_room';
  data: [
    {
      roomId: number;
      roomUsers: [
        {
          name: string;
          index: number;
        },
      ];
    },
  ];
  id: 0;
}
interface AddShipsRequest {
  type: 'add_ships';
  data: {
    gameId: number;
    ships: Ship[];
    indexPlayer: number;
  };
  id: 0;
}
interface StartGameResponce {
  type: 'start_game';
  data: {
    ships: Ship[];
    currentPlayerIndex: number;
  };
  id: 0;
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
  type: 'attack';
  data: {
    gameId: number;
    x: number;
    y: number;
    indexPlayer: number;
  };
  id: 0;
}
interface AttackResponce {
  type: 'attack';
  data: {
    position: {
      x: number;
      y: number;
    };
    currentPlayer: number;
    status: 'miss' | 'killed' | 'shot';
  };
  id: 0;
}
interface RandomAttackRequest {
  type: 'randomAttack';
  data: {
    gameId: number;
    indexPlayer: number;
  };
  id: 0;
}
interface PlayerTurnResponce {
  type: 'turn';
  data: {
    currentPlayer: number;
  };
  id: 0;
}
interface FinishGameResponce {
  type: 'finish';
  data: {
    winPlayer: number;
  };
  id: 0;
}

export {
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
