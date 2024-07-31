interface IUser {
    id: string;
    username: string;
    room: string;
}

interface IMessage {
    message: string,
    username: string,
    room: number,
    createddate: Date
}

export { IUser, IMessage }
