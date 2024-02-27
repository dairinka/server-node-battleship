import { WebSocket } from 'ws';

import gameDb from '../database/game';
import wsDb from '../database/wsDb';
import responseWrapper from '../utils/responseWrapper';

const playWithBot = (ws: WebSocket) => {
  // Define userId
  const userId = wsDb.getUserInfoByWs(ws).index;
  // Create new game
  const createGameWithBot = gameDb.createGameWithBot(userId);
  ws.send(responseWrapper(createGameWithBot, 'create_game'));
};
export default playWithBot;
