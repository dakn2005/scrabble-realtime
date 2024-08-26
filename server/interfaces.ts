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
    use_scrabble_dictionary: boolean
    created_by: string
}

interface IGameStateTable {
    game: string
    currentplayer: string
    letterbag: string[]
    statistics: JSON | unknown
    updatedate: Date
}

interface IState {
    playerDictionary: {},

}

type TLetterBag = {
    [dict_key: number]: string[]
}

enum ELangs {
    sheng = 'Sheng', 
    en = 'English',
}
// interface IGameSt

export { IUser, IMessage, IGame,IGameStateTable, TLetterBag, ELangs }
