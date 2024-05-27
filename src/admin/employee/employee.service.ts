import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ResponseCreateOrUpdateDTO } from 'src/global/dto/response.create.update.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateEmployeeDTO } from './dto/create-employee.dto';
import { Role } from 'src/global/enum/role.enum';
import { UpdateEmployeeDTO } from './dto/update-employee.dto';

@Injectable()
export class EmployeeService {
  constructor(private readonly prisma: PrismaService) {}
  async create(
    createEmployeeDTO: CreateEmployeeDTO,
  ): Promise<ResponseCreateOrUpdateDTO> {
    try {
      //hash password
      const hashedPassword = await bcrypt.hash(createEmployeeDTO.password, 10);
      //apply hash password
      const savedUser = {
        ...createEmployeeDTO,
        password: hashedPassword,
        roleId: Role.employee,
      };
      const newUser = await this.prisma.user.create({
        data: savedUser,
      });
      //remove field password
      newUser.password = undefined;
      //response back
      const response: ResponseCreateOrUpdateDTO = {
        data: newUser,
        message: 'Created successfully',
        statusCode: HttpStatus.CREATED,
      };
      return response;
    } catch (error) {
      //check if duplicate
      if (error.code === 'P2002')
        throw new ConflictException('Email already exists');
      throw error;
    }
  }

  async findAll(
    page: number = 1,
    pageSize: number = 10,
    key: string = '',
  ): Promise<any> {
    try {
      // Calculate the offset for pagination
      const skip = (page - 1) * pageSize;

      // Build the search criteria conditionally
      const where: any = {
        roleId: Role.employee,
      };

      if (key) {
        where.OR = [
          { name: { contains: key, mode: 'insensitive' } },
          { email: { contains: key, mode: 'insensitive' } },
        ];
      }

      // Get the total count of users matching the criteria
      const totalCount = await this.prisma.user.count({ where });

      // Calculate total pages
      const totalPages = Math.ceil(totalCount / pageSize);

      // Get the users with pagination and search criteria
      const data = await this.prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          avatar: true,
          gender: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: +pageSize,
      });

      // Return the response with pagination details
      return {
        data,
        totalCount: +totalCount,
        totalPages: +totalPages,
        currentPage: +page,
        pageSize: +pageSize,
      };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number): Promise<any> {
    try {
      // find user by id
      const user = await this.prisma.user.findUnique({
        where: { id, roleId: Role.employee },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          avatar: true,
          gender: true,
          createdAt: true,
          updatedAt: true,
          role: true,
        },
      });
      // validate if user not found
      if (!user)
        throw new NotFoundException(`Employee with id: ${id} not found`);
      // check account is valid
      if (!user.status) return { message: 'Account was ban!' };
      // response back
      return user;
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: number,
    updateEmployeeDTO: UpdateEmployeeDTO,
  ): Promise<ResponseCreateOrUpdateDTO> {
    try {
      //hash password
      const hashedPassword = await bcrypt.hash(updateEmployeeDTO.password, 10);
      // find user by id
      const user = await this.findOne(id);
      // start update
      const updateUser = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: { ...updateEmployeeDTO, password: hashedPassword },
      });
      delete updateUser.password;
      //response back
      return {
        data: updateUser,
        message: 'Updated successfully',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      //check if duplicate
      if (error.code === 'P2002')
        throw new ConflictException('Email already exists');
      throw error;
    }
  }

  async remove(id: number): Promise<any> {
    try {
      // find user by id
      const user = await this.findOne(id);
      // validation
      if (user.email === process.env.SUPER_ADMIN_EMAIL)
        throw new BadRequestException('Can not remove Super admin account');
      // start update
      await this.prisma.user.delete({
        where: {
          id: user.id,
        },
      });
      //response back
      return {
        message: 'Deleted successfully',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw error;
    }
  }

  async toggleActive(id: number, me: any): Promise<any> {
    try {
      // check is valid id
      const user = await this.findOne(id);
      // validation
      if (me.id === id)
        throw new BadRequestException('Can not ban own account');
      if (user.email === process.env.SUPER_ADMIN_EMAIL)
        throw new BadRequestException('Can not ban Super admin account');
      let newStatus: boolean;
      user.status ? (newStatus = false) : (newStatus = true);
      await this.prisma.user.update({
        where: { id },
        data: { status: newStatus },
      });
      return {
        message: 'Updated success',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw error;
    }
  }
}
