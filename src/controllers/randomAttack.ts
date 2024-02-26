import { WebSocket } from 'ws';

import { AttackRequest, RandomAttackRequest } from '../types';
import gameDb from '../database/game';
import attack from './attack';

const randomAttack = (
  ws: WebSocket,
  clients: Set<WebSocket>,
  dataInfo: RandomAttackRequest,
) => {
  const newShotPosition = gameDb.getRandomShot(dataInfo);
  console.log('new Shot position', newShotPosition);
  const randomAttackRequest = {
    gameId: dataInfo.gameId,
    x: newShotPosition.x,
    y: newShotPosition.y,
    indexPlayer: dataInfo.indexPlayer,
  };
  attack(ws, clients, randomAttackRequest as AttackRequest);
};

export default randomAttack;
