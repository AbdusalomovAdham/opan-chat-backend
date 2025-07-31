import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket
} from "@nestjs/websockets"

import { Server, Socket } from 'socket.io'
import { ChatService } from '@/chat/chat.service'

@WebSocketGateway({ cors: { origin: "*" } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server

    constructor(private readonly chatService: ChatService) { }

    async handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`)
    }

    handleDisconnect(client: Socket) {
        console.log('Client disconnected: ', client?.id)
    }

    @SubscribeMessage('join_room')
    handleJoinRoom(@MessageBody() data: { roomId: string, username: string }, @ConnectedSocket() client: Socket) {
        console.log('data.roomId', data)
        client.join(data.roomId)
        console.log(`${data.username} joined room ${data.roomId}`)
        client.to(data.roomId).emit('user_joined', { message: `${data.username} joined the room` })
        console.log('data.roomId', data.roomId)
    }

    @SubscribeMessage('send_message')
    async handleMessage(@MessageBody() data: { message: string, user_uid: string, roomId: string, token: string }, @ConnectedSocket() client: Socket) {
        await this.chatService.saveMessage(data)
        this.server.to(data.roomId).emit('receive_message', data)
    }

    @SubscribeMessage('leave_room')
    handleLeaveRoom(@MessageBody() data: { roomId: string, username: string }, @ConnectedSocket() client: Socket) {
        client.leave(data.roomId)
        console.log(`${data.username} left room ${data.roomId}`)
        client.to(data.roomId).emit('user_left', { message: `${data.username} left the room` })
    }
}
