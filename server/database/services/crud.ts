import {db} from '../conn';
import { eq, lt, gte, ne } from 'drizzle-orm';
import { rooms, messages } from '../schema';
import {IMessage} from '../../interfaces';

export const saveMessage = async (data: IMessage) =>{
    // console.log(data)

    await db.insert(messages).values({
        username: data.username,
        message: data.message,
        room: data.room,
        createddate: data.createddate
    });
}

export const readMessages = async(roomId: number) =>{
    let res = await db.select().from(messages).where(eq(messages.room, roomId));
    return res
}

export const readRooms = async(roomId? : number) => {
    let res = await db.select().from(rooms)
    return res
}