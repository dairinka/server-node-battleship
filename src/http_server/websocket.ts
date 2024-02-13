import { WebSocketServer } from 'ws';
import { RegRequest, Request } from '../types';
// import { Buffer } from 'buffer';
import userDb from '../database/users';
import roomsDb from '../database/rooms';
import { responseWrapper } from '../utils/responseWrapper';
const PORT = 3000;
export const wss = new WebSocketServer({ port: PORT });

wss.on('connection', function connection(ws) {
  ws.on('message', function message(clientData) {
    const data = JSON.parse(clientData.toString()) as Request;
    console.log('data', data);
    const dataInfo = JSON.parse(data.data);
    switch (data.type) {
      case 'reg':
        const regResponce = userDb.addNewUser(dataInfo as RegRequest);
        const updateRoomResponce = roomsDb.updateRoomState();
        const updateWinREsponce = userDb.updateWiners();
        ws.send(responseWrapper(regResponce, 'reg'));
        ws.send(responseWrapper(updateRoomResponce, 'update_room'));
        ws.send(responseWrapper(updateWinREsponce, 'update_winners'));
        break;
      case 'create_room':
        break;
      case 'add_user_to_room':
        break;
      case 'add_ships':
        break;
      case 'attack':
        break;
      case 'randomAttack':
        break;
    }
  });
});
