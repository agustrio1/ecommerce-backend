import { prisma } from "../../../config/database";
import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import { EMAIL_ADMIN, JWT_SECRET, CLIENT_URL } from "../../../config/env";
import { transporter } from "../../../config/email";
import { createHash } from "crypto";

export class AuthService {
  /**
   * Hashes a plain password
   * @param password
   * @returns hashed password
   */
  private async hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  /**
   * Verifies a password against a hashed password
   * @param hashedPassword
   * @param plainPassword
   * @returns boolean indicating if passwords match
   */
  private async verifyPassword(
    hashedPassword: string,
    plainPassword: string
  ): Promise<boolean> {
    return argon2.verify(hashedPassword, plainPassword);
  }

  /**
   * Generates a JWT token
   * @param email
   * @param role
   * @returns JWT token string
   */
  private generateJwtToken(email: string, role: string): string {
    return jwt.sign({ email, role }, JWT_SECRET as string, { expiresIn: "1h" });
  }

  /**
   * Generates a random 8-digit reset token
   * @returns 8-digit token as string
   */
  private generateResetToken(): string {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  }

  /**
   * Hashes a reset token using sha256
   * @param token
   * @returns hashed token string
   */
  private async hashResetToken(token: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = createHash("sha256");
      hash.update(token);
      resolve(hash.digest("hex"));
    });
  }

  /**
   * Sends a password reset email to the user
   * @param email
   * @param resetURL
   */
  private async sendResetPasswordEmail(
    email: string,
    resetURL: string
  ): Promise<void> {
    const mailOptions = {
      from: `"Support Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request",
      text: `You requested a password reset. Please use the following link to reset your password: ${resetURL}`,
      html: `<p>You requested a password reset.</p>
             <p>Please use the following link to reset your password:</p>
             <a href="${resetURL}">${resetURL}</a>`,
    };

    await transporter.sendMail(mailOptions);
  }

  /**
   * Registers a new user
   * @param name
   * @param email
   * @param password
   * @param role
   * @returns created user
   */
  async register(
    name: string,
    email: string,
    password: string,
    role: string
  ): Promise<any> {
    try {
      const hashedPassword = await this.hashPassword(password);
      const userRole = EMAIL_ADMIN === email ? "ADMIN" : "USER";

      const userExit = await prisma.user.findUnique({ where: { email } });
      if (userExit) throw new Error("User already exists");

      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword, role: userRole },
      });

      return user;
    } catch (error: any) {
      throw new Error(error);
    }
  }

  /**
   * Logs in a user
   * @param email
   * @param password
   * @returns JWT token
   */
  async login(email: string, password: string): Promise<string> {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error("Invalid email or password");

      const passwordMatch = await this.verifyPassword(user.password, password);
      if (!passwordMatch) throw new Error("Invalid email or password");

      return this.generateJwtToken(user.email, user.role);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Initiates the forgot password process by generating a reset token and sending an email
   * @param email
   * @returns message
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) throw new Error("Invalid email");

      const resetToken = this.generateResetToken();
      const hashedResetToken = await this.hashResetToken(resetToken);
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); 
      await prisma.user.update({
        where: { email },
        data: { resetToken: hashedResetToken, resetTokenExpiry },
      });

      const resetURL = `${CLIENT_URL}/reset-password?token=${resetToken}&email=${email}`;
      await this.sendResetPasswordEmail(email, resetURL);

      return { message: "Password reset email sent" };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Resets the user's password
   * @param token
   * @param email
   * @param newPassword
   * @returns message
   */
  async resetPassword(
    token: string,
    email: string,
    newPassword: string
  ): Promise<{ message: string }> {
    try {
      const hashedToken = await this.hashResetToken(token);
      const user = await prisma.user.findFirst({
        where: {
          email,
          resetToken: hashedToken,
          resetTokenExpiry: { gte: new Date() },
        },
      });

      if (!user) throw new Error("Invalid or expired reset token");

      const hashedPassword = await this.hashPassword(newPassword);

      await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      return { message: "Password has been reset successfully" };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logs out a user by clearing the JWT cookie
   * @param res Express Response object
   * @returns message
   */
  async logout(res: any): Promise<{ message: string }> {
    try {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return { message: "Logged out successfully" };
    } catch (error) {
      throw error;
    }
  }
}

