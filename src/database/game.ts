import {
  AddShipsRequest,
  Ship,
  CreateGameResponse,
  UserInfo,
  StartGameResponse,
  PlayerTurnResponse,
  AttackRequest,
  AttackResponse,
  RandomAttackRequest,
} from '../types';

interface PlayersIdentificator {
  userId: number;
  playerId: number;
}
interface IGames {
  player1: PlayerId;
  player2?: PlayerId;
  turn?: PlayerId;
  bot?: boolean;
}
type StatusType = 'miss' | 'killed' | 'shot';
type ShipType = 'huge' | 'large' | 'medium' | 'small';

interface ShipCharacteristics {
  type: ShipType;
  length: number;
}
interface Position {
  x: number;
  y: number;
}

type GameId = number;
type PlayerId = number;
class Game {
  private gamesDb: Map<GameId, IGames>;
  private playersShipsDb: Map<PlayerId, Ship[]>;
  private playerIdentificator: PlayersIdentificator[];
  private playerShotDb: Map<PlayerId, Position[]>;
  private botNumber: number;

  constructor() {
    this.gamesDb = new Map();
    this.playersShipsDb = new Map();
    this.playerIdentificator = [];
    this.playerShotDb = new Map();
    this.botNumber;
  }

  public getNextGameId(): number {
    return this.gamesDb.size + 10;
  }
  private getNextBotNumber() {
    if (this.botNumber) return (this.botNumber += 1);
    return (this.botNumber = 1);
  }
  public isSecondPlayerBot(playerId: PlayerId) {
    for (const [, gameData] of this.gamesDb.entries()) {
      if (gameData.player1 === playerId && gameData.player2) {
        if (gameData.bot) return true;
      }
      if (gameData.player2 === playerId && gameData.player1) {
        if (gameData.bot) return true;
      }
    }
    return false;
  }

  public assignPlayerId(userId: number): PlayerId {
    const random = Math.round(Math.random() * 100 + 50);
    const isNewPlayerIdExist = this.playerIdentificator.some(
      (user) => user.playerId === random,
    );
    if (isNewPlayerIdExist) {
      return this.assignPlayerId(userId);
    }
    this.playerIdentificator.push({ userId, playerId: random });
    return random;
  }

  public getUserIdByPlayerId(playerId: PlayerId): number {
    return this.playerIdentificator.find((user) => user.playerId === playerId)!
      .userId;
  }

  public deletePlayerId(playerId: PlayerId) {
    const index = this.playerIdentificator.findIndex(
      (user) => user.playerId === playerId,
    );
    this.playerIdentificator.splice(index, 1);
  }

  private getNewPlayerId(userId: number): number | undefined {
    const userPlayers = this.playerIdentificator.filter(
      (player) => player.userId === userId,
    );

    for (const player of userPlayers) {
      if (!this.isPlayerIdUsed(player.playerId)) {
        return player.playerId;
      }
    }

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
    const playerId = this.getNewPlayerId(playerInfo.index);
    if (playerId) {
      if (existingGameData) {
        existingGameData.player2 = playerId;
        this.gamesDb.set(gameId, existingGameData);
      } else {
        this.gamesDb.set(gameId, {
          player1: playerId,
        });
      }
      return {
        idGame: gameId,
        idPlayer: playerId,
      };
    }
    return null;
  }
  public createGameWithBot(userId: number): CreateGameResponse {
    const playerId = this.assignPlayerId(userId);
    const botId = this.getNextBotNumber();
    const gameId = this.getNextGameId();

    this.gamesDb.set(gameId, { player1: playerId, player2: botId, bot: true });

    this.addBotShips(botId);
    return {
      idGame: gameId,
      idPlayer: playerId,
    };
  }

