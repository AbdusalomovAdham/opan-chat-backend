import { JwtTokenService } from './../auth/jwt/token.service';
import { Inject, Injectable, InternalServerErrorException, Logger, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UsersDocument } from './schema/users.schema';
import { AuthService } from '@/auth/auth.service';
import { RedisService } from '../redis/redis.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto, updateUser } from '@/users/dto/update-users.dto';
import { UserRepsitory } from './respositories/users.repository';

@Injectable()
export class UserService {
    private logger = new Logger(UserService.name)
    constructor(
        @InjectModel(User.name) private userModel: Model<UsersDocument>,
        @Inject(forwardRef(() => AuthService)) private authService: AuthService,
        private readonly jwtTokenService: JwtTokenService,
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
    async updateUser({ authorization, body }: { authorization: string, body: updateUser }): Promise<any> {
        try {
            const verifyToken = await this.jwtTokenService.verifyToken(authorization)
            const { sub } = verifyToken
            const user_uid = sub
            const updateUser = await this.userRepository.updateUser({ user_uid, body })
            return updateUser
        } catch (error) {
            this.logger.error(`Error update user`, error.stack)
            throw new InternalServerErrorException(error.message)
        }
    }

    async getUserByUid(authorization: string) {
        try {
            this.logger.log(`Start get user: ${authorization}`)
            const verifyToken = await this.jwtTokenService.verifyToken(authorization)
            const { sub } = verifyToken
            const user = await this.userRepository.getUserByUid(sub)
            return user
        } catch (error) {
            this.logger.error(`Error get user info: ${authorization}`)
            throw new InternalServerErrorException(error.message)
        }
    }

    async getUserByParam(uid: string) {
        try {
            this.logger.log(`Start get user: ${uid}`)
            const user = await this.userRepository.getUserByParam(uid)
            return user
        } catch (error) {
            this.logger.error(`Error get user info: ${uid}`)
            throw new InternalServerErrorException(error.message)
        }
    }

    async updateAvatar(userUid: string, avatarPath: string) {
        return this.userModel.findOneAndUpdate(
            { uid: userUid },
            { avatar: `http://localhost:3000/uploads/${avatarPath}` },
            { new: true }
        );
    }
}
