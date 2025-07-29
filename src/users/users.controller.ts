import { Body, Controller, Get, HttpException, HttpStatus, Headers, InternalServerErrorException, Logger, Param, Patch, Post, Put, Query, Req, UseGuards, Header } from '@nestjs/common'
import { UserService } from '@/users/users.service'
import { AuthService } from '@/auth/auth.service'
import { CreateUserDto, LoginUserDto } from './dto/create-users.dto'
import { UpdateUserDto, updateUser } from '@/users/dto/update-users.dto'
import { User } from './schema/users.schema';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('user')
export class UserController {
    private logger = new Logger(UserController.name)

    constructor(private readonly userService: UserService,
        private readonly authService: AuthService) { }

    @Get()
    async getUsers(): Promise<CreateUserDto[]> {
        try {
            this.logger.log(`Start get all users`)
            const users = await this.userService.getAllUser();
            this.logger.debug(`All user get compalte`)
            return users;
        } catch (error) {
            this.logger.error('Error get all user', error.stack)
            throw new HttpException({ message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @Get('/info')
    async getUserByUid(@Headers() headers: any) {
        try {
            const { authorization } = headers
            console.log('userUid', authorization)
            this.logger.log(`Start get user info: ${authorization}`)
            const user = await this.userService.getUserByUid(authorization)
            return { user }
        } catch (error) {
            this.logger.error(`Error get user info`)
            throw new InternalServerErrorException(error.Message)
        }
    }

    @Get('/info/:uid')
    async getUserByParam(@Param('uid') uid: string) {
        try {
            console.log('uid', uid)
            console.log('userUid', uid)
            this.logger.log(`Start get user info: ${uid}`)
            const user = await this.userService.getUserByParam(uid)
            return { user }
        } catch (error) {
            this.logger.error(`Error get user info`)
            throw new InternalServerErrorException(error.Message)
        }
    }

    @Patch()
    async editUser(@Headers() headers: any, @Body() body: updateUser) {
        try {
            const { authorization } = headers
            const userUpdate = await this.userService.updateUser({ authorization, body })
            return userUpdate
        } catch (error) {
            throw new InternalServerErrorException(error.message)
        }
    }

}
