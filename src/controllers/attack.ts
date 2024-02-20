import { WebSocket } from 'ws';
import { AttackRequest } from '../types';
import gameDb from '../database/game';
import responseWrapper from '../utils/responseWrapper';
import wsDb from '../database/wsDb';
import userDb from '../database/users';

const attack = (ws: WebSocket, dataInfo: AttackRequest) => {
  const attackResponse = gameDb.attack(dataInfo);
  console.log(' attackResponse', attackResponse);
  if (!attackResponse) return;
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
    if (isGameOver) {
      const wrapWinnerResponse = responseWrapper(
        {
          winPlayer: dataInfo.indexPlayer,
        },
        'finish',
      );
      userDb.setWinner(dataInfo.indexPlayer);
      const wrapUpdateWinnerResponse = responseWrapper(
        userDb.updateWiners(),
        'update_winners',
      );
      ws.send(wrapWinnerResponse);
      ws2.send(wrapWinnerResponse);
      ws.send(wrapUpdateWinnerResponse);
      ws2.send(wrapUpdateWinnerResponse);
    }
  } else if (attackResponse) {
    console.log('attackResponse', attackResponse);
    const secondPlayer = gameDb.getSecondPlayerOfGame(
      attackResponse.currentPlayer,
    );
    const ws2 = wsDb.getWsByUserId(secondPlayer as number);
    const wrapAttackResponse = responseWrapper(attackResponse, 'attack');
    const wrapTurnResponse = responseWrapper(
      gameDb.turn(dataInfo.gameId),
      'turn',
    );
    ws.send(wrapAttackResponse);
    ws2.send(wrapAttackResponse);
    ws.send(wrapTurnResponse);
    ws2.send(wrapTurnResponse);
  }
};
export default attack;
