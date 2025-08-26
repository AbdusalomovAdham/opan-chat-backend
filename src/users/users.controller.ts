import { Body, Controller, Get, HttpException, HttpStatus, Headers, InternalServerErrorException, Logger, Param, Patch, Post, Put, Query, Req, UseGuards, Header } from '@nestjs/common'
import { UserService } from '@/users/users.service'
import { AuthService } from '@/auth/auth.service'
import { CreateUserDto } from './dto/create-users.dto'
import { updateUser } from '@/users/dto/update-users.dto'
import { User } from './schema/users.schema';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('user')
export class UserController {
    private logger = new Logger(UserController.name)

    constructor(private readonly userService: UserService,
        private readonly authService: AuthService) { }

    @Get()
    @UseGuards(JwtAuthGuard)
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
    @UseGuards(JwtAuthGuard)
    async getUserByUid(@Headers() headers: any): Promise<{ user: User }> {
        try {
            this.logger.log(`Get user info started`)
            const { authorization } = headers
            this.logger.log(`Start get user info: ${authorization}`)
            const user = await this.userService.getUserByUid(authorization)
            this.logger.debug(`Complate get user info: ${JSON.stringify(user.username)}`)
            return { user }
        } catch (error) {
            this.logger.error(`Error get user info`)
            throw new InternalServerErrorException(error.Message)
        }
    }

    @Get('/info/:uid')
    @UseGuards(JwtAuthGuard)
    async getUserByParam(@Param('uid') uid: string, @Headers() headers: any): Promise<{ user: User }> {
        try {
            this.logger.log(`Start get user info: ${uid}`)
            const { authorization } = headers
            const user = await this.userService.getUserByParam(uid, authorization)
            this.logger.debug(`Complate user get info: ${JSON.stringify(user?.username)}`)
            return { user }
        } catch (error) {
            this.logger.error(`Error get user info`)
            throw new InternalServerErrorException(error.Message)
        }
    }

    @Patch()
    @UseGuards(JwtAuthGuard)
    async editUser(@Headers() headers: any, @Body() body: updateUser): Promise<{ userUpdate: updateUser }> {
        try {
            this.logger.log(`Started update user`)
            const { authorization } = headers
            const userUpdate = await this.userService.updateUser({ authorization, body })
            this.logger.debug(`Complate user info update`)
            return userUpdate
        } catch (error) {
            throw new InternalServerErrorException(error.message)
        }
    }

}
