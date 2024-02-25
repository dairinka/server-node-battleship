import { WebSocket } from 'ws';
import { AddShipsRequest } from '../types';
import responseWrapper from '../utils/responseWrapper';
import gameDb from '../database/game';
import wsDb from '../database/wsDb';

const addShip = (ws: WebSocket, dataInfo: AddShipsRequest) => {
  gameDb.addShips(dataInfo);
  const secondPlayerId = gameDb.getSecondPlayerOfGame(dataInfo.indexPlayer);
  if (secondPlayerId && gameDb.hasSecondPlayerShips(secondPlayerId)) {
    const ws2 = wsDb.getWsByUserId(secondPlayerId);

    ws.send(
      responseWrapper(gameDb.startGame(dataInfo.indexPlayer), 'start_game'),
    );

    ws2.send(responseWrapper(gameDb.startGame(secondPlayerId), 'start_game'));
    gameDb.setTurn(dataInfo.indexPlayer, false);
    const turn = gameDb.turn(dataInfo.gameId);
    ws.send(responseWrapper(turn, 'turn'));
    ws2.send(responseWrapper(turn, 'turn'));
  }
};
export default addShip;
