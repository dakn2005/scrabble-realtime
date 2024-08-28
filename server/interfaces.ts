interface IUser {
    id: string;
    username: string;
    game: string;
    score?: number;
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
    currentplayer?: string | null
    letterbag?: string[] | null
    statistics?: string | null
    updatedate: Date
}

// interface IState {
//     playerDictionary: {},

// }

type TLetterBag = {
    [dict_key: number]: string[]
}

type TPlayerData = {
    words: string[] //word|placememnt|score
    timestamp: Date
}

type TStats = {
    [dict_key: string]: TPlayerData[]
}

enum ELangs {
    sheng = 'Sheng + Swahili', 
    en = 'English',
    swa = 'Swahili'
}
// interface IGameSt

export { IUser, IMessage, IGame,IGameStateTable, TLetterBag, TStats, ELangs }
