import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) { }

    canActivate(context: ExecutionContext): boolean {
        const client: Socket = context.switchToWs().getClient();
        const token = client.handshake.auth.token;

        try {
            const payload = this.jwtService.verify(token);
            client.data.user = payload; 
            return true;
        } catch (err) {
            return false;
        }
    }
}
