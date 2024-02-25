import { WebSocket } from 'ws';
import { AttackRequest } from '../types';
import gameDb from '../database/game';
import responseWrapper from '../utils/responseWrapper';
import wsDb from '../database/wsDb';
import userDb from '../database/users';
import roomsDb from '../database/rooms';

const attack = (
  ws: WebSocket,
  clients: Set<WebSocket>,
  dataInfo: AttackRequest,
) => {
  const attackResponse = gameDb.attack(dataInfo);
  console.log(' attackResponse in controller', attackResponse);
  if (!attackResponse || attackResponse.length === 0) return;
  if (Array.isArray(attackResponse) && attackResponse.length === 1) {
    console.log('attackResponse', attackResponse);
    const secondPlayer = gameDb.getSecondPlayerOfGame(
      attackResponse[0]!.currentPlayer,
    );
    const ws2 = wsDb.getWsByUserId(secondPlayer as number);
    const wrapAttackResponse = responseWrapper(attackResponse[0]!, 'attack');
    const wrapTurnResponse = responseWrapper(
      gameDb.turn(dataInfo.gameId),
      'turn',
    );
    ws.send(wrapAttackResponse);
    ws2.send(wrapAttackResponse);
    ws.send(wrapTurnResponse);
    ws2.send(wrapTurnResponse);
  }
  if (Array.isArray(attackResponse)) {
    const secondPlayer = gameDb.getSecondPlayerOfGame(
      attackResponse[0]!.currentPlayer,
    );
    const ws2 = wsDb.getWsByUserId(secondPlayer as number);
    const wrapTurnResponse = responseWrapper(
      gameDb.turn(dataInfo.gameId),
      'turn',
    );
    for (const response of attackResponse) {
      const wrapAttackResponse = responseWrapper(response, 'attack');
      ws.send(wrapAttackResponse);
      ws2.send(wrapAttackResponse);
    }
    ws.send(wrapTurnResponse);
    ws2.send(wrapTurnResponse);
    const isGameOver = gameDb.isGameOver(secondPlayer as number);
    console.log('isGameOver', isGameOver);
    if (isGameOver) {
      const wrapWinnerResponse = responseWrapper(
        {
          winPlayer: dataInfo.indexPlayer,
        },
        'finish',
      );
      gameDb.deleteFinishGame(dataInfo.gameId);
      const winnerId = gameDb.getUserIdByPlayerId(dataInfo.indexPlayer);
      const loserId = gameDb.getUserIdByPlayerId(secondPlayer as number);
      console.log(
        'change playerId',
        dataInfo.indexPlayer,
        'to userId',
        winnerId,
      );
      console.log('change playerId', secondPlayer, 'to userId', loserId);
      userDb.setWinner(winnerId);
      const wrapUpdateWinnerResponse = responseWrapper(
        userDb.updateWiners(),
        'update_winners',
      );
      ws.send(wrapWinnerResponse);
      ws2.send(wrapWinnerResponse);
      // ws.send(wrapUpdateWinnerResponse);
      // ws2.send(wrapUpdateWinnerResponse);
      gameDb.deletePlayerId(dataInfo.indexPlayer);
      gameDb.deletePlayerId(secondPlayer as number);
      wsDb.changeUserId(ws, winnerId);
      wsDb.changeUserId(ws2, loserId);
      roomsDb.clearRoom(winnerId, loserId);
      for (const client of clients) {
        client.send(wrapUpdateWinnerResponse);
      }
    }
  }
};
export default attack;
