import { httpServer } from './src/http_server/index';
import { wss } from './src/http_server/websocket';

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);
wss;
