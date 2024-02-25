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

interface PlayersIdentificator {
  userId: number;
  playerId: number;
}
interface IGames {
  player1: PlayerId;
  player2?: PlayerId;
  turn?: PlayerId;
}
type StatusType = 'miss' | 'killed' | 'shot';
// interface ShipInfo extends Ship {
//   status: StatusType;
// }
interface Position {
  x: number;
  y: number;
}
// interface CellInfo extends Position {
//   status: StatusType;
// }
// interface ShipStartStatus {
//   position: Position;
//   status: StatusType;
// }
type GameId = number;
type PlayerId = number;
class Game {
  private gamesDb: Map<GameId, IGames>;
  private playersShipsDb: Map<PlayerId, Ship[]>;
  private playerIdentificator: PlayersIdentificator[];
  private playerShotDb: Map<PlayerId, Position[]>;

  constructor() {
    this.gamesDb = new Map();
    this.playersShipsDb = new Map();
    this.playerIdentificator = [];
    this.playerShotDb = new Map();
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

  public assignPlayerId(userId: number): PlayerId {
    const random = Math.round(Math.random() * 100 + 50);
    const isNewPlayerIdExist = this.playerIdentificator.some(
      (user) => user.playerId === random,
    );
    if (isNewPlayerIdExist) {
      return this.assignPlayerId(userId);
    }
    console.log('random', random);
    this.playerIdentificator.push({ userId, playerId: random });
    console.log('this.playerIdentificator', this.playerIdentificator);
    return random;
  }
  public getUserIdByPlayerId(playerId: PlayerId): number {
    console.log(
      ' getUserIdByPlayerId find userId',
      this.playerIdentificator.find((user) => user.playerId === playerId)!
        .userId,
    );
    /// To do specify playerId, he wouldn't be in gameDb??
    return this.playerIdentificator.find((user) => user.playerId === playerId)!
      .userId;
  }

  // private isPlayerIdInGame(playerIdToCheck: PlayerId): boolean {
  //   const playerId = this.playerIdentificator.find(
  //     (user) => user.userId === playerIdToCheck,
  //   )!.playerId;
  //   console.log('Now check if player Id in a game, playerId = ', playerId);
  //   for (const game of this.gamesDb.values()) {
  //     console.log('game.player1', game.player1);
  //     console.log('game.player2', game.player2);
  //     if (game.player1 === playerId || game.player2 === playerId) {
  //       console.log('true');
  //       return true;
  //     }
  //   }
  //   console.log('false');
  //   return false;
  // }

  // private getPlayerIdByUserId(userId: number): PlayerId {
  //   console.log('this.playerIdentificator', this.playerIdentificator);
  //   console.log('userId', userId);
  //   console.log(
  //     ' getUserIdByPlayerId find userId',
  //     this.playerIdentificator.find((user) => user.userId === userId)!.playerId,
  //   );
  //   /// To do specify playerId, he wouldn't be in gameDb - Correct tonight CHECK!!!

  //   return this.playerIdentificator.find(
  //     (user) => user.userId === userId && !this.isPlayerIdInGame(userId),
  //   )!.playerId;
  // }
  public deletePlayerId(playerId: PlayerId) {
    const index = this.playerIdentificator.findIndex(
      (user) => user.playerId === playerId,
    );
    console.log('playerId to delete', playerId);
    console.log(
      'this.playerIdentificator before delelte',
      this.playerIdentificator,
    );
    this.playerIdentificator.splice(index, 1);
    console.log(
      'this.playerIdentificator after delete',
      this.playerIdentificator,
    );
  }

  private getNewPlayerId(userId: number): number | undefined {
    // Фільтруємо playersIdentificators для заданого userId
    const userPlayers = this.playerIdentificator.filter(
      (player) => player.userId === userId,
    );

    // Перевіряємо кожен playerId для userId, чи він ще не використовується в gamesDb
    for (const player of userPlayers) {
      if (!this.isPlayerIdUsed(player.playerId)) {
        return player.playerId;
      }
    }

    // Якщо не вдалося знайти вільний playerId
    return undefined;
  }

  // Функція для перевірки, чи використовується playerId в gamesDb
  private isPlayerIdUsed(playerId: PlayerId): boolean {
    for (const game of this.gamesDb.values()) {
      if (
        game.player1 === playerId ||
        (game.player2 && game.player2 === playerId)
      ) {
        return true;
      }
    }
    return false;
  }

  public createGame(
    gameId: number,
    playerInfo: UserInfo,
  ): CreateGameResponse | null {
    const existingGameData: IGames | undefined = this.gamesDb.get(gameId);
    console.log('playerInfo', playerInfo);
    const playerId = this.getNewPlayerId(playerInfo.index);
    console.log('playerId', playerId);
    if (playerId) {
      if (existingGameData) {
        console.log('game was early created');
        existingGameData.player2 = playerId;
        console.log('player1 = ', this.gamesDb.get(gameId)?.player1);
        console.log('player2 = ', playerId);
        this.gamesDb.set(gameId, existingGameData);
      } else {
        this.gamesDb.set(gameId, {
          player1: playerId,
        });
        console.log('game only created now, player1 = ', playerInfo.index);
      }
      console.log('create game, see game db', this.gamesDb);
      return {
        idGame: gameId,
        idPlayer: playerId,
      };
    }
    return null;
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
    // const shipsInfo: Ship[] = dataInfo.ships.map((ship) =>
    //   Object.assign(ship, { status: 'ship' as StatusType }),
    // );

    this.playersShipsDb.set(dataInfo.indexPlayer, dataInfo.ships);
    //this.createButtleField(dataInfo.indexPlayer, dataInfo.ships);
  }

  /** function getSecondPlayerOfRoom
   *  @param playerId
   *  @return false if room has 1 player
   *  @return players2 - id second players
   */
  public getSecondPlayerOfGame(playerId: PlayerId): PlayerId | false {
    console.log('getSecondPlayer from gameDB', this.gamesDb);
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
    // console.log(
    //   'this.playersShipsDb.has(playerId)',
    //   this.playersShipsDb.has(playerId),
    // );
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
  }: AttackRequest): AttackResponse[] | undefined {
    const playerWhoShotNow = this.turn(gameId).currentPlayer;
    // console.log('////attack');
    // console.log('indexPlayer', indexPlayer);
    // console.log('playerWhoShotNow', playerWhoShotNow);
    if (indexPlayer !== playerWhoShotNow) return;
    const isShotWas = this.isShotAlreadyHasDone(indexPlayer, x, y);
    console.log('isShot already exist', isShotWas);
    if (isShotWas) return;
    const enemy = this.getEnemyOfGameByPlayerId(gameId, indexPlayer);
    console.log('==> enemy', enemy);
    //const { position, status } = this.checkShipStatus(enemy, x, y);
    const response = this.getAttackResponse(enemy, x, y, indexPlayer);
    if (response.length === 1 && response[0]?.status === 'miss') {
      this.setTurn(indexPlayer, false);
    }
    console.log('//////////////////////////////////');
    console.log('==> Attack response ready', response);

    // console.log(' position', position);
    // console.log('  status', status);

    // if (status === 'miss') {
    //   this.setTurn(indexPlayer, false);
    //   response = {
    //     position: { x, y },
    //     currentPlayer: indexPlayer,
    //     status: status,
    //   };
    // }
    // if (status === 'shot') {
    //   response = {
    //     position: { x, y },
    //     currentPlayer: indexPlayer,
    //     status: status,
    //   };
    // }
    const currentPlayersShots = this.playerShotDb.get(indexPlayer);
    if (currentPlayersShots) {
      currentPlayersShots.push({ x, y });
    }
    this.playerShotDb.set(indexPlayer, currentPlayersShots || [{ x, y }]);
    // if (status === 'killed') {
    //   // const responseArr = this.atackResponseWrapper(
    //   //   this.getSurroundedCells(enemy, position.x, position.y),
    //   //   indexPlayer,
    //   // );
    //   this.playerShotDb.set(indexPlayer, currentPlayersShots || [{ x, y }]);
    //   return responseArr.concat([
    //     {
    //       position: { x, y },
    //       currentPlayer: indexPlayer,
    //       status: status,
    //     },
    //   ]);
    //}
    return response;
  }

