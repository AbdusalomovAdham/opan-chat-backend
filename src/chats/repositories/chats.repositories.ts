import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { User, UsersDocument } from '@/users/schema/users.schema';
import { Chat, ChatsDocument } from '@/chats/schema/chats.schema';
import { Model } from 'mongoose';

@Injectable()
export class ChatsRepository {
    constructor(
        @InjectModel(Chat.name) private readonly chatModel: Model<ChatsDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UsersDocument>,
    ) { }

    async getChats(uid: any): Promise<any> {
        try {
            const chats = await this.chatModel.aggregate([
                {
                    $lookup: {
                        from: 'chat_participants',
                        localField: 'uid',
                        foreignField: 'chat_uid',
                        as: 'participants'
                    }
                },
                {
                    $unwind: {
                        path: '$participants',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $match: {
                        $or: [
                            { created_by: uid },
                            { 'participants.user_uid': uid }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'created_by',
                        foreignField: 'uid',
                        as: 'created_by_user'
                    }
                },
                {
                    $unwind: {
                        path: '$created_by_user',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        uid: 1,
                        type: 1,
                        created_at: 1,
                        created_by: 1,
                        created_by_user: {
                            uid: 1,
                            username: 1,
                            full_name: 1,
                            avatar: 1
                        }
                    }
                }
            ]);
            console.log(chats)
            return chats;
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

}