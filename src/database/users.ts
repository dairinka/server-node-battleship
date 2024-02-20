import { RegRequest, RegResponse, UpdateWinnersResponse } from '../types';

interface IUserDb {
  id: number;
  userName: string;
  password: string;
  wins: number;
}
class UsersDb {
  private usersDb: IUserDb[];
  constructor() {
    this.usersDb = [];
  }

  public addNewUser({ name, password }: RegRequest): RegResponse {
    console.log('name', name, 'password', password);
    let error = false;
    let errorText = '';
    let isPasswordCorrect = false;
    let userId;
    if (!name || !password) {
      errorText = 'Some connection problem';
      error = true;
    }
    const userInfo = this.usersDb.find((user) => user.userName === name);

    if (userInfo) {
      isPasswordCorrect = userInfo.password === password;
      if (!isPasswordCorrect) {
        errorText = 'User already exist. Please, check your password';
        error = true;
      }

      userId = userInfo.id;
    } else {
      userId = this.usersDb.length + 1;
      this.usersDb.push({ id: userId, userName: name, password, wins: 0 });
    }
    return {
      name: name || '',
      index: userId,
      error,
      errorText: errorText,
    };
  }

  public updateWiners(): UpdateWinnersResponse[] {
    const winers: UpdateWinnersResponse[] = this.usersDb.map((userInfo) => {
      return { name: userInfo.userName, wins: userInfo.wins };
    });
    return winers;
  }
  public setWinner(playerId: number) {
    const index = this.usersDb.findIndex((user) => user.id === playerId);
    this.usersDb[index]!.wins += 1;
  }
}
const userDb = new UsersDb();
export default userDb;
