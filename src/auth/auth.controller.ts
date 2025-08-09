import { Body, Controller, Get, HttpException, HttpStatus, Logger, Param, Patch, Post, Put, Req, UseGuards } from '@nestjs/common'
import { AuthService } from '@/auth/auth.service'
import { JwtStrategy } from '@/auth/guards/jwt.strategy';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { SignUpDto, SignInDto } from './dto/auth-create.dto';

@Controller('auth')
export class AuthController {
    private logger = new Logger(AuthController.name)
    constructor(private readonly authService: AuthService,
    ) { }

    @Post('/sign-up')
    async createUser(@Body() userData: SignInDto) {
        try {
            this.logger.log('Start sign up user')
            const user = await this.authService.SignUp(userData)
            this.logger.debug(`New user sign in username:${user.user.username}`)

            return user;
        } catch (error) {
            this.logger.error('There was an error sign up the user', error.stack)
            throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
        }
    }

    @Post('/sign-in')
    async singIn(@Body() userData: SignUpDto): Promise<{ token: string }> {
        try {
            this.logger.log(`Start user sign in!`)

            const token = await this.authService.SignIn(userData)

            this.logger.debug(`User sign up complate username:${userData.username}`)

            return token
        } catch (error) {
            this.logger.error(`Failed sign in user`, error.stack)
            throw new HttpException({ message: error.message }, HttpStatus.UNAUTHORIZED)
        }
    }
}
