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
  public addUserInfoByWs(ws: WebSocket, userInfo: UserInfo): void {
    if (!this.wsDb.has(ws)) console.log('userInfo in wsDb add user', userInfo);
    this.wsDb.set(ws, userInfo);
  }
  public getUserInfoByWs(ws: WebSocket): UserInfo {
    //console.log('userInfo in wsDb get user', this.wsDb.get(ws));
    return this.wsDb.get(ws) as UserInfo;
  }
  public getWsByUserId(userId: number): WebSocket {
    const wsInfo = Array.from(this.wsDb.entries()).find(
      ([, userInfo]) => userInfo.index === userId,
    );
    //console.log('wsInfo', wsInfo);
    return wsInfo![0] as WebSocket;
  }
  public changeUserId(ws: WebSocket, newId: number) {
    const userInfo = this.wsDb.get(ws);
    userInfo!.index = newId;
    this.wsDb.set(ws, userInfo!);
  }
}

const wsDb = new WsDb();
export default wsDb;
