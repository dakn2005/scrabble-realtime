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

interface IGameStateTable {
    name: string
    state: JSON
    updatedate: Date
}

interface IState {
    playerDictionary: {},

}

type TLetterBag = {
    [dict_key: number]: string[]
}

// interface IGameSt

export { IUser, IMessage, IGame,IGameStateTable, TLetterBag }
