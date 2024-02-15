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
    this.roomsDb.push({
      roomId: this.roomsDb.length + 1,
      roomUsers: [userInfo],
    });
  }

  /**
   * function addUserToRoom
   * add youself to somebody's room, then remove room from rooms list
   * @return false if user already is in the current room
   * @return userInfo about first user
   */
  public addUserToRoom(roomId: number, userInfo: UserInfo): UserInfo | false {
    const roomInfo = this.roomsDb.find((room) => room.roomId === roomId);
    console.log('roomInfo', roomInfo);
    const indexInDb = this.roomsDb.indexOf(roomInfo!);
    console.log(' this.roomsDb', this.roomsDb);
    console.log('indexInDb', indexInDb);
    const isUserAlreadyInRoom =
      roomInfo!.roomUsers![0].index === userInfo.index;
    console.log('isUserAlreadyInRoom', isUserAlreadyInRoom);
    if (isUserAlreadyInRoom) return false;
    this.roomsDb[indexInDb]!.roomUsers.push(userInfo);
    console.log(' this.roomsDb', this.roomsDb);
    return this.roomsDb[indexInDb]?.roomUsers[0] as UserInfo;
  }

  /**
   * function updateRoomState
   * send rooms list, where only one player inside
   * @return UpdateRoomStateResponse[]
   */
  public updateRoomState(): UpdateRoomStateResponse[] {
    console.log('this.roomsDb', this.roomsDb);
    const roomWithSinglePlayer = this.roomsDb.filter(
      (roomInfo) => roomInfo.roomUsers.length === 1,
    );
    console.log('roomWithSinglePlayer', roomWithSinglePlayer);
    return roomWithSinglePlayer;
  }
}
const roomsDb = new RoomsDb();
export default roomsDb;