  public addBotShips(botId: PlayerId) {
    const boardSize = 10;
    const shipSizes: ShipCharacteristics[] = [
      { type: 'huge', length: 4 },
      { type: 'large', length: 3 },
      { type: 'large', length: 3 },
      { type: 'medium', length: 2 },
      { type: 'medium', length: 2 },
      { type: 'medium', length: 2 },
      { type: 'small', length: 1 },
      { type: 'small', length: 1 },
      { type: 'small', length: 1 },
      { type: 'small', length: 1 },
    ];
    const ships = [] as Ship[];
    const shipPlacements = [] as number[][];

    function canPlaceShip(
      length: number,
      x: number,
      y: number,
      direction: boolean,
    ) {
      if (length === 1) {
        if (shipPlacements[y]![x] !== 0) return false;
        if (y - 1 >= 0 && shipPlacements[y - 1]![x] !== 0) return false;
        if (y + 1 <= 9 && shipPlacements[y + 1]![x] !== 0) return false;
        // check begining surrounded cells
        if (x - 1 >= 0 && y - 1 >= 0 && shipPlacements[y - 1]![x - 1] !== 0)
          return false;
        if (x - 1 >= 0 && shipPlacements[y]![x - 1] !== 0) return false;
        if (x - 1 >= 0 && y + 1 <= 9 && shipPlacements[y + 1]![x - 1] !== 0)
          return false;
        // check ending surrounded cells
        if (x + 1 <= 9 && y - 1 >= 0 && shipPlacements[y - 1]![x + 1] !== 0)
          return false;
        if (x + 1 <= 9 && shipPlacements[y]![x + 1] !== 0) return false;
        if (x + 1 <= 9 && y + 1 <= 9 && shipPlacements[y + 1]![x + 1] !== 0)
          return false;
      } else if (!direction) {
        //check length
        const xEnd = x + length - 1;
        if (xEnd >= boardSize) return false;
        for (let i = x; i < x + length; i++) {
          if (y - 1 >= 0 && shipPlacements[y - 1]![i] !== 0) return false;
          if (y + 1 <= 9 && shipPlacements[y + 1]![i] !== 0) return false;
          if (shipPlacements[y]![i] !== 0) return false;
        }
        // check begining surrounded cells
        if (x - 1 >= 0 && y - 1 >= 0 && shipPlacements[y - 1]![x - 1] !== 0)
          return false;
        if (x - 1 >= 0 && shipPlacements[y]![x - 1] !== 0) return false;
        if (x - 1 >= 0 && y + 1 <= 9 && shipPlacements[y + 1]![x - 1] !== 0)
          return false;
        // check ending surrounded cells
        if (
          xEnd + 1 <= 9 &&
          y - 1 >= 0 &&
          shipPlacements[y - 1]![xEnd + 1] !== 0
        )
          return false;
        if (xEnd + 1 <= 9 && shipPlacements[y]![xEnd + 1] !== 0) return false;
        if (
          xEnd + 1 <= 9 &&
          y + 1 <= 9 &&
          shipPlacements[y + 1]![xEnd + 1] !== 0
        )
          return false;
      } else {
        const yEnd = y + length - 1;
        if (yEnd >= boardSize) return false;
        for (let i = y; i < y + length; i++) {
          if (x - 1 >= 0 && shipPlacements[i]![x - 1] !== 0) return false;
          if (x + 1 <= 9 && shipPlacements[i]![x + 1] !== 0) return false;
          if (shipPlacements[i]![x] !== 0) return false;
        }
        // check begining surrounded cells
        if (x - 1 >= 0 && y - 1 >= 0 && shipPlacements[y - 1]![x - 1] !== 0)
          return false;
        if (y - 1 >= 0 && shipPlacements[y - 1]![x] !== 0) return false;
        if (x + 1 <= 9 && y - 1 >= 0 && shipPlacements[y - 1]![x + 1] !== 0)
          return false;
        // check ending surrounded cells
        if (
          x - 1 >= 0 &&
          yEnd + 1 <= 9 &&
          shipPlacements[yEnd + 1]![x - 1] !== 0
        )
          return false;
        if (yEnd + 1 <= 9 && shipPlacements[yEnd + 1]![x] !== 0) return false;
        if (
          x + 1 <= 9 &&
          yEnd + 1 <= 9 &&
          shipPlacements[yEnd + 1]![x + 1] !== 0
        )
          return false;
      }
      return true;
    }

    function placeShip(
      direction: boolean,
      length: number,
      type: ShipType,
      x: number,
      y: number,
    ) {
      const result = {
        position: { x, y },
        direction,
        length,
        type,
      };
      if (!direction) {
        for (let i = x; i < x + length; i++) {
          shipPlacements[y]![i] = length;
        }
      } else {
        for (let i = y; i < y + length; i++) {
          shipPlacements[i]![x] = length;
        }
      }
      return result;
    }

    for (let i = 0; i < boardSize; i++) {
      shipPlacements.push(new Array(boardSize).fill(0));
    }

    for (const { type, length } of shipSizes) {
      let placed = false;
      while (!placed) {
        const x = Math.floor(Math.random() * boardSize);
        const y = Math.floor(Math.random() * boardSize);
        const direction = Math.random() < 0.5 ? false : true;

        if (canPlaceShip(length, x, y, direction)) {
          ships.push(placeShip(direction, length, type, x, y));
          placed = true;
        }
      }
    }

    this.playersShipsDb.set(botId, ships);
  }
  public getBotAttack(dataInfo: RandomAttackRequest): AttackResponse[] {
    const enemy = dataInfo.indexPlayer;
    const bot = 1;
    const position = this.getRandomShot(dataInfo);
    const response = this.getAttackResponse(enemy, position.x, position.y, bot);
    if (response.length === 1 && response[0]?.status === 'miss') {
      this.setTurn(bot, false);
    }

    const currentPlayersShots = this.playerShotDb.get(bot);
    if (currentPlayersShots) {
      currentPlayersShots.push({ x: position.x, y: position.y });
    }
    this.playerShotDb.set(
      bot,
      currentPlayersShots || [{ x: position.x, y: position.y }],
    );

    return response;
  }

