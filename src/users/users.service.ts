import { BadRequestException, HttpStatus, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UsersDocument } from './schema/users.schema';
import { CreateUserDto } from './dto/create-users.dto';
import { AuthService } from '@/auth/auth.service';
import { v4 as uuidv4 } from 'uuid';
import { RedisService } from '../redis/redis.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto, updateUserPassword } from '@/users/dto/update-users.dto';
import { UserRepsitory } from './respositories/users.repository';

@Injectable()
export class UserService {
    private logger = new Logger(UserService.name)
    constructor(
        @InjectModel(User.name) private userModel: Model<UsersDocument>,
        @Inject(forwardRef(() => AuthService)) private authService: AuthService,
        private redisService: RedisService,
        private readonly userRepository: UserRepsitory
    ) { }

    // get all users
    async getAllUser(): Promise<User[]> {
        try {
            this.logger.log(`Start get all user`)
            const user = this.userModel.find().exec();
            this.logger.debug(`Complate get all user`)
            return user
        } catch (error) {
            this.logger.error(`Error get all users `)
            throw new InternalServerErrorException(error.message)
        }
    }

    // password hashed
    async hashPassword(password: string): Promise<string> {
        try {
            this.logger.log(`Start hash password`)
            const hashedPassword = await bcrypt.hash(password, 10);
            this.logger.debug(`Complete hash password: ${hashedPassword}`)
            return hashedPassword;
        } catch (error) {
            this.logger.error(`Error hashing password: ${password}`, error.stack)
            throw new InternalServerErrorException(error.message)
        }
    }

    // update user
    async updateUser(uid: string, updateData: Partial<UpdateUserDto>): Promise<any> {
        try {
            this.logger.log(`Start update user: ${JSON.stringify({ username: updateData?.username })}`)
            if (!updateData.username) {
                this.logger.error('❌ Username is required');
                throw new BadRequestException('Username is required');
            }
            const userChecked = await this.userRepository.findUsername(updateData.username)
            if (userChecked) {
                this.logger.error('❌ Username is already taken');
                throw new BadRequestException('Username already taken')
            }
            const updatedUser = await this.userRepository.update(uid, updateData)
            await this.redisService.set(`user:${updatedUser!.uid}`, updatedUser)
            this.logger.log(`Updated Redis cache for user: ${updateData.username}`);
            this.logger.debug(`Successfully completed update for user: ${updateData.username}`);
            return updatedUser;
        } catch (error) {
            this.logger.error(`Error update user`, error.stack)
            throw new InternalServerErrorException(error.message)
        }
    }

    async getUserByUid(uid: string) {
        try {
            this.logger.log(`Start get user: ${uid}`)
            const user = await this.userRepository.getUserByUid(uid)
            return user
        } catch (error) {
            this.logger.error(`Error get user info: ${uid}`)
            throw new InternalServerErrorException(error.message)
        }
    }
}
