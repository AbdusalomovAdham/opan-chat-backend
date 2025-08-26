import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtTokenService } from '@/auth/jwt/token.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private readonly jwttokenService: JwtTokenService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        const authHeader = request.headers['authorization']

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Token not provided or invalid format');
        }

        try {
            const payload = await this.jwttokenService.verifyToken(authHeader)
            request.user = payload;
            return true;
        } catch (err) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
