import { WebSocket } from 'ws';
import { UserInfo } from '../types';

// interface UserInfo {
//   name: string;
//   index: number;
// }
class WsDb {
  private wsDb: Map<WebSocket, UserInfo>;
  constructor() {
    this.wsDb = new Map();
  }
  addUserInfoByWs(ws: WebSocket, userInfo: UserInfo): void {
    console.log('userInfo in wsDb add user', userInfo);
    this.wsDb.set(ws, userInfo);
  }
  getUserInfoByWs(ws: WebSocket): UserInfo {
    //console.log('userInfo in wsDb get user', this.wsDb.get(ws));
    return this.wsDb.get(ws) as UserInfo;
  }
  getWsByUserId(userId: number): WebSocket {
    const wsInfo = Array.from(this.wsDb.entries()).find(
      ([, userInfo]) => userInfo.index === userId,
    );
    //console.log('wsInfo', wsInfo);
    return wsInfo![0] as WebSocket;
  }
}

const wsDb = new WsDb();
export default wsDb;
