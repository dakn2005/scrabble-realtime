interface IUser {
    id: string;
    username: string;
    game: string;
    score?: number;
}

interface IStkReponse { 
    stkresponse_id: string; 
    MerchantRequestID: string; 
    CheckoutRequestID: string; 
    ResultCode?: string; 
    CallbackMetadata?: JSON
    createddate: Date
    updatedate?: Date
    ResultDesc?: string
}

interface IMessage {
    message?: string
    username?: string
    socialat?: string
    phone: string
    accountref: string
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
    words: [] //word|placememnt|score
    timestamp: Date
}

type TStats = {
    [dict_key: string]: TPlayerData[]
}

type TTempTiles = {
    [dict_key: string]: string[] | undefined | null
}

enum ELangs {
    sheng = 'Sheng + Swahili', 
    en = 'English',
    swa = 'Swahili'
}
// interface IGameSt

export { IUser, IMessage, IGame,IGameStateTable, IStkReponse, ELangs, TLetterBag, TPlayerData, TStats, TTempTiles }
