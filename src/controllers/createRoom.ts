import { WebSocket } from 'ws';

import roomsDb from '../database/rooms';
import responseWrapper from '../utils/responseWrapper';
import wsDb from '../database/wsDb';

const createRoom = (ws: WebSocket, clients: Set<WebSocket>) => {
  const userInfo = wsDb.getUserInfoByWs(ws);
  console.log('userInfo from wsDb in create room', userInfo);
  roomsDb.createNewRoom(userInfo);
  const updateRoomResponse = roomsDb.updateRoomState();
  for (const client of clients) {
    client.send(responseWrapper(updateRoomResponse, 'update_room'));
  }
};

export default createRoom;
