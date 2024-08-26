import { eq, lt, gte, ne } from 'drizzle-orm';
import { DrizzleError } from 'drizzle-orm';

import {db} from '../conn';
import { game_state, games, messages } from '../schema';
import {IMessage, IGame, IGameStateTable} from '../../interfaces';

export const saveMessage = async (data: IMessage) =>{

    await db.insert(messages).values({
        username: data.username,
        message: data.message,
        game: data.game,
        createddate: data.createddate
    });
}

export const readMessages = async(roomId: number) =>{
    let res = await db.select().from(messages).where(eq(messages.game, roomId));
    return res
}

export const getGames = async(roomId? : number) => {
    let res = await db.select().from(games)
    return res
}

export const createGame = async(data: IGame) => {
    try{
         await db.insert(games).values({
            name: data.name,
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
                game: data.game,
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

export const getGameState = async(game: string) => {
    let res = await db.select().from(game_state).where(eq(game_state.game, game));
    return res
}