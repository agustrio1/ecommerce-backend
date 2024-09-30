import { Request, Response } from "express";
import { AuthService } from "../services/authService";
import validate from "validate.js";
import { authValidator } from "../validator/authValidator";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Validates request data against the provided constraints
   * @param constraints Validation constraints
   * @param data Data to validate
   * @returns Validation errors or undefined if valid
   */
  private validateInput(constraints: any, data: any): any {
    return validate(data, constraints, { format: "flat" });
  }

  /**
   * Handles user registration
   */
  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password, role } = req.body;

      const errors = this.validateInput(authValidator.register, {
        name,
        email,
        password,
        role,
      });
      if (errors) {
        res.status(400).json({ errors });
        return;
      }

      const user = await this.authService.register(name, email, password, role);
      res.status(201).json({ user });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  /**
   * Handles user login
   */
  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      const errors = this.validateInput(authValidator.login, {
        email,
        password,
      });
      if (errors) {
        res.status(400).json({ errors });
        return;
      }

      const token = await this.authService.login(email, password);

      // Set token dalam cookie HTTP-only yang aman
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 1000 * 24 * 7,
      });

      res.status(200).json({ message: "Login successful", token });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  /**
   * Handles forgot password
   */
  public forgotPassword = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { email } = req.body;

      const errors = this.validateInput(authValidator.forgotPassword, {
        email,
      });
      if (errors) {
        res.status(400).json({ errors });
        return;
      }

      const result = await this.authService.forgotPassword(email);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  /**
   * Handles password reset
   */
  public resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, email, newPassword } = req.body;

      const passwordErrors = this.validateInput(authValidator.resetPassword, {
        password: newPassword,
      });

      const generalErrors = [];
      if (!token) generalErrors.push("Token is required");
      if (!email) generalErrors.push("Email is required");

      if (generalErrors.length > 0) {
        res.status(400).json({ errors: generalErrors });
        return;
      }

      let errors = passwordErrors;
      if (generalErrors.length > 0) {
        errors = (errors || []).concat(generalErrors);
      }

      if (errors) {
        res.status(400).json({ errors });
        return;
      }

      const result = await this.authService.resetPassword(
        token,
        email,
        newPassword
      );
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  /**
   * Handles user logout
   */
  public logout = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.authService.logout(res);
      res.status(200).json({ message: "Logged out successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}
