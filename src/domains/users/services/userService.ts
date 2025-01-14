import { prisma } from "../../../config/database";
import * as argon2 from "argon2";
import { UserRole } from "../types/userType";
import { User } from "@prisma/client"; 

export class UserService {
  /**
   * Hashes a plain password
   * @param password
   * @returns hashed password
   */
  private async hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  /**
   * Get All Users
   * @returns Users
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const users = await prisma.user.findMany();
      return users;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  /**
   * Get Single User
   * @param id
   */
  async getUser(id: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      return user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  /**
   * Get User Statistics
   * @returns User count
   */
  async getUserStats(): Promise<{ totalUsers: number }> {
    try {
      const totalUsers = await prisma.user.count();
      return { totalUsers };
    } catch (error: any) {
      throw new Error(`Failed to get user statistics: ${error.message}`);
    }
  }

  /**
   * Update Email Notification Preference
   * @param userId - User ID
   * @param isEnabled - Boolean to enable or disable email notifications
   */
  async updateEmailNotificationPreference(userId: string, isEnabled: boolean) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          isEmailNotificationEnabled: isEnabled,
        },
      });

      return user;
    } catch (error: any) {
      throw new Error(`Failed to update email notification preference: ${error.message}`);
    }
  }

  /**
   * Update User
   * @param id
   * @param data
   * @param currentUserRole
   */
  async updateUser(id: string, data: Partial<User>, currentUserRole: UserRole) {
    console.log("Data yang diterima backend:", data);
  
    // Check if data is empty
    if (Object.keys(data).length === 0) {
      throw new Error("Tidak ada data yang diberikan untuk diperbarui");
    }
  
    // Find the user by ID
    const checkUser = await prisma.user.findUnique({ where: { id } });
    if (!checkUser) {
      throw new Error("User not found");
    }
  
    if (data.role && currentUserRole !== UserRole.ADMIN) {
      throw new Error("Only admins can update user roles");
    }
  
    if (data.password) {
      const hashedPassword = await this.hashPassword(data.password);
      data.password = hashedPassword;
    }
  
    const updatedUser = await prisma.user.update({
      where: { id },
      data,
    });
  
    return updatedUser;
  }

  /**
   * Delete User
   * @param id
   */
  async deleteUser(id: string): Promise<User> {
    try {
      const deletedUser = await prisma.user.delete({ where: { id } });
      return deletedUser;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