  private getAllShipCells(
    startX: number,
    startY: number,
    direction: boolean,
    length: number,
  ) {
    const cellsShipPosition = [] as Position[];
    console.log('/////// get all ship cells');
    console.log('startX', startX);
    console.log('startY', startY);
    console.log('direction', direction);
    console.log('length', length);
    for (let i = 0; i < length; i++) {
      const x = direction ? startX : startX + i;
      const y = direction ? startY + i : startY;
      cellsShipPosition.push({ x, y });
    }
    return cellsShipPosition;
  }
  private isShotAlreadyHasDone(
    playerId: PlayerId,
    currentX: number,
    currentY: number,
  ): boolean {
    const shots = this.playerShotDb.get(playerId);
    console.log('shot db', this.playerShotDb);
    console.log('current player', playerId);
    console.log('x', currentX, 'y', currentY);
    if (!shots) return false;
    return shots.some(({ x, y }) => currentX === x && currentY === y);
  }
  private getAttackResponse(
    enemy: PlayerId,
    shotX: number,
    shotY: number,
    currentPlayer: number,
  ): AttackResponse[] {
    const shipsInfo = this.playersShipsDb.get(enemy) as Ship[];
    let statusResult: StatusType = 'miss';
    const startShipPosition: Position = { x: shotX, y: shotY };
    let result = [
      {
        position: { x: shotX, y: shotY },
        currentPlayer,
        status: 'miss',
      },
    ] as AttackResponse[];

    outerLoop: for (let i = 0; i < shipsInfo.length; i++) {
      const { position, direction, type } = shipsInfo[i] as Ship;
      console.log('shipsInfo[i]', shipsInfo[i]);
      console.log('shipsInfo[i].length', shipsInfo[i]?.length);
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

      for (let k = 0; k < length[type]; k++) {
        const x = direction ? position.x : position.x + k;
        const y = direction ? position.y + k : position.y;
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
          shipsInfo[i]!.length = 0;

          const allShipPosition = this.getAllShipCells(
            startShipPosition.x,
            startShipPosition.y,
            direction,
            length[type],
          );
          const allSurroundCells = this.getSurroundedCells(
            enemy,
            position.x,
            position.y,
          );
          const wrapShipCells = this.atackResponseWrapper(
            allShipPosition,
            currentPlayer,
            'killed',
          );
          const wrapSurroundCells = this.atackResponseWrapper(
            allSurroundCells,
            currentPlayer,
            'miss',
          );
          result = wrapShipCells.concat(wrapSurroundCells);
          break outerLoop;
        }
        if (shipsInfo[i]!.length > 1) {
          statusResult = 'shot';
          shipsInfo[i]!.length -= 1;
          console.log(' worked condition - shot, ship.length - 1');
          console.log(' shipsInfo[i]!.length', shipsInfo[i]!.length);

          //this.setTurn(currenPlayerId, false);
          result = [
            {
              position: { x, y },
              currentPlayer,
              status: statusResult,
            },
          ];

          break outerLoop;
        }
      }
    }
    this.playersShipsDb.set(enemy, shipsInfo);
    return result;

