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
  const secondPlayer = gameDb.getSecondPlayerOfGame(dataInfo.indexPlayer);
  const isGameExist = gameDb.isGameExist(dataInfo.gameId);
  const checkGameOver =
    isGameExist && secondPlayer ? gameDb.isGameOver(secondPlayer) : true;
  if (checkGameOver) return;
  const attackResponse = gameDb.attack(dataInfo);
  if (!attackResponse || attackResponse.length === 0) return;
  if (Array.isArray(attackResponse) && attackResponse.length === 1) {
    const secondPlayer = gameDb.getSecondPlayerOfGame(
      attackResponse[0]!.currentPlayer,
    );
    const isSecondPlayerBot = gameDb.isSecondPlayerBot(dataInfo.indexPlayer);
    if (!isSecondPlayerBot) {
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
    } else {
      const wrapAttackResponse = responseWrapper(attackResponse[0]!, 'attack');
      console.log('==> attackResponse[0]', attackResponse[0]);
      ws.send(wrapAttackResponse);
      if (attackResponse[0]?.status === 'shot') {
        const wrapTurnResponse = responseWrapper(
          { currentPlayer: dataInfo.indexPlayer },
          'turn',
        );
        ws.send(wrapTurnResponse);
      } else {
        console.log('==> miss');
        botAttack(dataInfo, ws);
      }
    }
  }
  if (Array.isArray(attackResponse)) {
    const secondPlayer = gameDb.getSecondPlayerOfGame(
      attackResponse[0]!.currentPlayer,
    );
    const isGameOver = gameDb.isGameOver(secondPlayer as number);
    const isSecondPlayerBot = gameDb.isSecondPlayerBot(dataInfo.indexPlayer);

    if (!isSecondPlayerBot) {
      const ws2 = wsDb.getWsByUserId(secondPlayer as number);

      for (const response of attackResponse) {
        const wrapAttackResponse = responseWrapper(response, 'attack');
        ws.send(wrapAttackResponse);
        ws2.send(wrapAttackResponse);
      }
      if (!isGameOver) {
        const wrapTurnResponse = responseWrapper(
          gameDb.turn(dataInfo.gameId),
          'turn',
        );
        ws.send(wrapTurnResponse);
        ws2.send(wrapTurnResponse);
      }

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
        gameDb.deletePlayerId(dataInfo.indexPlayer);
        gameDb.deletePlayerId(secondPlayer as number);
        wsDb.changeUserId(ws, winnerId);
        wsDb.changeUserId(ws2, loserId);
        roomsDb.clearRoom(winnerId, loserId);
        for (const client of clients) {
          client.send(wrapUpdateWinnerResponse);
        }
      }
    } else {
      for (const response of attackResponse) {
        const wrapAttackResponse = responseWrapper(response, 'attack');
        ws.send(wrapAttackResponse);
      }
      for (const response of attackResponse) {
        const wrapAttackResponse = responseWrapper(response, 'attack');
        ws.send(wrapAttackResponse);
      }
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
        console.log(
          'change playerId',
          dataInfo.indexPlayer,
          'to userId',
          winnerId,
        );

        userDb.setWinner(winnerId);
        const wrapUpdateWinnerResponse = responseWrapper(
          userDb.updateWiners(),
          'update_winners',
        );
        ws.send(wrapWinnerResponse);
        gameDb.deletePlayerId(dataInfo.indexPlayer);
        gameDb.deletePlayerId(secondPlayer as number);
        wsDb.changeUserId(ws, winnerId);

        ws.send(wrapUpdateWinnerResponse);
      }
      if (!isGameOver) {
        const wrapTurnResponse = responseWrapper(
          gameDb.turn(dataInfo.gameId),
          'turn',
        );
        ws.send(wrapTurnResponse);
      }
    }
  }
};
export default attack;

function botAttack(dataInfo: AttackRequest, ws: WebSocket) {
  console.log(' ===> invoke botAttack()');
  const responseBotAttack = gameDb.getBotAttack({
    gameId: dataInfo.gameId,
    indexPlayer: dataInfo.indexPlayer,
  });
  const botId = gameDb.getSecondPlayerOfGame(dataInfo.indexPlayer) as number;
  console.log('bot response attack', responseBotAttack);
  console.log('botId', botId);
  if (Array.isArray(responseBotAttack) && responseBotAttack.length === 1) {
    const wrapAttackResponse = responseWrapper(responseBotAttack[0]!, 'attack');
    ws.send(wrapAttackResponse);
    if (responseBotAttack[0]?.status === 'miss') {
      gameDb.setTurn(dataInfo.indexPlayer, true);
      const wrapTurnResponse = responseWrapper(
        { currentPlayer: dataInfo.indexPlayer },
        'turn',
      );
      ws.send(wrapTurnResponse);
      return;
    } else {
      return botAttack(dataInfo, ws);
    }
  }
  if (Array.isArray(responseBotAttack) && responseBotAttack.length !== 1) {
    console.log('=====> ship was killed');
    for (const response of responseBotAttack) {
      const wrapAttackResponse = responseWrapper(response, 'attack');
      ws.send(wrapAttackResponse);
    }
    const isGameOver = gameDb.isGameOver(botId);
    console.log('isGameOver: bot winner', isGameOver);
    if (!isGameOver) return botAttack(dataInfo, ws);
    if (isGameOver) {
      console.log('===> Try to finish game', isGameOver);
      const wrapWinnerResponse = responseWrapper(
        {
          winPlayer: botId,
        },
        'finish',
      );
      gameDb.deleteFinishGame(dataInfo.gameId);
      const userId = gameDb.getUserIdByPlayerId(dataInfo.indexPlayer);
      console.log('change playerId', dataInfo.indexPlayer, 'to userId', userId);

      userDb.setWinner(botId);
      const wrapUpdateWinnerResponse = responseWrapper(
        userDb.updateWiners(),
        'update_winners',
      );
      ws.send(wrapWinnerResponse);
      gameDb.deletePlayerId(dataInfo.indexPlayer);
      gameDb.deletePlayerId(botId);
      wsDb.changeUserId(ws, userId);
      ws.send(wrapUpdateWinnerResponse);
      return;
    }
  }
  return;
}
