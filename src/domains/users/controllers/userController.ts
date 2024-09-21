import { Request, Response } from "express";
import { UserService } from "../services/userService";
import { UserRole } from "../types/userType";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();

    this.getUsers = this.getUsers.bind(this);
    this.getUser = this.getUser.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
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
   * Memperbarui data pengguna
   * @param id
   * @param data
   * @param role
   */
  public async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { data, role } = req.body;

      if (!data) {
        return res
          .status(400)
          .json({ error: "Tidak ada data yang diberikan untuk diperbarui" });
      }

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
