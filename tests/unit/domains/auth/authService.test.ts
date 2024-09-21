import { AuthService } from '../../../../src/domains/auth/services/authService';
import { prisma } from '../../../../src/config/database';
import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { EMAIL_ADMIN, JWT_SECRET } from '../../../../src/config/env';
import { transporter } from '../../../../src/config/email';
import { Request, Response } from 'express';

jest.mock('../../../../src/config/database', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

jest.mock('argon2');
jest.mock('jsonwebtoken');
jest.mock('../../../../src/config/email', () => ({
  transporter: {
    sendMail: jest.fn(),
  },
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'password123';
      const hashedPassword = await (authService as any).hashPassword(password);
      expect(argon2.hash).toHaveBeenCalledWith(password);
      expect(hashedPassword).toBeDefined();
    });
  });

  describe('verifyPassword', () => {
    it('should verify a password', async () => {
      const hashedPassword = 'hashedPassword';
      const plainPassword = 'password123';
      const isValid = await (authService as any).verifyPassword(hashedPassword, plainPassword);
      expect(argon2.verify).toHaveBeenCalledWith(hashedPassword, plainPassword);
      expect(isValid).toBeDefined();
    });
  });

  describe('generateJwtToken', () => {
    it('should generate a JWT token', async () => {
      const email = 'user@example.com';
      const role = 'USER';
      const token = await (authService as any).generateJwtToken(email, role);
      expect(jwt.sign).toHaveBeenCalledWith({ email, role }, JWT_SECRET as string, { expiresIn: '1h' });
      expect(token).toBeDefined();
    });
  });

  describe('generateResetToken', () => {
    it('should generate a reset token', async () => {
      const token = await (authService as any).generateResetToken();
      expect(token).toHaveLength(8);
    });
  });

  describe('hashResetToken', () => {
    it('should hash a reset token', async () => {
      const token = 'resetToken';
      const hashedToken = await (authService as any).hashResetToken(token);
      expect(hashedToken).toBeDefined();
    });
  });

  describe('sendResetPasswordEmail', () => {
    it('should send a password reset email', async () => {
      const email = 'user@example.com';
      const resetURL = 'https://example.com/reset-password';
      jest.spyOn((authService as any), 'sendResetPasswordEmail');
      await (authService as any).sendResetPasswordEmail(email, resetURL);
      expect((authService as any).sendResetPasswordEmail).toHaveBeenCalledWith(email, resetURL);
      expect(transporter.sendMail).toHaveBeenCalledWith({
        from: `"Support Team" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset Request',
        text: `You requested a password reset. Please use the following link to reset your password: ${resetURL}`,
        html: `<p>You requested a password reset.</p><p>Please use the following link to reset your password:</p><a href="${resetURL}">${resetURL}</a>`,
      });
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const name = 'John Doe';
      const email = 'user@example.com';
      const password = 'password123';
      const role = 'USER';
      const user = await authService.register(name, email, password, role);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { name, email, password: expect.any(String), role },
      });
      expect(user).toBeDefined();
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const email = 'user@example.com';
      const password = 'password123';
      const token = await authService.login(email, password);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email } });
      expect(argon2.verify).toHaveBeenCalledWith(expect.any(String), password);
      expect(token).toBeDefined();
    });
  });

  describe('forgotPassword', () => {
    it('should initiate the forgot password process', async () => {
      const email = 'user@example.com';
      const message = await authService.forgotPassword(email);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email } });
      expect((authService as any).generateResetToken).toHaveBeenCalledTimes(1);
      expect((authService as any).hashResetToken).toHaveBeenCalledTimes(1);
      expect(prisma.user.update).toHaveBeenCalledTimes(1);
      expect((authService as any).sendResetPasswordEmail).toHaveBeenCalledTimes(1);
      expect(message).toBeDefined();
    });
  });

  describe('resetPassword', () => {
    it('should reset a user\'s password', async () => {
      const token = 'resetToken';
      const email = 'user@example.com';
      const newPassword = 'newPassword123';
      const message = await authService.resetPassword(token, email, newPassword);
      expect((authService as any).hashResetToken).toHaveBeenCalledTimes(1);
      expect(prisma.user.findFirst).toHaveBeenCalledTimes(1);
      expect((authService as any).hashPassword).toHaveBeenCalledTimes(1);
      expect(prisma.user.update).toHaveBeenCalledTimes(1);
      expect(message).toBeDefined();
    });
  });

  describe('logout', () => {
    it('should logout a user', async () => {
      const res = { clearCookie: jest.fn() } as unknown as Response;
      const message = await authService.logout(res);
      expect(res.clearCookie).toHaveBeenCalledTimes(1);
      expect(message).toBeDefined();
    });
  });
});