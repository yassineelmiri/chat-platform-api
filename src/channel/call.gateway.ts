
import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../common/socket.middleware';
import { Injectable } from '@nestjs/common';
import { ChatService } from './chat.service';

interface CallParticipant {
    userId: string;
    username: string;
    muted: boolean;
    videoOff: boolean;
}

interface CallRoom {
    type: 'video' | 'audio';
    participants: Map<string, CallParticipant>;
}

@Injectable()
@WebSocketGateway({
    cors: { origin: '*' },
})
export class CallGateway {
    @WebSocketServer()
    server: Server;

    private activeRooms = new Map<string, CallRoom>();
    private userSocketMap = new Map<string, string>(); // userId -> socketId mapping

    constructor(private chatService: ChatService) { }



    handleConnection(socket: AuthenticatedSocket) {
        const userId = socket.user._id.toString();
        const username = socket.user.username;

        this.userSocketMap.set(userId, socket.id);

        // Broadcast to all OTHER connected clients that this user is online
        socket.broadcast.emit('userConnected', {
            userId,
            username,
            timestamp: new Date(),
            status: 'online'
        });

        // Send current online users to the newly connected user
        const onlineUsers = Array.from(this.userSocketMap.keys())
            .filter(id => id !== userId) // Exclude the current user
            .map(id => ({
                userId: id,
                status: 'online'
            }));

        socket.emit('onlineUsers', onlineUsers);
    }

    handleDisconnect(socket: AuthenticatedSocket) {
        const userId = socket.user._id.toString();
        const username = socket.user.username;

        this.userSocketMap.delete(userId);

        // Notify all OTHER users about disconnection
        socket.broadcast.emit('userDisconnected', {
            userId,
            username,
            timestamp: new Date(),
            status: 'offline'
        });

        // Handle any active calls this user might be in
        this.activeRooms.forEach((room, chatId) => {
            if (room.participants.has(userId)) {
                this.handleLeaveCall(socket, { chatId });
            }
        });
    }

    @SubscribeMessage('initiateCall')
    async handleInitiateCall(socket: AuthenticatedSocket, data: {
        chatId: string;
        type: 'video' | 'audio';
    }) {
        const { chatId, type } = data;
        const callerId = socket.user._id.toString();

        // Create new room if it doesn't exist
        if (!this.activeRooms.has(chatId)) {
            this.activeRooms.set(chatId, {
                type,
                participants: new Map([[callerId, {
                    userId: callerId,
                    username: socket.user.username,
                    muted: false,
                    videoOff: false
                }]])
            });
        }

        // Join the call room
        socket.join(`call-${chatId}`);

        try {
            // Get all users in the chat
            const chatUsers = await this.chatService.getChatUsers(chatId);

            // Notify all online users from the chat
            chatUsers.forEach(userId => {
                const socketId = this.userSocketMap.get(userId.toString());
                if (socketId && userId.toString() !== callerId) {
                    this.server.to(socketId).emit('incomingCall', {
                        chatId,
                        callerId,
                        callerName: socket.user.username,
                        type
                    });
                }
            });
        } catch (error) {
            console.error('Error notifying chat users:', error);
            socket.emit('callError', {
                message: 'Failed to notify users'
            });
        }
    }
    // adds person to the call room
    // like entering the meeting room
    @SubscribeMessage('acceptCall')
    handleAcceptCall(socket: AuthenticatedSocket, data: {
        chatId: string;
        callerId: string;
    }) {
        const { chatId } = data;
        const userId = socket.user._id.toString();
        const room = this.activeRooms.get(chatId);
        console.log('accept call')
        if (room) {
            // Add participant to room
            room.participants.set(userId, {
                userId,
                username: socket.user.username,
                muted: false,
                videoOff: false
            });

            // Join the call room
            socket.join(`call-${chatId}`);

            // Notify others about new participant
            this.server.to(`call-${chatId}`).emit('userJoinedCall', {
                userId,
                username: socket.user.username
            });

            // Send current participants to new user
            socket.emit('currentParticipants', {
                participants: Array.from(room.participants.values())
            });
        }
    }

