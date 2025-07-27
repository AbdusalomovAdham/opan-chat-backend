import { RedisModule } from './../redis/redis.module';
import { UserRepsitory } from '@/users/respositories/users.repository'
import { ConflictException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt'
import { v4 as uuidv4 } from 'uuid';
import { SignUpDto, SignInDto } from '@/auth/dto/auth-create.dto'
import { User, AuthDocument } from './schema/auth.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { JwtTokenService } from './jwt/token.service';

@Injectable()
export class AuthService {
    private logger = new Logger(AuthService.name)
    constructor(
        @InjectModel(User.name) private authModel: Model<AuthDocument>,
        private jwtService: JwtService,
        private userRepsitory: UserRepsitory,
        private jwtTokenService: JwtTokenService
    ) { }
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

    //  reg
    async SignIn(userData: SignInDto): Promise<{ token: string, user: any }> {
        try {
            const { username, password, email } = userData
            this.logger.log(`Start register: ${username}`)
            const exists = await this.authModel.findOne({ username })
            if (exists) {
                this.logger.warn(`Username already exist`)
                throw new ConflictException('Username already exist')
            }
            const uid = uuidv4();
            const heshPassword = await this.hashPassword(password)
            const user = new this.authModel({ username, password: heshPassword, email: "", phone: "", address: "", uid, avatar: "", phone_number: "" })
            await user.save()
            this.logger.debug(`User save mongo DB: ${user.username}`)
            const payload = { uid, username }
            const token = this.jwtService.sign(payload)
            this.logger.debug(`Token created: ${username}`)
            return { token: token, user: user }
        } catch (error) {
            this.logger.error(`Error sign in user: ${userData.username}`, error.stack)
            throw new InternalServerErrorException(error.message)
        }
    }

    async SignUp(userData: SignUpDto): Promise<{ token: string, user: User }> {
        this.logger.log(`Started logging`)
        try {
            const { username, password } = userData
            const user = await this.authModel.findOne({ username })
            if (!user) {
                this.logger.warn(`User not found: ${username}`)
                throw new UnauthorizedException(`Username or password is correct`)
            }
            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) {
                this.logger.warn(`Password wrong: ${password}`)
                throw new UnauthorizedException(`Username or password is correct`)
            }

            const token = await this.jwtTokenService.singToken(user.uid, user.username)
            this.logger.debug(`Token create: ${user.username}`)
            this.logger.debug(`Sign up complate: ${user.username}`)
            return { user: user, token: token }
        }
        catch (error) {
            this.logger.error(`Error sign up user: ${userData.username}`, error.stack)
            throw new UnauthorizedException(error.message)
        }
    }
}