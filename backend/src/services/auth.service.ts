import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { userRepository } from '../repositories/user.repository';
import { sessionRepository } from '../repositories/session.repository';

export class AuthService {
  async generateTokens(userId: string, role: string, ipAddress?: string, userAgent?: string) {
    // Generate raw refresh token
    const rawRefreshToken = crypto.randomUUID() + crypto.randomUUID();
    
    // Hash refresh token for DB storage
    const refreshTokenHash = await bcrypt.hash(rawRefreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create session
    const session = await sessionRepository.create({
      userId,
      refreshTokenHash,
      expiresAt,
      ipAddress,
      userAgent,
    });

    // Create JWT with minimal payload (sub, role, sid)
    const accessToken = jwt.sign(
      { sub: userId, role, sid: session.id },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    // Create JWT wrapper for refresh token containing sid (to look up easily)
    const refreshToken = jwt.sign(
      { sid: session.id, raw: rawRefreshToken },
      env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshTokenJwt: string, ipAddress?: string, userAgent?: string) {
    try {
      const payload = jwt.verify(refreshTokenJwt, env.JWT_REFRESH_SECRET) as { sid: string, raw: string };
      const session = await sessionRepository.findById(payload.sid);

      if (!session || session.isRevoked || session.expiresAt < new Date()) {
        throw new Error('Invalid or expired refresh token');
      }

      // Verify the raw token matches the hash
      const isValid = await bcrypt.compare(payload.raw, session.refreshTokenHash);
      if (!isValid) {
         throw new Error('Invalid refresh token');
      }

      const user = await userRepository.findById(session.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Revoke old session and issue new tokens (Refresh Token Rotation)
      await sessionRepository.revoke(session.id);

      return this.generateTokens(user.id, user.role, ipAddress, userAgent);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async logout(sessionId: string) {
    await sessionRepository.revoke(sessionId);
  }
}

export const authService = new AuthService();
