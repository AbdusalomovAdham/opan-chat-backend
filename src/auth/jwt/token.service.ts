import { Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtTokenService {
    private logger = new Logger(JwtTokenService.name)
    constructor(private readonly jwtService: JwtService) { }

    async singToken(uid: string, username: string) {
        try {
            const payload = { sub: uid, username }
            const token = this.jwtService.sign(payload, { secret: 'SECRET_KEY' })
            this.logger.debug(`Genereted JWT Token with payload ${JSON.stringify(payload)} for username: ${username}`)
            return token
        } catch (error) {
            this.logger.error(`Error generete token: ${JSON.stringify(uid)}`, error.stack)
            throw new Error('There was an error with user_id!')
        }
    }

    async verifyToken(authHeader: string) {
        try {
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new Error('Authorization header is missing or invalid')
            }
            const token = authHeader.split(' ')[1]
            const decoded = await this.jwtService.verify(token, { secret: 'SECRET_KEY' })

            this.logger.debug(`Verified token: ${token}`)
            return decoded
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                this.logger.warn('Token expired!')
            } else if (error.name === 'JsonWebTokenError') {
                this.logger.warn('Invalid token!')
            }

            this.logger.error(`Error verify token: ${authHeader}, error: ${error.message}`)
            throw new Error('The token is invalid or expired!')
        }
    }

}