```mermaid
classDiagram
    class User {
        +id: string
        +username: string
        +email: string
        +status: UserStatus
        +reputation: number
        +friends: User[]
        +sendFriendRequest()
        +acceptFriendRequest()
        +updateStatus()
    }

    class Channel {
        +id: string
        +name: string
        +type: ChannelType
        +isPrivate: boolean
        +isSafeMode: boolean
        +owner: User
        +members: User[]
        +moderators: User[]
        +bannedWords: string[]
        +createMessage()
        +inviteUser()
        +banUser()
        +bounceUser()
    }

    class Message {
        +id: string
        +content: string
        +sender: User
        +timestamp: DateTime
        +isPinned: boolean
        +channel: Channel
        +pin()
        +unpin()
    }

    class TemporaryRoom {
        +id: string
        +duration: number
        +scheduledTime: DateTime
        +participants: User[]
        +schedule()
        +start()
        +end()
    }

    class Notification {
        +id: string
        +type: NotificationType
        +recipient: User
        +content: string
        +isRead: boolean
        +send()
        +markAsRead()
    }

    class ChatMetrics {
        +sessionId: string
        +startTime: DateTime
        +endTime: DateTime
        +messageCount: number
        +popularWords: Map
        +generateReport()
    }

    User "1" --> "*" Channel : creates/joins
    User "1" --> "*" Message : sends
    Channel "1" --> "*" Message : contains
    Channel "1" --> "1" ChatMetrics : generates
    User "1" --> "*" Notification : receives
    User "1" --> "*" TemporaryRoom : participates
    Channel "1" --> "*" User : has members
