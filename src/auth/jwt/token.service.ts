import { Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtTokenService {
    private logger = new Logger(JwtTokenService.name)
    constructor(private jwtService: JwtService) { }

    async singToken(uid: string, username: string) {
        try {
            const payload = { sub: uid }
            const token = this.jwtService.sign(payload)
            this.logger.debug(`Genereted JWT Token with payload ${JSON.stringify(payload)} for username: ${username}`)
            return token
        } catch (error) {
            this.logger.error(`Error generete token: ${JSON.stringify(uid)}`, error.stack)
            throw new Error('There was an error with user_id!')
        }
    }

    async verifyToken(authHeader: string) {
        try {
            this.logger.log(`Start verify token`)
            const token = authHeader.split(' ')[1]
            const decoded = await this.jwtService.verify(token)
            // console.log('decoded', decoded)
            this.logger.debug(`Verfiyed token: ${token}`)
            return decoded
        } catch (error) {
            this.logger.error(`Error verify token: ${authHeader}`)
            throw new Error('The token is invalid or expired!')
        }
    }
}