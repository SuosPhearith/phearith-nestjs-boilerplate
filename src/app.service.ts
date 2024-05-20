import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `
      <div style="text-align: center; margin-top: 100px; font-family: Arial, sans-serif; color: #333;">
        <h1 style="font-size: 36px;">🚀 API is running! 🚀</h1>
        <p style="font-size: 20px;">You're all set to start using the API.</p>
      </div>
    `;
  }
}