  public addShips(dataInfo: AddShipsRequest) {
    this.playersShipsDb.set(dataInfo.indexPlayer, dataInfo.ships);
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

    if (indexPlayer !== playerWhoShotNow) return;
    const isShotWas = this.isShotAlreadyHasDone(indexPlayer, x, y);
    if (isShotWas) return;
    const enemy = this.getEnemyOfGameByPlayerId(gameId, indexPlayer);

    const response = this.getAttackResponse(enemy, x, y, indexPlayer);
    if (response.length === 1 && response[0]?.status === 'miss') {
      this.setTurn(indexPlayer, false);
    }

    const currentPlayersShots = this.playerShotDb.get(indexPlayer);
    if (currentPlayersShots) {
      currentPlayersShots.push({ x, y });
    }
    this.playerShotDb.set(indexPlayer, currentPlayersShots || [{ x, y }]);

    return response;
  }

  private getAllShipCells(
    startX: number,
    startY: number,
    direction: boolean,
    length: number,
  ) {
    const cellsShipPosition = [] as Position[];
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
      const length = {
        huge: 4,
        large: 3,
        medium: 2,
        small: 1,
      };

      for (let k = 0; k < length[type]; k++) {
        const x = direction ? position.x : position.x + k;
        const y = direction ? position.y + k : position.y;
        if (shotX !== x || shotY !== y) {
          continue;
        }
        if (shipsInfo[i]!.length === 1) {
          statusResult = 'killed';
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
          this.pushSurroundCellsToShotDb(currentPlayer, allSurroundCells);
          const wrapShipCells = this.attackResponseWrapper(
            allShipPosition,
            currentPlayer,
            'killed',
          );
          const wrapSurroundCells = this.attackResponseWrapper(
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
  }

  private pushSurroundCellsToShotDb(playerId: PlayerId, positions: Position[]) {
    const shots = this.playerShotDb.get(playerId);
    if (shots) {
      const extendShots = shots.concat(positions);
      this.playerShotDb.set(playerId, extendShots);
    } else {
      this.playerShotDb.set(playerId, positions);
    }
  }

  /**
   * Wrap array data of all cells around ship in server attack response
   * @param shipsPositon
   * @param currentPlayer
   *
   */
  private attackResponseWrapper(
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
  public isGameExist(gameId: number): boolean {
    return this.gamesDb.has(gameId);
  }

  public deleteFinishGame(idGame: GameId) {
    const { player1, player2 } = this.gamesDb.get(idGame) as IGames;
    this.playersShipsDb.delete(player1);
    this.playersShipsDb.delete(player2!);
    this.gamesDb.delete(idGame);
  }

  public getRandomShot(dataInfo: RandomAttackRequest): Position {
    const randomX = this.getRandomNumber();
    const randomY = this.getRandomNumber();
    const isShotExist = this.isShotPositionExist(
      randomX,
      randomY,
      dataInfo.indexPlayer,
    );
    if (isShotExist) return this.getRandomShot(dataInfo);
    else {
      return { x: randomX, y: randomY };
    }
  }

  private getRandomNumber(): number {
    return Math.floor(Math.random() * 10);
  }

  private isShotPositionExist(
    currentX: number,
    currentY: number,
    playerId: PlayerId,
  ): boolean {
    const shotsCurrentPlayer = this.playerShotDb.get(playerId);
    if (!shotsCurrentPlayer) return false;
    return shotsCurrentPlayer?.some(
      ({ x, y }) => currentX === x && currentY === y,
    );
  }
}

const gameDb = new Game();
export default gameDb;
