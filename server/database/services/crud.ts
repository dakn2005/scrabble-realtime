import { eq, lt, gte, ne, } from 'drizzle-orm';
import { DrizzleError } from 'drizzle-orm';
import dayjs from 'dayjs';

// import {db} from '../conn';
import { db } from '../db-neon';
import { game_state, games, supporter_messages, stkresponse } from '../schema';
import {IMessage, IGame, IGameStateTable, IStkReponse } from '../../interfaces';

export const saveStkReponse = async(data: IStkReponse) => {

    await db.insert(stkresponse).values({
        stkresponse_id: data.stkresponse_id,
        accountref: dayjs().format('YYYYMMDDHHMMs'),
        MerchantRequestID: data.MerchantRequestID,
        CheckoutRequestID: data.CheckoutRequestID,
        ResultCode: data.ResultCode || '', // Handle the case when ResultCode is undefined
        ResultDesc: data.ResultDesc,
        CallbackMetadata: data.CallbackMetadata || null, // Handle the case when CallbackMetadata is undefined
        createddate: data.createddate,
        updatedate: data.updatedate,
    });
}

export const getStk = async (checkoutID: string) =>{
    if (!checkoutID) return null;

    let res = await db.select().from(stkresponse).where(eq(stkresponse.CheckoutRequestID, checkoutID));
    return res;
}

export const saveSupporterMessage = async (data: IMessage) =>{
    await db.insert(supporter_messages).values({
        username: data.username,
        message: data.message,
        socialat: data.socialat,
        phone: data.phone,
        accountref: data.accountref,
        createddate: new Date()
    });
}

export const getGames = async(roomId? : number) => {
    let res = await db.select().from(games)
    return res
}

export const createGame = async(data: IGame) => {
    try{

         await db.insert(games).values({
            name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
            lang: data.lang,
            use_scrabble_dictionary: data.use_scrabble_dictionary,
            created_by: data.created_by,
        });

        return [true, null ]
    }catch(e: DrizzleError | any){
        return [false, e]
    }
}

export const upsertGameState = async(data: IGameStateTable) => {
    try{
        await db
            .insert(game_state)
            .values({
                game: data.game.charAt(0).toUpperCase() + data.game.slice(1),
                currentplayer: data.currentplayer,
                letterbag: data.letterbag,
                statistics: data.statistics,
                updatedate: new Date()
            })
            .onConflictDoUpdate({
                target: game_state.game,
                set:{
                    currentplayer: data.currentplayer,
                    letterbag: data.letterbag,
                    statistics: data.statistics,
                    updatedate: new Date()
                }
            })
    }catch(e: DrizzleError | any){
        return [false, e]
    }
}

export const patchGameState = async(gameName: string, data: any) => {
    try{
        await db
            .update(game_state)
            .set({
                ...data,
                updatedate: new Date()
            })
            .where(eq(game_state.game, gameName))
    }catch(e: DrizzleError | any){
        return [false, e]
    }
}

export const getGameState = async(game: string) => {
    let res = await db.select().from(game_state).where(eq(game_state.game, game));
    return res
}
