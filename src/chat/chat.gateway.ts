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
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { User, UsersDocument } from "@/users/schema/users.schema"
import { Logger } from "@nestjs/common"
import { JwtTokenService } from "@/auth/jwt/token.service"
import { Message, MessagesDocument } from "./schema/message.schema"

@WebSocketGateway({ cors: { origin: "*" } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server
    private logger = new Logger(ChatGateway.name)
    constructor(
        private readonly chatService: ChatService,
        private readonly jwtTokenService: JwtTokenService,
        @InjectModel(User.name) private readonly userModel: Model<UsersDocument>,
        @InjectModel(Message.name) private readonly messageModel: Model<MessagesDocument>,
    ) { }

    async handleConnection(client: Socket) {
        const verifyToken = await this.jwtTokenService.verifyToken(client.handshake.auth.token)
        const userUid = verifyToken.sub
        await this.userModel.updateOne(
            { uid: userUid },
            {
                $set: {
                    is_online: true,
                    last_seen: null
                }
            }
        )
        this.logger.log(`Client connected: ${client.id}`)
    }

    async handleDisconnect(client: Socket) {
        this.logger.log('Client disconnected: ', client.id)
        const verifyToken = await this.jwtTokenService.verifyToken(client.handshake.auth.token)
        const userUid = verifyToken.sub
        console.log('user not ofline', userUid)
        const update = await this.userModel.updateOne(
            { uid: userUid },
            {
                $set: {
                    is_online: false,
                    last_seen: new Date()
                }
            }
        )
        console.log('user not ofline', update)
    }

    @SubscribeMessage('join_room')
    handleJoinRoom(@MessageBody() data: { roomId: string, username: string }, @ConnectedSocket() client: Socket) {
        client.join(data.roomId)
        this.logger.log(`${data.username} joined room ${data.roomId}`)
        client.to(data.roomId).emit('user_joined', { message: `${data.username} joined the room` })
    }

    @SubscribeMessage('send_message')
    async handleMessage(@MessageBody() data: { message: string, user_uid: string, roomId: string, token: string }, @ConnectedSocket() client: Socket) {
        this.server.to(data.roomId).emit('receive_message', data)
        await this.chatService.saveMessage(data)
    }

    @SubscribeMessage('leave_room')
    handleLeaveRoom(@MessageBody() data: { roomId: string, username: string }, @ConnectedSocket() client: Socket) {
        client.leave(data.roomId)
        client.to(data.roomId).emit('user_left', { message: `${data.username} left the room` })
    }

    @SubscribeMessage('send_file')
    async handleSendFile(
        @MessageBody()
        data: {
            fileName: string
            fileType: string
            fileSize: string
            message_type: 'image' | 'video' | 'audio' | 'file',
            chat_uid: string,
            roomId: string
        },
        @ConnectedSocket() client: Socket
    ) {
        this.server.to(data.roomId).emit('receive_file', {
            fileName: data.fileName,
            fileType: data.fileType,
            message_type: data.message_type,
            chat_uid: data.chat_uid,
        });
    }

    @SubscribeMessage('read_message')
    async readMessage(@MessageBody() data: {
        messageUid: string,
        roomId: any
    }, @ConnectedSocket() client: Socket) {
        await this.messageModel.updateOne(
            { uid: data.messageUid },
            {
                $set: {
                    is_read: true
                }
            }
        )
        console.log('message', data.messageUid, data.roomId._value)
        client.to(data.roomId._value).emit('read_message', { messageUid: data.messageUid })

    }
}

