import { WebSocketServer } from 'ws';
import {
  AddShipsRequest,
  AddUserToRoomRequest,
  AttackRequest,
  RandomAttackRequest,
  RegRequest,
  Request,
} from '../types';
import { WebSocket } from 'ws';
import registration from '../controllers/registration';
import createRoom from '../controllers/createRoom';
import addUserToRoom from '../controllers/addUserToRoom';
import addShip from '../controllers/addShips';
import attack from '../controllers/attack';
import randomAttack from '../controllers/randomAttack';
import wsDb from '../database/wsDb';
import playWithBot from '../controllers/playWithBot';

const PORT = 3000;
export const wss = new WebSocketServer({ port: PORT });
const clients = new Set<WebSocket>();

wss.on('connection', function connection(ws) {
  clients.add(ws);
  ws.on('message', function message(clientData) {
    const data = JSON.parse(clientData.toString()) as Request;

    const dataInfo =
      data.type !== 'create_room' &&
      data.type !== 'single_play' &&
      JSON.parse(data.data);
    console.log('dataInfo', dataInfo);
    console.log(data.type);
    switch (data.type) {
      case 'reg':
        registration(ws, clients, dataInfo as RegRequest);
        break;
      case 'create_room':
        createRoom(ws, clients);
        break;
      case 'add_user_to_room':
        addUserToRoom(ws, clients, dataInfo as AddUserToRoomRequest);
        break;
      case 'add_ships':
        addShip(ws, dataInfo as AddShipsRequest);
        break;
      case 'attack':
        attack(ws, clients, dataInfo as AttackRequest);
        break;
      case 'randomAttack':
        randomAttack(ws, clients, dataInfo as RandomAttackRequest);
        break;
      case 'single_play':
        playWithBot(ws);
        break;
      default:
        console.log("It's unknown request");
    }
  });
  ws.on('close', function () {
    wsDb.deleteWs(ws);
    clients.delete(ws);
  });
});
