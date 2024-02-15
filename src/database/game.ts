import {
  AddShipsRequest,
  Ship,
  CreateGameResponse,
  UserInfo,
  StartGameResponse,
  PlayerTurnResponse,
} from '../types';

interface IGames {
  player1: PlayerId;
  player2?: PlayerId;
  turn?: PlayerId;
}
type StatusType = 'exist' | 'miss' | 'killed' | 'shot';
interface ShipInfo extends Ship {
  status: StatusType;
}
type GameId = number;
type PlayerId = number;
class Game {
  private gamesDb: Map<GameId, IGames>;
  private playersShipsDb: Map<PlayerId, ShipInfo[]>;
  constructor() {
    this.gamesDb = new Map();
    this.playersShipsDb = new Map();
  }
  //  interface CreateGameResponse {
  //   idGame: number;
  //   idPlayer: number;
  // }
  /**
   * function CreateGame
   * send for both players in the room
   *  id for player in the game session, who have sent add_user_to_room request, not enemy *\
   */
  public getNextGameId(): number {
    return this.gamesDb.size + 10;
  }

  public createGame(gameId: number, playerInfo: UserInfo): CreateGameResponse {
    const existingGameData: IGames | undefined = this.gamesDb.get(gameId);
    if (existingGameData) {
      existingGameData.player2 = playerInfo.index;
      this.gamesDb.set(gameId, existingGameData);
    } else {
      this.gamesDb.set(gameId, {
        player1: playerInfo.index,
      });
    }
    return {
      idGame: gameId,
      idPlayer: playerInfo.index,
    };
  }
  //   interface AddShipsRequest {
  //   gameId: number;
  //   ships: Ship[];
  //   indexPlayer: number;
  // }

  //   interface Ship {
  //   position: {
  //     x: number;
  //     y: number;
  //   };
  //   direction: boolean;
  //   length: number;
  //   type: 'small' | 'medium' | 'large' | 'huge';
  // }

  public addShips(dataInfo: AddShipsRequest) {
    const shipsInfo: ShipInfo[] = dataInfo.ships.map((ship) =>
      Object.assign(ship, { status: 'exist' as StatusType }),
    );

    this.playersShipsDb.set(dataInfo.indexPlayer, shipsInfo);
  }
  /** function getSecondPlayerOfRoom
   *  @param playerId
   *  @return false if room has 1 player
   *  @return players2 - id second players
   */
  public getSecondPlayerOfGame(playerId: PlayerId): PlayerId | false {
    for (const [, gameData] of this.gamesDb.entries()) {
      if (gameData.player1 === playerId && gameData.player2) {
        return gameData.player2;
      }
      if (gameData.player2 === playerId && gameData.player1) {
        return gameData.player1;
      }
    }
    return false;
  }
  public hasSecondPlayerShips(playerId: PlayerId): boolean {
    console.log(
      'this.playersShipsDb.has(playerId)',
      this.playersShipsDb.has(playerId),
    );
    return this.playersShipsDb.has(playerId);
  }

  //   interface StartGameResponse {
  //   ships: Ship[];
  //   currentPlayerIndex: number;
  // }
  public startGame(playerId: PlayerId): StartGameResponse {
    const ships: Ship[] = this.playersShipsDb.get(playerId)!.map((ship) => {
      return {
        position: ship.position,
        direction: ship.direction,
        length: ship.length,
        type: ship.type,
      };
    });
    return {
      ships,
      currentPlayerIndex: playerId,
    };
  }
  public setTurn(playerId: PlayerId, hasHeTurn: boolean) {
    for (const [gameId, gameData] of this.gamesDb.entries()) {
      if (gameData.player1 === playerId && !hasHeTurn) {
        gameData.turn = gameData.player2;
        this.gamesDb.set(gameId, gameData);
        return;
      }
      if (gameData.player2 === playerId && !hasHeTurn) {
        gameData.turn = gameData.player1;
        this.gamesDb.set(gameId, gameData);
        return;
      }
      if (
        (gameData.player1 === playerId || gameData.player2 === playerId) &&
        hasHeTurn
      ) {
        gameData.turn = playerId;
        this.gamesDb.set(gameId, gameData);
        return;
      }
    }
  }
  /**
   * function turn
   * @param gameId
   * @returns playerId who wiil be shoot
   */
  public turn(gameId: GameId): PlayerTurnResponse {
    const gameInfo = this.gamesDb.get(gameId);
    return { currentPlayer: gameInfo!.turn as PlayerId };
  }
}
const gameDb = new Game();
export default gameDb;
