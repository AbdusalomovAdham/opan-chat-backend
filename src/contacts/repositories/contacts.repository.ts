import { Model } from 'mongoose';
import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';

import { Contact, ContactsDocument } from '../schema/contacts.schema';
import { User, UsersDocument } from '@/users/schema/users.schema';
import { Chat, ChatDocument } from '@/chat/schema/chat.schema';
import {
    ChatParticipant,
    ChatParticipantDocument,
} from '@/chat/schema/participant.schema';

@Injectable()
export class ContactsRepository {
    private logger = new Logger(ContactsRepository.name);

    constructor(
        @InjectModel(Contact.name)
        private readonly contactModel: Model<ContactsDocument>,
        @InjectModel(User.name)
        private readonly userModel: Model<UsersDocument>,
        @InjectModel(Chat.name)
        private readonly chatModel: Model<ChatDocument>,
        @InjectModel(ChatParticipant.name)
        private readonly participantModel: Model<ChatParticipantDocument>,
    ) { }


    private async getUserByUsername(username: string): Promise<User> {
        const user = await this.userModel.findOne({ username });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }


    private async checkContactExists(userUid: string, contactUid: string) {
        const existingContact = await this.contactModel.findOne({
            user_uid: userUid,
            contact_uid: contactUid,
        });
        if (existingContact) {
            throw new BadRequestException('The user is already in contacts');
        }
    }

    private async findCommonP2PChat(uid1: string, uid2: string): Promise<string | null> {
        const myChats = await this.participantModel.find({ user_uid: uid1 }).select('chat_uid -_id');
        const userChats = await this.participantModel.find({ user_uid: uid2 }).select('chat_uid -_id');

        const myChatUids = myChats.map((c) => c.chat_uid);
        const userChatUids = userChats.map((c) => c.chat_uid);

        const commonChatUid = myChatUids.find((id) => userChatUids.includes(id));
        if (!commonChatUid) return null;

        const chat = await this.chatModel.findOne({ uid: commonChatUid, type: 'P2P' }).select('uid');
        return chat ? chat.uid : null;
    }


    private async createP2PChat(userUid: string, contactUid: string) {
        const newChat = new this.chatModel({
            uid: uuidv4(),
            type: 'P2P',
            created_by: userUid,
            created_at: new Date(),
        });
        await newChat.save();

        await this.participantModel.insertMany([
            { uid: uuidv4(), user_uid: userUid, chat_uid: newChat.uid },
            { uid: uuidv4(), user_uid: contactUid, chat_uid: newChat.uid },
        ]);

        return newChat.uid;
    }


    async getContact(uid: string): Promise<any> {
        try {
            this.logger.log(`Start get all contacts: ${uid}`);

            const contacts = await this.contactModel.aggregate([
                { $match: { user_uid: uid } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'contact_uid',
                        foreignField: 'uid',
                        as: 'contact_info',
                    },
                },
                { $unwind: '$contact_info' },
                {
                    $project: {
                        _id: 0,
                        uid: 1,
                        contact_uid: 1,
                        created_at: 1,
                        contact: {
                            uid: '$contact_info.uid',
                            username: '$contact_info.username',
                            full_name: '$contact_info.full_name',
                            avatar: '$contact_info.avatar',
                        },
                    },
                },
            ]);

            for (const c of contacts) {
                c.chat_uid = await this.findCommonP2PChat(uid, c.contact_uid);
            }

            this.logger.debug(`Complete get contacts: ${contacts.length}`);
            return contacts;
        } catch (error) {
            this.logger.error(`Failed get contacts`, error.stack);
            throw new BadRequestException('Failed get contacts');
        }
    }

    async createContact({ uid, username }: { uid: string; username: string }): Promise<any> {
        try {
            this.logger.log(`Create contact start: ${username}`);

            const findUser = await this.getUserByUsername(username);
            const user = await this.userModel.findOne({ uid });

            if (user?.username === username) {
                throw new BadRequestException('This is your username');
            }

            await this.checkContactExists(uid, findUser.uid);

            const contact = new this.contactModel({
                uid: uuidv4(),
                user_uid: uid,
                contact_uid: findUser.uid,
                created_at: new Date(),
            });
            const createdContact = await contact.save();

            const existingChatUid = await this.findCommonP2PChat(uid, findUser.uid);
            if (!existingChatUid) {
                await this.createP2PChat(uid, findUser.uid);
            }

            this.logger.debug(`Complete create contact: ${username}`);
            return createdContact;
        } catch (error) {
            this.logger.error(`Failed to create contact ${username}`, error.stack);
            throw new BadRequestException(error.message);
        }
    }

    async deleteContact({ contact_uid, user_uid }: { contact_uid: string; user_uid: string }) {
        try {
            this.logger.log(`Start delete contact: ${contact_uid}`);
            const result = await this.contactModel.deleteOne({ contact_uid, user_uid });

            if (result.deletedCount === 0) {
                throw new NotFoundException('Contact not found');
            }
            return result;
        } catch (error) {
            this.logger.error(`Failed delete contact: ${contact_uid}`, error.stack);
            throw new InternalServerErrorException(error.message);
        }
    }
}