    // return {
    //   position: { x: shotX, y: shotY },
    //   currentPlayer,
    //   status: statusResult,
    // };
  }
  /**
   * Check if ship is hit, return status(miss, shot, killed). if ship was killed also return starting coordinates
   * if not, shooting coordinates
   * @param playerId
   * @param shotX
   * @param shotY
   */
  // private checkShipStatus(
  //   playerId: PlayerId,
  //   shotX: number,
  //   shotY: number,
  // ): ShipStartStatus {
  //   const shipsInfo = this.playersShipsDb.get(playerId) as Ship[];
  //   let statusResult: StatusType = 'miss';
  //   const startShipPosition: Position = { x: shotX, y: shotY };

  //   for (let i = 0; i < shipsInfo.length; i++) {
  //     const { position, direction, type } = shipsInfo[i] as Ship;
  //     const length = {
  //       huge: 4,
  //       large: 3,
  //       medium: 2,
  //       small: 1,
  //     };
  //     console.log('////checkShipStatus');
  //     console.log('shotX: ', shotX, 'shotY', shotY);
  //     console.log('shipsInfo[i]', shipsInfo[i]);
  //     console.log('position', position);
  //     console.log('direction', direction);
  //     console.log('length', shipsInfo[i]!.length);
  //     if (!direction) {
  //       for (let k = 0; k < length[type]; k++) {
  //         const x = position.x + k;
  //         const y = position.y;
  //         console.log('x', x);
  //         console.log('y', y);
  //         console.log('length', shipsInfo[i]!.length);
  //         if (shotX !== x || shotY !== y) {
  //           console.log(' worked condition shotX !== x && shotY !== y');
  //           continue;
  //         }
  //         if (shipsInfo[i]!.length === 1) {
  //           statusResult = 'killed';
  //           console.log('//killed');
  //           console.log(' worked condition shipsInfo[i]!.length === 1');
  //           console.log('position.x', position.x);
  //           console.log('position.y', position.y);
  //           startShipPosition.x = position.x;
  //           startShipPosition.y = position.y;
  //           shipsInfo[i]!.length -= 1;
  //           this.playersShipsDb.set(playerId, shipsInfo);
  //           return {
  //             position: startShipPosition,
  //             status: statusResult,
  //           };
  //         } else {
  //           statusResult = 'shot';
  //           console.log(' worked condition - shot, ship.length - 1');
  //           shipsInfo[i]!.length -= 1;
  //           console.log(' shipsInfo[i]!.length', shipsInfo[i]!.length);
  //           this.playersShipsDb.set(playerId, shipsInfo);
  //           return {
  //             position: startShipPosition,
  //             status: statusResult,
  //           };
  //         }
  //       }
  //     } else {
  //       for (let k = 0; k < length[type]; k++) {
  //         const x = position.x;
  //         const y = position.y + k;
  //         console.log('x', x);
  //         console.log('y', y);
  //         if (shotX !== x || shotY !== y) {
  //           console.log(' worked condition shotX !== x && shotY !== y');
  //           continue;
  //         }
  //         if (shipsInfo[i]!.length === 1) {
  //           statusResult = 'killed';
  //           console.log('//killed');
  //           console.log(' worked condition shipsInfo[i]!.length === 1');
  //           console.log('position.x', position.x);
  //           console.log('position.y', position.y);
  //           startShipPosition.x = position.x;
  //           startShipPosition.y = position.y;
  //           shipsInfo[i]!.length -= 1;
  //           this.playersShipsDb.set(playerId, shipsInfo);
  //           return {
  //             position: startShipPosition,
  //             status: statusResult,
  //           };
  //         } else {
  //           statusResult = 'shot';
  //           shipsInfo[i]!.length -= 1;
  //           console.log(' worked condition - shot, ship.length - 1');
  //           console.log(' shipsInfo[i]!.length', shipsInfo[i]!.length);
  //           this.playersShipsDb.set(playerId, shipsInfo);
  //           return {
  //             position: startShipPosition,
  //             status: statusResult,
  //           };
  //         }
  //       }
  //     }
  //   }

  //   this.playersShipsDb.set(playerId, shipsInfo);
  //   return {
  //     position: startShipPosition,
  //     status: statusResult,
  //   };
  // }
  /**
   * Wrap array data of all cells around ship in server attack response
   * @param shipsPositon
   * @param currentPlayer
   *
   */
  private atackResponseWrapper(
    shipsPositon: Position[],
    currentPlayer: PlayerId,
    status: StatusType,
  ): AttackResponse[] {
    return shipsPositon.map((position) => {
      return {
        position: { x: position.x, y: position.y },
        currentPlayer,
        status: status,
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
  ): Position[] {
    const shipsinfo = this.playersShipsDb.get(enemy) as Ship[];
    // console.log('////getSurroundedCells');
    // console.log('shipStartX', shipStartX);
    // console.log('shipStartY', shipStartY);

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
          response.push({ x: x + 1, y: y + 1 });
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
  public deleteFinishGame(idGame: GameId) {
    const { player1, player2 } = this.gamesDb.get(idGame) as IGames;
    this.playersShipsDb.delete(player1);
    this.playersShipsDb.delete(player2!);
    this.gamesDb.delete(idGame);
  }
}
const gameDb = new Game();
export default gameDb;
