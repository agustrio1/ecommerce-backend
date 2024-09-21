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
   * Update User
   * @param id
   * @param data
   * @param currentUserRole
   */
  async updateUser(
    id: string,
    data: Partial<User>,
    currentUserRole: UserRole
  ): Promise<User> {
    // Validasi apakah pengguna yang ingin diupdate ada
    const checkUser = await prisma.user.findUnique({ where: { id } });

    if (!checkUser) {
      throw new Error("User not found");
    }

    if (data.password) {
      data.password = await this.hashPassword(data.password);
    }

    if (data.role && currentUserRole !== UserRole.ADMIN) {
      throw new Error("Only admins can update user roles");
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id },
        data,
      });
      return updatedUser;
    } catch (error: any) {
      throw new Error(error.message);
    }
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
