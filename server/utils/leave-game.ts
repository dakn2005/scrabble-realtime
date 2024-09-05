import { IUser } from "../interfaces";


export function leaveGameBySocketId(socketId: string, chatRoomUsers: IUser[]) {
    return chatRoomUsers.filter((user: IUser) => user.id != socketId);
}

export function leaveGame(username: string, game: string, chatRoomUsers: IUser[]) {
    return chatRoomUsers.filter((user: IUser) => !(user.username == username && user.game == game));
}