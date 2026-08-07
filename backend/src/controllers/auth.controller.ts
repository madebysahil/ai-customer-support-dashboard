import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { userRepository } from '../repositories/user.repository';
import { authService } from '../services/auth.service';
import { env } from '../config/env';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const user = await userRepository.findByEmail(email);

      if (!user) {
        return res.status(401).json({ status: 401, detail: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ status: 401, detail: 'Invalid credentials' });
      }

      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      const { accessToken, refreshToken } = await authService.generateTokens(user.id, user.role, ipAddress, userAgent);

      // Set HttpOnly secure cookie for refresh token
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName },
        accessToken,
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ status: 401, detail: 'Missing refresh token' });
      }

      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      const tokens = await authService.refreshTokens(refreshToken, ipAddress, userAgent);

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        accessToken: tokens.accessToken,
      });
    } catch (error) {
      res.clearCookie('refreshToken');
      res.status(401).json({ status: 401, detail: 'Invalid refresh token' });
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user?.sid) {
        await authService.logout(req.user.sid);
      }
      res.clearCookie('refreshToken');
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
