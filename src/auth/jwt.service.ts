import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtService {
  private readonly privateKey = process.env.JWT_SECRET_ACCESS_TOKEN;
  private readonly privateKeyRefreshToken =
    process.env.JWT_SECRET_REFRESH_TOKEN;
  private readonly accessTokenExpiration = '15m';
  private readonly refreshTokenExpiration = '15d';

  async sign(
    payload: any,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = jwt.sign(payload, this.privateKey, {
      expiresIn: this.accessTokenExpiration,
    });
    const refreshToken = jwt.sign(payload, this.privateKeyRefreshToken, {
      expiresIn: this.refreshTokenExpiration,
    });

    return { accessToken, refreshToken };
  }

  async verify(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this.privateKey, (err: any, decoded: any) => {
        if (err) {
          reject(new UnauthorizedException('Invalid token'));
        } else {
          resolve(decoded);
        }
      });
    });
  }

  async verifyRefreshToken(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        this.privateKeyRefreshToken,
        (err: any, decoded: any) => {
          if (err) {
            reject(new UnauthorizedException('Invalid token'));
          } else {
            resolve(decoded);
          }
        },
      );
    });
  }
}
