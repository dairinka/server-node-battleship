import { WebSocket } from 'ws';
import { UserInfo } from '../types';

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
    return this.wsDb.get(ws) as UserInfo;
  }

  public getWsByUserId(userId: number): WebSocket {
    const wsInfo = Array.from(this.wsDb.entries()).find(
      ([, userInfo]) => userInfo.index === userId,
    );
    return wsInfo![0] as WebSocket;
  }

  public changeUserId(ws: WebSocket, newId: number) {
    const userInfo = this.wsDb.get(ws);
    userInfo!.index = newId;
    this.wsDb.set(ws, userInfo!);
  }
  public deleteWs(ws: WebSocket): void {
    this.wsDb.delete(ws);
  }
}

const wsDb = new WsDb();
export default wsDb;
