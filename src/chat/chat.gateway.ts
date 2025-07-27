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
        // Bu yerda umumiy xabarlar kerak bo‘lsa, yuborish mumkin
    }

    handleDisconnect(client: Socket) {
        console.log('Client disconnected: ', client?.id)
    }

    // 1. ROOMga qo‘shilish
    @SubscribeMessage('join_room')
    handleJoinRoom(
        @MessageBody() data: { roomId: string, username: string },
        @ConnectedSocket() client: Socket
    ) {
        console.log('data.roomId',data.roomId)
        client.join(data.roomId)
        console.log(`${data.username} joined room ${data.roomId}`)
        client.to(data.roomId).emit('user_joined', { message: `${data.username} joined the room` })
        console.log('data.roomId', data.roomId)
    }

    // 2. ROOM ichida xabar yuborish
    @SubscribeMessage('send_message')
    async handleMessage(
        @MessageBody() data: { username: string, message: string, user_uid: string, roomId: string },
        @ConnectedSocket() client: Socket
    ) {
        // Ma'lumotlar bazasiga saqlash
        await this.chatService.saveMessage(data)

        // Faqat shu roomdagi foydalanuvchilarga xabar yuborish
        console.log('data', data)
        this.server.to(data.roomId).emit('receive_message', data)
    }

    // 3. ROOMdan chiqish (ixtiyoriy)
    @SubscribeMessage('leave_room')
    handleLeaveRoom(
        @MessageBody() data: { roomId: string, username: string },
        @ConnectedSocket() client: Socket
    ) {
        client.leave(data.roomId)
        console.log(`${data.username} left room ${data.roomId}`)
        client.to(data.roomId).emit('user_left', { message: `${data.username} left the room` })
    }
}
