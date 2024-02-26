import { WebSocket } from 'ws';
import { AddShipsRequest } from '../types';
import responseWrapper from '../utils/responseWrapper';
import gameDb from '../database/game';
import wsDb from '../database/wsDb';

const addShip = (ws: WebSocket, dataInfo: AddShipsRequest) => {
  gameDb.addShips(dataInfo);
  const secondPlayerId = gameDb.getSecondPlayerOfGame(dataInfo.indexPlayer);
  const isSecondPlayerBot = gameDb.isSecondPlayerBot(dataInfo.indexPlayer);
  if (isSecondPlayerBot) {
    ws.send(
      responseWrapper(gameDb.startGame(dataInfo.indexPlayer), 'start_game'),
    );
    console.log('currentUser', dataInfo.indexPlayer);
    gameDb.setTurn(dataInfo.indexPlayer, true);
    const turn = gameDb.turn(dataInfo.gameId);
    ws.send(responseWrapper(turn, 'turn'));
  }
  if (
    secondPlayerId &&
    gameDb.hasSecondPlayerShips(secondPlayerId) &&
    !isSecondPlayerBot
  ) {
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
