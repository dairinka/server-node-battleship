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
    ws.send(
      responseWrapper(gameDb.createGame(gameId, userInfo), 'create_game'),
    );
    ws2.send(
      responseWrapper(
        gameDb.createGame(gameId, firstUserInRoom),
        'create_game',
      ),
    );
  }
};

export default addUserToRoom;
