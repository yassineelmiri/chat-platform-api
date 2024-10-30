import { User } from "src/schemas/user.schema";

// this Custom type extending Express Request with user property
export interface RequestWithUser extends Request {
    user: User;
    userId: string;
    role: string;
}