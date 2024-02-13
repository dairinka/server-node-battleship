import { UpdateRoomStateResponce } from '../types';

interface RoomsDb {
  roomId: number;
  roomUsers: [
    {
      name: string;
      index: number;
    },
  ];
}
class RoomsDb {
  private roomsDb: RoomsDb[];
  constructor() {
    this.roomsDb = [];
  }
  //create game room and add yourself there
  public createNewRoom() {}
  //add youself to somebody's room, then remove room from rooms list
  public addUserToRoom() {}
  // send rooms list, where only one player inside
  public updateRoomState(): UpdateRoomStateResponce[] {
    const roomWithSinglePlayer = this.roomsDb.filter(
      (roomInfo) => roomInfo.roomUsers.length === 1,
    );
    return roomWithSinglePlayer;
  }
  //send for both players in the room
  public createGame() {}
}
const roomsDb = new RoomsDb();
export default roomsDb;
