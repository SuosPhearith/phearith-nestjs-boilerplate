import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from 'src/auth/jwt.service';

@Module({
  controllers: [EmployeeController],
  providers: [EmployeeService, PrismaService, JwtService],
})
export class EmployeeModule {}
