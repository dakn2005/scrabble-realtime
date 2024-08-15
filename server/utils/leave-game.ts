import { IUser } from "../interfaces";

export default function leaveRoom(userID: string, chatRoomUsers: IUser[]) {
    return chatRoomUsers.filter((user: IUser) => user.id != userID);
}
