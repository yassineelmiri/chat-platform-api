
import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/schemas/user.schema';
import { Chat } from '../channel/schemas/chat.schema';
import { AuthenticatedSocket, createSocketMiddleware } from '../common/socket.middleware';
import { StatusUser } from 'src/common/enums/user.enum';

@Injectable()
@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class MessageGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

    constructor(
        private jwtService: JwtService,
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Chat.name) private chatModel: Model<Chat>,
    ) { }

    afterInit(server: Server) {
        const middleware = createSocketMiddleware(this.jwtService, this.userModel);
        server.use(middleware);
    }

    async handleConnection(socket: AuthenticatedSocket) {
        if (!socket.user) return;

        const userId = socket.user._id.toString();
        this.connectedUsers.set(userId, socket.id);

        // Update user status to online
        await this.userModel.findByIdAndUpdate(userId, { status: StatusUser.ONLINE });

        // Find all chats the user is a member of
        const userChats = await this.chatModel.find({ members: userId });

        // Join all chat rooms
        userChats.forEach(chat => {
            socket.join(chat._id.toString());
        });

        // Broadcast user connection to all their chats
        userChats.forEach(chat => {
            socket.to(chat._id.toString()).emit('userConnected', {
                userId: userId,
                username: socket.user.username,
                status: StatusUser.ONLINE
            });
        });
    }

    async handleDisconnect(socket: AuthenticatedSocket) {
        if (!socket.user) return;

        const userId = socket.user._id.toString();
        this.connectedUsers.delete(userId);

        // Update user status to offline
        await this.userModel.findByIdAndUpdate(userId, { status: StatusUser.OFFLINE });


        // Find all chats the user is a member of
        const userChats = await this.chatModel.find({ members: userId });

        // Broadcast user disconnection to all their chats
        userChats.forEach(chat => {
            socket.to(chat._id.toString()).emit('userDisconnected', {
                userId: userId,
                username: socket.user.username,
                status: StatusUser.OFFLINE
            });
        });
    }

    @SubscribeMessage('joinChat')
    async handleJoinChat(socket: AuthenticatedSocket, chatId: string) {
        const chat = await this.chatModel.findById(chatId);
        if (!chat) return;

        const userId = socket.user._id
        if (!chat.members.includes(userId)) return;

        socket.join(chatId);

        // Notify other chat members
        socket.to(chatId).emit('userJoinedChat', {
            chatId,
            userId,
            username: socket.user.username
        });
    }



    @SubscribeMessage('leaveChat')
    async handleLeaveChat(socket: AuthenticatedSocket, chatId: string) {
        socket.leave(chatId);

        // Notify other chat members
        socket.to(chatId).emit('userLeftChat', {
            chatId,
            userId: socket.user._id.toString(),
            username: socket.user.username
        });
    }

    // Helper method to check if a user is online
    isUserOnline(userId: string): boolean {
        return this.connectedUsers.has(userId);
    }

    // Helper method to get all online users in a chat
    async getOnlineUsersInChat(chatId: string): Promise<string[]> {
        const sockets = await this.server.in(chatId).fetchSockets();
        return sockets.map(socket => (socket as unknown as AuthenticatedSocket).user._id.toString());
    }
}

