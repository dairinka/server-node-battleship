import { WebSocket } from 'ws';
import { RegRequest } from '../types';
import userDb from '../database/users';
import roomsDb from '../database/rooms';
import wsDb from '../database/wsDb';
import responseWrapper from '../utils/responseWrapper';

const registration = (
  ws: WebSocket,
  clients: Set<WebSocket>,
  dataInfo: RegRequest,
) => {
  const regResponse = userDb.addNewUser(dataInfo);
  wsDb.addUserInfoByWs(ws, {
    name: regResponse.name,
    index: regResponse.index,
  });
  const updateRoomResponse = roomsDb.updateRoomState();
  const updateWinResponse = userDb.updateWiners();
  ws.send(responseWrapper(regResponse, 'reg'));
  for (const client of clients) {
    client.send(responseWrapper(updateRoomResponse, 'update_room'));
    client.send(responseWrapper(updateWinResponse, 'update_winners'));
  }
};
export default registration;
