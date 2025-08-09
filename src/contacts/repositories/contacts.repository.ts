import { UsersModule } from '@/users/users.module';
import { Model } from 'mongoose';
import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common"
import { Contact, ContactsDocument } from '../schema/contacts.schema';
import { InjectModel } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import { User, UsersDocument } from '@/users/schema/users.schema';

@Injectable()
export class ContactsRepository {
    private logger = new Logger(ContactsRepository.name)
    constructor(
        @InjectModel(Contact.name) private readonly contactModel: Model<ContactsDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UsersDocument>
    ) { }

    // get contacts
    async getContact(uid: any): Promise<any> {
        try {
            this.logger.log(`Start get all contacts: ${uid}`)
            const userUid = uid
            const contacts = await this.contactModel.aggregate([
                { $match: { user_uid: userUid } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'contact_uid',
                        foreignField: 'uid',
                        as: 'contact_info'
                    }
                },
                { $unwind: '$contact_info' },
                {
                    $project: {
                        _id: 0,
                        uid: 1,
                        contact_uid: 1,
                        create_at: 1,
                        contact: {
                            uid: '$contact_info.uid',
                            username: '$contact_info.username',
                            full_name: '$contact_info.full_name',
                            avatar: '$contact_info.avatar'
                        }
                    }
                }
            ])
            this.logger.debug(`Complate get contacts`)

            // if (!contacts) {
            //     return { message: 'not contact yet' }
            // }
            return contacts;
        } catch (error) {
            this.logger.error(`Filed get contacts`, error.stack)
            throw new BadRequestException('Filed get contactsƒ')
        }
    }

    // create contact
    async createContact({ uid, username }: { uid: string, username: string }): Promise<Contact> {
        try {
            this.logger.log(`Create contact start: ${username}`);
            const userUid = uid
            const findUser = await this.userModel.findOne({ username })
            const user = await this.userModel.findOne({ uid: userUid })

            if (!findUser) {
                this.logger.warn(`Not found user: ${username}`);
                throw new NotFoundException('User not found');
            }
            if (user?.username === username) {
                this.logger.warn(`This is your username: ${username}`);
                throw new NotFoundException('This is your username');
            }
            const existingContact = await this.contactModel.findOne({
                user_uid: userUid,
                contact_uid: findUser.uid
            })
            if (existingContact) {
                this.logger.warn(`The user is already in contacts: ${username}`);
                throw new BadRequestException('The user is already in contacts');
            }
            const newUid = uuidv4();
            const contact = new this.contactModel({
                uid: newUid,
                user_uid: userUid,
                contact_uid: findUser.uid,
                created_at: new Date()
            });
            const createdContact = await contact.save();
            this.logger.debug(`Complete create contact: ${username}`);
            return createdContact;
        } catch (error) {
            this.logger.error(`Failed to create contact ${username}`, error.stack);
            throw new BadRequestException(error.message);
        }
    }

    // delete contact
    async deleteContact({ contact_uid, user_uid }: { contact_uid: string, user_uid: string }) {
        try {
            this.logger.log(`Start delete contact: ${contact_uid}`)
            const result = await this.contactModel.deleteOne({
                contact_uid: contact_uid,
                user_uid: user_uid
            })
            if (result.deletedCount === 0) {
                this.logger.warn(`No contact found to delete with uid: ${contact_uid}`)
                throw new NotFoundException('Contact not found')
            }
            return result
        } catch (error) {
            this.logger.error(`Failed delete contact: ${contact_uid}`, error.stack)
            throw new InternalServerErrorException(error.message)
        }
    }
}