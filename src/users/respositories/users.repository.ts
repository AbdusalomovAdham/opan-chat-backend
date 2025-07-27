import { UsersDocument, User } from '@/users/schema/users.schema';
import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UpdateUserDto } from '../dto/update-users.dto';
import { CreateUserDto } from '../dto/create-users.dto';

@Injectable()
export class UserRepsitory {
    private logger = new Logger(UserRepsitory.name)
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UsersDocument>
    ) { }

    async create(userData: Partial<CreateUserDto>): Promise<User> {
        try {
            this.logger.log(`Start create user: ${JSON.stringify(userData)}`)
            if (!userData) {
                this.logger.warn(`Invalid user data: ${JSON.stringify(userData)}`)
                throw new BadRequestException('User data is missing or invalid')
            }
            const user = new this.userModel(userData)
            const createUser = await user.save()
            this.logger.debug(`User created successfully: ${user.uid}`)
            return createUser
        } catch (error) {
            this.logger.error(`Failed to create user "${userData.username}" , user data: ${JSON.stringify(userData)}`, error.stack)
            throw new InternalServerErrorException('Failed to create user')
        }
    }

    async findUsername(username: string): Promise<User | null> {
        try {
            this.logger.log(`Start check username:${username}`)
            const user = await this.userModel.findOne({ username })
            this.logger.debug(`Complate check username:${user?.username}`)
            return user
        } catch (error) {
            this.logger.error(`Failed to find user with username: ${username}`, error.stack)
            throw new InternalServerErrorException('Failed to find user with username');
        }

    }

    async findUid(uid: string): Promise<User> {
        try {
            this.logger.log(`Find user uid: ${uid}`)
            const user = await this.userModel.findOne({ uid })
            if (!user) {
                this.logger.warn(`User not found with uid: ${uid}`);
                throw new NotFoundException(`User not found`);
            }
            this.logger.debug(`Complate find user: ${user.username}`)
            return user
        } catch (error) {
            this.logger.error(`Filed to find with uid: ${uid}`, error.stack)
            throw new InternalServerErrorException('Filed to find with uid');
        }

    }

    async update(uid: string, updateData: Partial<UpdateUserDto>): Promise<User> {
        try {
            this.logger.log(`Start update username in repository`);
            const updateUser = await this.userModel.findOneAndUpdate({ uid }, updateData, { new: true });
            if (!updateUser) {
                this.logger.warn(`User not found with uid: ${uid}`);
                throw new NotFoundException(`User not found`);
            }
            this.logger.debug(`Complate update username: ${JSON.stringify(updateUser?.username)}`);
            return updateUser;
        } catch (error) {
            this.logger.error(`Filed to update, data: ${JSON.stringify(updateData)}`, error.stack);
            throw new InternalServerErrorException('Filed to update');
        }
    }


    async getUserByUid(user_uid: string): Promise<any> {
        try {
            this.logger.log(`Start get user`)
            const user = await this.userModel.findOne({ uid: user_uid }).select('username email uid avatar')
            if (!user) {
                this.logger.warn(`User not found: ${user_uid}`)
                throw new NotFoundException('User not found!')
            }
            return user
        } catch (error) {
            this.logger.error(`Failed find user`)
            throw new InternalServerErrorException(error.message)
        }
    }
}