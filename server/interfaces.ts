interface IUser {
    id: string;
    username: string;
    game: string;
}

interface IMessage {
    message: string
    username: string
    game: number
    createddate: Date
}

interface IGame {
    name: string
    created_by: string,
    createddate: Date
}

export { IUser, IMessage, IGame }
