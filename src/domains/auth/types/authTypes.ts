enum Roles {
    USER = "USER",
    ADMIN = "ADMIN"
}

export class AuthTypes {
    name: string;
    email: string;
    password: string;
    role: Roles;

    constructor(name: string, email: string, password: string, role: string) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role as Roles;
    }

    getLoginData() {
        return {
            email: this.email,
            password: this.password
        }
    }

    getRegisterData() {
        return {
            name: this.name,
            email: this.email,
            password: this.password,
            role: this.role
        }
    }

    getForgotPasswordData() {
        return {
            email: this.email
        }
    }

    getResetPasswordData() {
        return {
            password: this.password
        }
    }

    getChangePasswordData() {
        return {
            oldPassword: this.password,
            newPassword: this.password
        }
    }
    
}