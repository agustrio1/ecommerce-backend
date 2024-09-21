export enum UserRole {
    USER = "USER",
    ADMIN = "ADMIN",
}

export interface IUser {
    id?: string;
    name: string;
    email: string;
    password: string;
    role: UserRole;
}