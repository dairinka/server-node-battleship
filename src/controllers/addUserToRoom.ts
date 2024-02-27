import { WebSocket } from 'ws';
import { AddUserToRoomRequest } from '../types';
import roomsDb from '../database/rooms';
import wsDb from '../database/wsDb';
import responseWrapper from '../utils/responseWrapper';
import gameDb from '../database/game';

const addUserToRoom = (
  ws: WebSocket,
  clients: Set<WebSocket>,
  dataInfo: AddUserToRoomRequest,
) => {
  const userInfo = wsDb.getUserInfoByWs(ws);
  const firstUserInRoom = roomsDb.addUserToRoom(dataInfo.indexRoom, userInfo);
  if (firstUserInRoom) {
    const updateRoomResponse = roomsDb.updateRoomState();
    const ws2 = wsDb.getWsByUserId(firstUserInRoom.index);
    const gameId = gameDb.getNextGameId();
    for (const client of clients) {
      client.send(responseWrapper(updateRoomResponse, 'update_room'));
    }
    const firstPlayerId = gameDb.assignPlayerId(firstUserInRoom.index);
    const secondPlayer = gameDb.assignPlayerId(userInfo.index);
    const createGameUser1 = gameDb.createGame(gameId, userInfo);
    const createGameUser2 = gameDb.createGame(gameId, firstUserInRoom);
    if (createGameUser1 && createGameUser2) {
      ws.send(responseWrapper(createGameUser1, 'create_game'));
      ws2.send(responseWrapper(createGameUser2, 'create_game'));

      wsDb.changeUserId(ws, secondPlayer);
      wsDb.changeUserId(ws2, firstPlayerId);
    }
  }
};

export default addUserToRoom;
