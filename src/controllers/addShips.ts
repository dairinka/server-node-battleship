import { WebSocket } from 'ws';
import { AddShipsRequest } from '../types';
import responseWrapper from '../utils/responseWrapper';
import gameDb from '../database/game';
import wsDb from '../database/wsDb';

const addShip = (ws: WebSocket, dataInfo: AddShipsRequest) => {
  gameDb.addShips(dataInfo);
  const secondPlayerId = gameDb.getSecondPlayerOfGame(dataInfo.indexPlayer);
  console.log('add ship request');
  console.log('firstPlayerId', dataInfo.indexPlayer);
  console.log('secondPlayerId', secondPlayerId);
  if (secondPlayerId && gameDb.hasSecondPlayerShips(secondPlayerId)) {
    //console.log('Condition is working');
    const ws2 = wsDb.getWsByUserId(secondPlayerId);
    //console.log('answer to player 1', gameDb.startGame(dataInfo.indexPlayer));
    ws.send(
      responseWrapper(gameDb.startGame(dataInfo.indexPlayer), 'start_game'),
    );
    //console.log('answer to player 2', gameDb.startGame(secondPlayerId));
    ws2.send(responseWrapper(gameDb.startGame(secondPlayerId), 'start_game'));
    gameDb.setTurn(dataInfo.indexPlayer, false);
    const turn = gameDb.turn(dataInfo.gameId);
    ws.send(responseWrapper(turn, 'turn'));
    ws2.send(responseWrapper(turn, 'turn'));
  }
};
export default addShip;
