import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketServer,
  MessageBody
} from '@nestjs/websockets';
import { JwtTokenService } from '@/auth/jwt/token.service';
import { Server, Socket } from 'socket.io';
import { CallService } from './call.service';
import { constructNow } from 'date-fns';

@WebSocketGateway({ cors: { origin: '*' } })
export class CallGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  constructor(
    private readonly jwtTokenService: JwtTokenService,
    private readonly callService: CallService
  ) { }

  @WebSocketServer() server: Server;
  afterInit(server: Server) { console.log(' WebSocket server initialized') }

  private onlineUsers = new Map<string, string>()
  private myUid = ''
  async handleConnection(client: Socket) {
    try {
      let token = client.handshake.auth?.token;
      if (!token) return client.disconnect()
      const decoded = await this.jwtTokenService.verifyToken(token);
      this.onlineUsers.set(decoded.sub, client.id);
      client.data.userUid = decoded.sub;
      this.server.emit('online-user', { onlineUsers: Array.from(this.onlineUsers.keys()) })
      client.emit('socket-id', { mySocketId: client.id })
    } catch (error) {
      console.error(' Token verification failed:', error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`)

    for (const [userId, socketId] of this.onlineUsers.entries()) {
      if (socketId === client.id) {
        this.onlineUsers.delete(userId)
        break
      }
    }
    this.server.emit('online-user', {
      onlineUsers: Array.from(this.onlineUsers.keys())
    })
  }


  @SubscribeMessage('offer')
  handleOffer(client: Socket, payload: any) {
    const targetId = this.onlineUsers.get(payload.to)
    if (!targetId) {
      this.server.to(payload.from).emit('offline-user', payload)
      this.callService.missedCall(payload.type, client.data.userUid, payload.to)
      return
    }
    this.server.to(targetId).emit('offer', payload)
  }

  @SubscribeMessage('answer')
  async handleAnswer(client: Socket, payload: any) {
    this.server.to(payload.to).emit('answer', payload)
    const to = [...this.onlineUsers.entries()].find(([_, value]) => value === payload.to)?.[0]

    await this.callService.answeredCall(payload.type, to!, client.data.userUid)
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(client: Socket, payload: any) {
    this.server.to(payload.to).emit('ice-candidate', payload);
  }

  @SubscribeMessage('call-end')
  async handleCallEnd(client: Socket, payload: any) {
    const targetId = this.onlineUsers.get(payload.to)
    if (!targetId) {
      this.server.to(payload.to).emit('call-end', payload);
      this.server.to(payload.from).emit('call-end', payload)
      return
    }
    this.server.to(targetId).emit('call-end', payload);
    this.server.to(payload.from).emit('call-end', payload)
  }

  @SubscribeMessage('decline-call')
  async handleDeclineCall(client: Socket, payload: any) {
    const to = [...this.onlineUsers.entries()].find(([_, value]) => value === payload.to)?.[0];
    this.server.to(payload.to).emit('decline-call', payload)
    await this.callService.declinedCall(payload.type, client.data.userUid, to!)
  }

  @SubscribeMessage('target-socket-id')
  handleTargetId(client: Socket, payload: any) {
    const targetId = this.onlineUsers.get(payload.targetUid)
    if (targetId) return 'User not online'
    payload.targetUid = targetId
    this.server.to(payload.to).emit('target-socket-id', payload);
  }

  @SubscribeMessage('online-user')
  isOnline(client: Socket, payload: any) {
    const targetId = this.onlineUsers.get(payload.user)
    if (!targetId) return this.server.to(payload.from).emit('online-user', payload)
  }

  @SubscribeMessage('user-typing')
  handleTyping(@MessageBody() data: { to: string, from: string }) {
    const receiverSocketId = this.onlineUsers.get(data.to)
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('user-typing', data.from)
    }
  }

  @SubscribeMessage('user-stop-typing')
  handleStopTyping(@MessageBody() data: { to: string, from: string }) {
    const receiverSocketId = this.onlineUsers.get(data.to)
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('hide-typing', data.from)
    }
  }

}
