
import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private connectedUsers: Map<string, string> = new Map(); // socketId -> userId

    async handleConnection(client: Socket) {
        const userId = client.handshake.query.userId as string;
        if (userId) {
            this.connectedUsers.set(client.id, userId);
            client.broadcast.emit('user:connected', { userId });
        }
    }

    async handleDisconnect(client: Socket) {
        const userId = this.connectedUsers.get(client.id);
        if (userId) {
            this.connectedUsers.delete(client.id);
            client.broadcast.emit('user:disconnected', { userId });
        }
    }

    @SubscribeMessage('join:chat')
    handleJoinChat(client: Socket, chatId: string) {
        client.join(chatId);
    }

    @SubscribeMessage('leave:chat')
    handleLeaveChat(client: Socket, chatId: string) {
        client.leave(chatId);
    }

    @SubscribeMessage('send:message')
    handleMessage(client: Socket, payload: { chatId: string; message: any }) {
        console.log('hello')
        this.server.to(payload.chatId).emit('new:message', payload.message);
    }
}