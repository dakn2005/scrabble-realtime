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
    lang: string
    created_by: string

}

export { IUser, IMessage, IGame }
