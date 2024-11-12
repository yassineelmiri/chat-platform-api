import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../common/socket.middleware';

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

@WebSocketGateway({
    cors: { origin: '*' },
})
export class CallGateway {
    @WebSocketServer()
    server: Server;

    private activeRooms = new Map<string, CallRoom>();

    @SubscribeMessage('initiateCall')
    handleInitiateCall(socket: AuthenticatedSocket, data: {
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

        // Notify others about incoming call
        socket.to(chatId).emit('incomingCall', {
            chatId,
            callerId,
            callerName: socket.user.username,
            type
        });
    }

    @SubscribeMessage('acceptCall')
    handleAcceptCall(socket: AuthenticatedSocket, data: {
        chatId: string;
        callerId: string;
    }) {
        const { chatId } = data;
        const userId = socket.user._id.toString();
        const room = this.activeRooms.get(chatId);

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

    @SubscribeMessage('ice-candidate')
    handleIceCandidate(socket: AuthenticatedSocket, data: {
        chatId: string;
        targetUserId: string;
        candidate: RTCIceCandidateInit;
    }) {
        const { chatId, targetUserId, candidate } = data;
        socket.to(`call-${chatId}`).emit('ice-candidate', {
            candidate,
            userId: socket.user._id.toString(),
        });
    }
}

// import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
// import { Server } from 'socket.io';
// import { AuthenticatedSocket } from 'src/common/socket.middleware';

// @WebSocketGateway({
//     cors: {
//         origin: '*',
//     },
// })
// export class VideoCallGateway {
//     @WebSocketServer()
//     server: Server;

//     private activeRooms = new Map<string, Set<string>>(); // chatId -> Set of userIds

//     @SubscribeMessage('initiateCall')
//     handleInitiateCall(socket: AuthenticatedSocket, data: { chatId: string }) {
//         const { chatId } = data;
//         const callerId = socket.user._id
//         console.log(callerId)
//         console.log(chatId)
//         // Notify all chat members about incoming call
//         socket.to(chatId).emit('incomingCall', {
//             chatId,
//             callerId,
//             callerName: socket.user.username,
//         });
//     }

//     @SubscribeMessage('acceptCall')
//     handleAcceptCall(socket: AuthenticatedSocket, data: { chatId: string, callerId: string }) {
//         const { chatId, callerId } = data;
//         const userId = socket.user._id.toString();

//         if (!this.activeRooms.has(chatId)) {
//             this.activeRooms.set(chatId, new Set());
//         }
//         this.activeRooms.get(chatId).add(userId);

//         socket.join(`call-${chatId}`);

//         this.server.to(`call-${chatId}`).emit('userJoinedCall', {
//             userId,
//             username: socket.user.username,
//         });
//     }

//     @SubscribeMessage('rejectCall')
//     handleRejectCall(socket: AuthenticatedSocket, data: { chatId: string, callerId: string }) {
//         const userId = socket.user._id.toString();

//         this.server.to(`call-${data.chatId}`).emit('callRejected', {
//             userId,
//             username: socket.user.username,
//         });
//     }

//     @SubscribeMessage('leaveCall')
//     handleLeaveCall(socket: AuthenticatedSocket, data: { chatId: string }) {
//         const { chatId } = data;
//         const userId = socket.user._id.toString();

//         socket.leave(`call-${chatId}`);
//         this.activeRooms.get(chatId)?.delete(userId);

//         this.server.to(`call-${chatId}`).emit('userLeftCall', {
//             userId,
//             username: socket.user.username,
//         });
//     }

//     // WebRTC Signaling
//     @SubscribeMessage('offer')
//     handleOffer(socket: AuthenticatedSocket, data: { chatId: string, offer: any }) {
//         socket.to(`call-${data.chatId}`).emit('offer', {
//             offer: data.offer,
//             userId: socket.user._id.toString(),
//         });
//     }

//     @SubscribeMessage('answer')
//     handleAnswer(socket: AuthenticatedSocket, data: { chatId: string, answer: any }) {
//         socket.to(`call-${data.chatId}`).emit('answer', {
//             answer: data.answer,
//             userId: socket.user._id.toString(),
//         });
//     }

//     @SubscribeMessage('ice-candidate')
//     handleIceCandidate(socket: AuthenticatedSocket, data: { chatId: string, candidate: any }) {
//         socket.to(`call-${data.chatId}`).emit('ice-candidate', {
//             candidate: data.candidate,
//             userId: socket.user._id.toString(),
//         });
//     }
// }