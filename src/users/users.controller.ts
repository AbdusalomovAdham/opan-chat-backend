import { Body, Controller, Get, HttpException, HttpStatus, InternalServerErrorException, Logger, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common'
import { UserService } from '@/users/users.service'
import { AuthService } from '@/auth/auth.service'
import { CreateUserDto, LoginUserDto } from './dto/create-users.dto'
import { UpdateUserDto, updateUserPassword } from '@/users/dto/update-users.dto'
import { User } from './schema/users.schema';
import { JwtStrategy } from '@/auth/guards/jwt.strategy';
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

    @Patch('update')
    @UseGuards(JwtAuthGuard)
    async updateUser(@Req() req, @Body() updateData: Partial<UpdateUserDto>) {
        try {
            const uid = req.user.sub
            this.logger.log('Start update user')
            const user = await this.userService.updateUser(uid, updateData)
            this.logger.debug(`Update user ${JSON.stringify(user.username)}`)
            return user
        } catch (error) {
            this.logger.error(`Update error user uid: ${updateData.username}`)
            throw new HttpException({ messaege: error.message }, HttpStatus.BAD_REQUEST)
        }
    }

    @Get('info/:uid')
    async getUserByUid(@Param('uid') userUid: string) {
        try {
            // const { user_uid } = body
            console.log('userUid', userUid)
            this.logger.log(`Start get user info: ${userUid}`)
            const user = await this.userService.getUserByUid(userUid)
            return { user }
        } catch (error) {
            this.logger.error(`Error get user info: ${userUid}`)
            throw new InternalServerErrorException(error.Message)
        }
    }

}
