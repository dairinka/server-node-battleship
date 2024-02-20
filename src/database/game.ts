import {
  AddShipsRequest,
  Ship,
  CreateGameResponse,
  UserInfo,
  StartGameResponse,
  PlayerTurnResponse,
  AttackRequest,
  AttackResponse,
} from '../types';

interface IGames {
  player1: PlayerId;
  player2?: PlayerId;
  turn?: PlayerId;
}
type StatusType = 'miss' | 'killed' | 'shot';
// interface ShipInfo extends Ship {
//   status: StatusType;
// }
interface ShipPosition {
  x: number;
  y: number;
}
// interface CellInfo extends ShipPosition {
//   status: StatusType;
// }
interface ShipStartStatus {
  position: ShipPosition;
  status: StatusType;
}
type GameId = number;
type PlayerId = number;
class Game {
  private gamesDb: Map<GameId, IGames>;
  private playersShipsDb: Map<PlayerId, Ship[]>;
  // private cellsDb: Map<PlayerId, CellInfo[][]>;
  // private shipMap: Map<PlayerId, CellInfo[][]>;
  constructor() {
    this.gamesDb = new Map();
    this.playersShipsDb = new Map();
    // this.cellsDb = new Map();
    // this.shipMap = new Map();
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
    const shipsInfo: Ship[] = dataInfo.ships.map((ship) =>
      Object.assign(ship, { status: 'ship' as StatusType }),
    );

    this.playersShipsDb.set(dataInfo.indexPlayer, shipsInfo);
    //this.createButtleField(dataInfo.indexPlayer, dataInfo.ships);
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

  private getEnemyOfGameByPlayerId(
    gameId: GameId,
    playerId: PlayerId,
  ): PlayerId {
    const playersInfo = this.gamesDb.get(gameId) as IGames;
    return (
      playersInfo.player1 === playerId
        ? playersInfo.player2
        : playersInfo.player1
    ) as PlayerId;
  }

  /**
   * Attack feedback (should be sent after every shot, miss and after kill sent miss for all cells around ship too)
   * @param dataInfo
   */
  public attack({
    gameId,
    x,
    y,
    indexPlayer,
  }: AttackRequest): AttackResponse[] | AttackResponse | undefined {
    const playerWhoShotNow = this.turn(gameId).currentPlayer;
    console.log('////attack');
    console.log('indexPlayer', indexPlayer);
    console.log('playerWhoShotNow', playerWhoShotNow);
    if (indexPlayer !== playerWhoShotNow) return;
    const enemy = this.getEnemyOfGameByPlayerId(gameId, indexPlayer);
    console.log('enemy', enemy);
    const { position, status } = this.checkShipStatus(enemy, x, y);
    console.log(' position', position);
    console.log('  status', status);
    if (status === 'miss') {
      this.setTurn(indexPlayer, false);
      return {
        position: { x, y },
        currentPlayer: indexPlayer,
        status: status,
      };
    }
    if (status === 'shot') {
      return {
        position: { x, y },
        currentPlayer: indexPlayer,
        status: status,
      };
    }
    const response = this.atackResponseWrapper(
      this.getSurroundedCells(enemy, position.x, position.y),
      indexPlayer,
    );
    return response.concat([
      {
        position: { x, y },
        currentPlayer: indexPlayer,
        status: status,
      },
    ]);
  }
  /**
   * Check if ship is hit, return status(miss, shot, killed). if ship was killed also return starting coordinates
   * if not, shooting coordinates
   * @param playerId
   * @param shotX
   * @param shotY
   */
  private checkShipStatus(
    playerId: PlayerId,
    shotX: number,
    shotY: number,
  ): ShipStartStatus {
    const shipsInfo = this.playersShipsDb.get(playerId) as Ship[];
    let statusResult: StatusType = 'miss';
    const startShipPosition: ShipPosition = { x: shotX, y: shotY };

    for (let i = 0; i < shipsInfo.length; i++) {
      const { position, direction, type } = shipsInfo[i] as Ship;
      const length = {
        huge: 4,
        large: 3,
        medium: 2,
        small: 1,
      };
      console.log('////checkShipStatus');
      console.log('shotX: ', shotX, 'shotY', shotY);
      console.log('shipsInfo[i]', shipsInfo[i]);
      console.log('position', position);
      console.log('direction', direction);
      console.log('length', shipsInfo[i]!.length);
      if (!direction) {
        for (let k = 0; k < length[type]; k++) {
          const x = position.x + k;
          const y = position.y;
          console.log('x', x);
          console.log('y', y);
          console.log('length', shipsInfo[i]!.length);
          if (shotX !== x || shotY !== y) {
            console.log(' worked condition shotX !== x && shotY !== y');
            continue;
          }
          if (shipsInfo[i]!.length === 1) {
            statusResult = 'killed';
            console.log('//killed');
            console.log(' worked condition shipsInfo[i]!.length === 1');
            console.log('position.x', position.x);
            console.log('position.y', position.y);
            startShipPosition.x = position.x;
            startShipPosition.y = position.y;
            shipsInfo[i]!.length -= 1;
            this.playersShipsDb.set(playerId, shipsInfo);
            return {
              position: startShipPosition,
              status: statusResult,
            };
          } else {
            statusResult = 'shot';
            console.log(' worked condition - shot, ship.length - 1');
            shipsInfo[i]!.length -= 1;
            console.log(' shipsInfo[i]!.length', shipsInfo[i]!.length);
            this.playersShipsDb.set(playerId, shipsInfo);
            return {
              position: startShipPosition,
              status: statusResult,
            };
          }
        }
      } else {
        for (let k = 0; k < length[type]; k++) {
          const x = position.x;
          const y = position.y + k;
          console.log('x', x);
          console.log('y', y);
          if (shotX !== x || shotY !== y) {
            console.log(' worked condition shotX !== x && shotY !== y');
            continue;
          }
          if (shipsInfo[i]!.length === 1) {
            statusResult = 'killed';
            console.log('//killed');
            console.log(' worked condition shipsInfo[i]!.length === 1');
            console.log('position.x', position.x);
            console.log('position.y', position.y);
            startShipPosition.x = position.x;
            startShipPosition.y = position.y;
            shipsInfo[i]!.length -= 1;
            this.playersShipsDb.set(playerId, shipsInfo);
            return {
              position: startShipPosition,
              status: statusResult,
            };
          } else {
            statusResult = 'shot';
            shipsInfo[i]!.length -= 1;
            console.log(' worked condition - shot, ship.length - 1');
            console.log(' shipsInfo[i]!.length', shipsInfo[i]!.length);
            this.playersShipsDb.set(playerId, shipsInfo);
            return {
              position: startShipPosition,
              status: statusResult,
            };
          }
        }
      }
    }

    this.playersShipsDb.set(playerId, shipsInfo);
    return {
      position: startShipPosition,
      status: statusResult,
    };
  }
  /**
   * Wrap array data of all cells around ship in server attack response
   * @param shipsPositon
   * @param currentPlayer
   *
   */
  private atackResponseWrapper(
    shipsPositon: ShipPosition[],
    currentPlayer: PlayerId,
  ): AttackResponse[] {
    return shipsPositon.map((position) => {
      return {
        position: { x: position.x, y: position.y },
        currentPlayer,
        status: 'miss',
      };
    });
  }
  /**
   * Return all cells around ship as an array
   * @param enemy
   * @param shipStartX
   * @param shipStartY
   */

  private getSurroundedCells(
    enemy: PlayerId,
    shipStartX: number,
    shipStartY: number,
  ): ShipPosition[] {
    const shipsinfo = this.playersShipsDb.get(enemy) as Ship[];
    console.log('////getSurroundedCells');
    console.log('shipStartX', shipStartX);
    console.log('shipStartY', shipStartY);

    //get killed ship

    const { position, direction, type } = shipsinfo.find(
      (ship) =>
        ship.position.x === shipStartX && ship.position.y === shipStartY,
    ) as Ship;
    const response = [];
    const length = {
      huge: 4,
      large: 3,
      medium: 2,
      small: 1,
    };
    if (length[type] === 1) {
      const x = position.x;
      const y = position.y;
      const leftSide = () => {
        response.push({ x: x - 1, y: y - 1 });
        response.push({ x: x - 1, y });
        response.push({ x: x - 1, y: y + 1 });
      };
      const righttSide = () => {
        response.push({ x: x + 1, y: y - 1 });
        response.push({ x: x + 1, y });
        response.push({ x: x + 1, y: y + 1 });
      };
      const verticalCenter = () => {
        response.push({ x, y: y - 1 });
        response.push({ x, y: y + 1 });
      };
      const bottomSide = () => {
        response.push({ x: x - 1, y: y + 1 });
        response.push({ x, y: y + 1 });
        response.push({ x: x + 1, y: y + 1 });
      };
      const topSide = () => {
        response.push({ x: x - 1, y: y - 1 });
        response.push({ x, y: y - 1 });
        response.push({ x: x + 1, y: y - 1 });
      };
      const horizontalCenter = () => {
        response.push({ x: x - 1, y });
        response.push({ x: x + 1, y });
      };
      if (x === 9 && y == 9) {
        response.push({ x, y: y - 1 });
        response.push({ x: x - 1, y: y - 1 });
        response.push({ x: x - 1, y });
      } else if (x === 0 && y == 9) {
        response.push({ x, y: y - 1 });
        response.push({ x: x + 1, y: y - 1 });
        response.push({ x: x + 1, y });
      } else if (x === 9 && y == 0) {
        response.push({ x: x - 1, y });
        response.push({ x: x - 1, y: y + 1 });
        response.push({ x, y: y + 1 });
      } else if (x === 0 && y == 0) {
        response.push({ x, y: y + 1 });
        response.push({ x: x + 1, y: y + 1 });
        response.push({ x: x + 1, y });
      } else if (x === 0) {
        righttSide();
        verticalCenter();
      } else if (x === 9) {
        leftSide();
        verticalCenter();
      } else if (y === 0) {
        bottomSide();
        horizontalCenter();
      } else if (y === 9) {
        topSide();
        horizontalCenter();
      } else {
        topSide();
        horizontalCenter();
        bottomSide();
      }
    }
    if (!direction) {
      let counter = 0;

      while (counter < length[type]) {
        const x = position.x + counter;
        const y = position.y;
        const horisontalDefault = () => {
          response.push({ x, y: y - 1 });
          response.push({ x, y: y + 1 });
        };
        if ((y === 0 && x === 0) || (y === 0 && x === 9)) {
          response.push({ x, y: y + 1 });
        } else if ((y === 9 && x === 0) || (y === 9 && x === 9)) {
          response.push({ x, y: y - 1 });
        } else if (y === 0 && counter === 0) {
          response.push({ x: x - 1, y: y });
          response.push({ x: x - 1, y: y + 1 });
          response.push({ x, y: y + 1 });
        } else if (y === 9 && counter === 0) {
          response.push({ x: x - 1, y: y });
          response.push({ x: x - 1, y: y - 1 });
          response.push({ x, y: y - 1 });
        } else if (y === 0 && counter === length[type] - 1) {
          response.push({ x: x + 1, y: y });
          response.push({ x: x + 1, y: y + 1 });
          response.push({ x, y: y + 1 });
        } else if (y === 9 && counter === length[type] - 1) {
          response.push({ x: x + 1, y: y });
          response.push({ x: x + 1, y: y - 1 });
          response.push({ x, y: y - 1 });
        } else if (y === 0) {
          response.push({ x, y: y + 1 });
        } else if (y === 9) {
          response.push({ x, y: y - 1 });
        } else if (x === 0 || x === 9) {
          horisontalDefault();
        } else if (counter === 0) {
          response.push({ x: x - 1, y: y - 1 });
          response.push({ x: x - 1, y: y });
          response.push({ x: x - 1, y: y + 1 });
          horisontalDefault();
        } else if (counter === length[type] - 1) {
          response.push({ x: x + 1, y: y - 1 });
          response.push({ x: x + 1, y: y });
          response.push({ x: x + 1, y: y + 1 });
          horisontalDefault();
        } else {
          horisontalDefault();
        }

        counter++;
      }
    } else {
      let counter = 0;
      while (counter < length[type]) {
        const x = position.x;
        const y = position.y + counter;
        const verticalDefault = () => {
          response.push({ x: x - 1, y });
          response.push({ x: x + 1, y });
        };

        if ((y === 0 && x === 0) || (y === 9 && x === 0)) {
          response.push({ x: x + 1, y });
        } else if ((y === 0 && x === 9) || (y === 9 && x === 9)) {
          response.push({ x: x - 1, y });
        } else if (x === 0 && counter === 0) {
          response.push({ x, y: y - 1 });
          response.push({ x: x + 1, y: y - 1 });
          response.push({ x: x + 1, y });
        } else if (x === 9 && counter === 0) {
          response.push({ x: x - 1, y });
          response.push({ x: x - 1, y: y - 1 });
          response.push({ x, y: y - 1 });
        } else if (x === 0 && counter === length[type] - 1) {
          response.push({ x, y: y + 1 });
          response.push({ x: x + 1, y });
          response.push({ x: x + 1, y: y - 1 });
        } else if (x === 9 && counter === length[type] - 1) {
          response.push({ x: x - 1, y });
          response.push({ x: x - 1, y: y + 1 });
          response.push({ x, y: y + 1 });
        } else if (x === 0) {
          response.push({ x: x + 1, y });
        } else if (x === 9) {
          response.push({ x: x - 1, y });
        } else if (y === 0 || y === 9) {
          verticalDefault();
        } else if (counter === 0) {
          response.push({ x: x - 1, y: y - 1 });
          response.push({ x, y: y - 1 });
          response.push({ x: x + 1, y: y - 1 });
          verticalDefault();
        } else if (counter === length[type] - 1) {
          response.push({ x: x - 1, y: y + 1 });
          response.push({ x, y: y + 1 });
          response.push({ x: x + 1, y: y + 1 });
          verticalDefault();
        } else {
          verticalDefault();
        }
        counter++;
      }
    }

    return response;
  }
  public isGameOver(enemy: PlayerId): boolean {
    const shipsInfo = this.playersShipsDb.get(enemy) as Ship[];
    return shipsInfo.every((ship) => ship.length === 0);
  }
}
const gameDb = new Game();
export default gameDb;
