import { eq, lt, gte, ne } from 'drizzle-orm';
import { DrizzleError } from 'drizzle-orm';

import {db} from '../conn';
import { games, messages } from '../schema';
import {IMessage, IGame} from '../../interfaces';

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
            created_by: data.created_by,
            createddate: new Date()
        });

        return [true, null ]
    }catch(e: DrizzleError | any){
        return [false, e]
    }
}