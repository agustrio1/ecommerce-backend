import { Request, Response } from "express";
import { UserService } from "../services/userService";
import { UserRole } from "../types/userType";
import { User } from "@prisma/client";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();

    this.getUsers = this.getUsers.bind(this);
    this.getUser = this.getUser.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
    this.getUserStats = this.getUserStats.bind(this);
    this.updateEmailNotificationPreference = this.updateEmailNotificationPreference.bind(this);
    console.log("[UserController] UserService initialized:", this.userService);
  }

  /**
   * Mendapatkan semua pengguna
   */
  public async getUsers(req: Request, res: Response) {
    try {
      const users = await this.userService.getAllUsers();
      res.status(200).json({ users });
    } catch (error: any) {
      return res.status(500).json({ error: "Gagal mengambil pengguna" });
    }
  }

  /**
   * Mendapatkan satu pengguna berdasarkan ID
   * @param id
   */
  public async getUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await this.userService.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "Pengguna tidak ditemukan" });
      }
      res.status(200).json({ user });
    } catch (error: any) {
      return res.status(500).json({ error: "Gagal mengambil pengguna" });
    }
  }

  /**
   * Get user statistics
   */
  public async getUserStats(req: Request, res: Response) {
    try {
      const stats = await this.userService.getUserStats();
      res.status(200).json(stats);
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to retrieve user statistics" });
    }
  }

  /**
   * Memperbarui preferensi notifikasi email pengguna
   * @param req - Request yang berisi ID pengguna dan status notifikasi email
   * @param res - Response yang akan dikirimkan setelah proses selesai
   */

  public async updateEmailNotificationPreference(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { isEnabled } = req.body;

      if (typeof isEnabled !== "boolean") {
        return res.status(400).json({
          error: "isEnabled must be a boolean value",
        });
      }

      const user = await this.userService.updateEmailNotificationPreference(id, isEnabled);

      return res.status(200).json({
        success: true,
        message: `Email notifications ${isEnabled ? "enabled" : "disabled"} successfully`,
        user,
      });
    } catch (error: any) {
      console.error("[updateEmailNotificationPreference] Error:", error);
      return res.status(500).json({
        error: "Failed to update email notification preference",
        details: error.message,
      });
    }
  }
  /**
   * Memperbarui data pengguna
   * @param id
   * @param data
   * @param role
   */
  public async updateUser(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { name, email, password, role } = req.body;

        const data: Partial<User> = { name, email };
        if (password) data.password = password;
        if (role) data.role = role;

        const user = await this.userService.updateUser(id, data, role);
        res.status(200).json({ user });
    } catch (error: any) {
        if (error.message === "User not found") {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: "Gagal memperbarui pengguna" });
    }
}


  /**
   * Menghapus pengguna
   * @param id
   */
  public async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await this.userService.deleteUser(id);
      res.status(200).json({ user });
    } catch (error: any) {
      if (error.message === "User not found") {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: "Gagal menghapus pengguna" });
    }
  }
}