    @SubscribeMessage('rejectCall')
    handleRejectCall(socket: AuthenticatedSocket, data: {
        chatId: string;
        callerId: string;
    }) {
        const { chatId } = data;

        this.server.to(`call-${chatId}`).emit('callRejected', {
            userId: socket.user._id.toString(),
            username: socket.user.username
        });
    }

    @SubscribeMessage('leaveCall')
    handleLeaveCall(socket: AuthenticatedSocket, data: { chatId: string }) {
        const { chatId } = data;
        const userId = socket.user._id.toString();
        const room = this.activeRooms.get(chatId);

        if (room) {
            // Remove participant
            room.participants.delete(userId);
            socket.leave(`call-${chatId}`);

            // Notify others
            this.server.to(`call-${chatId}`).emit('userLeftCall', {
                userId,
                username: socket.user.username
            });

            // Clean up empty room
            if (room.participants.size === 0) {
                this.activeRooms.delete(chatId);
            }
        }
    }

    @SubscribeMessage('toggleAudio')
    handleToggleAudio(socket: AuthenticatedSocket, data: {
        chatId: string;
        muted: boolean;
    }) {
        const { chatId, muted } = data;
        const userId = socket.user._id.toString();
        const room = this.activeRooms.get(chatId);

        if (room) {
            const participant = room.participants.get(userId);
            if (participant) {
                participant.muted = muted;
                this.server.to(`call-${chatId}`).emit('participantToggleAudio', {
                    userId,
                    muted
                });
            }
        }
    }


    @SubscribeMessage('toggleVideo')
    handleToggleVideo(socket: AuthenticatedSocket, data: {
        chatId: string;
        videoOff: boolean;
    }) {
        const { chatId, videoOff } = data;
        const userId = socket.user._id.toString();
        const room = this.activeRooms.get(chatId);

        if (room && room.type === 'video') {
            const participant = room.participants.get(userId);
            if (participant) {
                participant.videoOff = videoOff;
                this.server.to(`call-${chatId}`).emit('participantToggleVideo', {
                    userId,
                    videoOff
                });
            }
        }
    }


    //offer (Starting the connection)
    @SubscribeMessage('offer')
    handleOffer(socket: AuthenticatedSocket, data: {
        chatId: string;
        targetUserId: string;
        offer: RTCSessionDescriptionInit;
    }) {
        const { chatId, targetUserId, offer } = data;
        socket.to(`call-${chatId}`).emit('offer', {
            offer,
            userId: socket.user._id.toString(),
        });
    }


    //answer (Accepting the connection)
    @SubscribeMessage('answer')
    handleAnswer(socket: AuthenticatedSocket, data: {
        chatId: string;
        targetUserId: string;
        answer: RTCSessionDescriptionInit;
    }) {
        const { chatId, targetUserId, answer } = data;
        socket.to(`call-${chatId}`).emit('answer', {
            answer,
            userId: socket.user._id.toString(),
        });
    }




    //ICE Candidate  = Finding ways to connect <nta fi asfi and fi casa ntla9aw fi marrakch
    // we use STUN Server that mean I can send it through the post office if direct delivery doesn't work
    @SubscribeMessage('ice-candidate')
    handleIceCandidate(socket: AuthenticatedSocket, data: {
        chatId: string;
        targetUserId: string;
        candidate: RTCIceCandidateInit; // The connection recipe
    }) {
        const { chatId, targetUserId, candidate } = data;

        // Itis like saying
        // hey I found a way we might be able to connect!
        // Here is the address/method we can try
        socket.to(`call-${chatId}`).emit('ice-candidate', {
            candidate, // The connection recipe
            userId: socket.user._id.toString(),
        });
    }
}
