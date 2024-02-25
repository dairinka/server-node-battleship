import { UpdateRoomStateResponse, UserInfo } from '../types';

interface IRoomsDb {
  roomId: number;
  roomUsers: [
    {
      name: string;
      index: number;
    },
  ];
}
class RoomsDb {
  private roomsDb: IRoomsDb[];
  constructor() {
    this.roomsDb = [];
  }

  /**
   * function addUserToRoom
   * create game room and add yourself there
   * @param userInfo
   * @return void
   *
   */
  public createNewRoom(userInfo: UserInfo): void {
    const isUserAreadyInRoom = this.roomsDb.some((room) =>
      room.roomUsers.some((user) => user.index === userInfo.index),
    );
    if (!isUserAreadyInRoom) {
      this.roomsDb.push({
        roomId: this.roomsDb.length + 1,
        roomUsers: [userInfo],
      });
    } else {
      console.error(' ==> \x1b[31mRoom has already created\x1b[0m');
    }
  }

  /**
   * function addUserToRoom
   * add youself to somebody's room, then remove room from rooms list
   * @return false if user already is in the current room
   * @return userInfo about first user
   */
  public addUserToRoom(roomId: number, userInfo: UserInfo): UserInfo | false {
    const roomInfo = this.roomsDb.find((room) => room.roomId === roomId);
    const indexInDb = this.roomsDb.indexOf(roomInfo!);
    const isUserAlreadyInRoom =
      roomInfo!.roomUsers![0].index === userInfo.index;
    if (isUserAlreadyInRoom) {
      console.error(' ==> \x1b[31mYou already in a room\x1b[0m');
      return false;
    }
    const indexRoomWhenCurrentUserIs = this.roomsDb.findIndex(
      (room) => room.roomUsers[0].index === userInfo.index,
    );
    if (indexRoomWhenCurrentUserIs > -1) {
      this.roomsDb.splice(indexRoomWhenCurrentUserIs, 1);
    }
    this.roomsDb[indexInDb]!.roomUsers.push(userInfo);

    return this.roomsDb[indexInDb]?.roomUsers[0] as UserInfo;
  }

  /**
   * function updateRoomState
   * send rooms list, where only one player inside
   * @return UpdateRoomStateResponse[]
   */
  public updateRoomState(): UpdateRoomStateResponse[] {
    const roomWithSinglePlayer = this.roomsDb.filter(
      (roomInfo) => roomInfo.roomUsers.length === 1,
    );
    return roomWithSinglePlayer;
  }

  public clearRoom(user1: number, user2: number) {
    const index = this.roomsDb.findIndex(({ roomUsers }) =>
      roomUsers.every(({ index }) => index === user1 || index === user2),
    );
    this.roomsDb.splice(index, 1);
  }
}
const roomsDb = new RoomsDb();
export default roomsDb;
