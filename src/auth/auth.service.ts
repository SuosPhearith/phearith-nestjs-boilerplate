import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { ResponseCreateOrUpdateDTO } from 'src/global/dto/response.create.update.dto';
import { SingInDTO } from './dto/sign-in.dto';
import { JwtService } from './jwt.service';
import * as UAParser from 'ua-parser-js';
import { User } from '@prisma/client';
import { ResponseDeleteDTO } from 'src/global/dto/response.delete.dto';
import { ChangePasswordDTO } from './dto/change-password.dto';
import { UpdateProfileDTO } from './dto/update-profile.dto';
import { FileUploadService } from 'src/file/file-upload.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private fileUplaodService: FileUploadService,
    private readonly fileUploadService: FileUploadService,
  ) {}
  async signUp(
    createAuthDto: CreateAuthDto,
  ): Promise<ResponseCreateOrUpdateDTO> {
    try {
      //hash password
      const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);
      //apply hash password
      const savedUser = { ...createAuthDto, password: hashedPassword };
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

  async signIn(singInDTO: SingInDTO): Promise<any> {
    try {
      // get data
      const { email, password } = singInDTO;
      // find user by email
      const user = await this.prisma.user.findFirst({
        where: {
          email,
        },
      });
      // return user;
      if (!user) throw new UnauthorizedException('Invalid email');
      //check account is valid
      if (!user.status) throw new UnauthorizedException();
      // compare password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) throw new UnauthorizedException('Invalid password');
      // remove password
      user.password = undefined;
      // store log
      const parser = new UAParser();
      parser.setUA(singInDTO.userAgent);
      const result = parser.getResult();
      const browser = result.browser.name;
      const device = `${result.os.name}-${result.os.version}`;
      // start store log
      await this.prisma.log.create({
        data: {
          userId: user.id,
          device,
          browser,
        },
      });
      // start create user session
      const { sessionToken } = await this.prisma.userSession.create({
        data: {
          userId: user.id,
          device,
          browser,
        },
      });
      // generate jwt
      const { accessToken, refreshToken } = await this.jwtService.sign({
        id: user.id,
        session: user.session,
        sessionToken,
      });
      // response back
      return {
        user,
        accessToken,
        refreshToken,
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(token: string): Promise<any> {
    try {
      // Verify the refresh token
      const decodedToken: any = await this.jwtService.verifyRefreshToken(token);
      const userId = decodedToken.id;
      // Fetch the user from the database
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      // Check if the user exists
      if (!user) throw new UnauthorizedException('User not found');

      // check session is valid
      if (!decodedToken.session || decodedToken.session !== user.session)
        throw new UnauthorizedException();

      // check session token is valid
      const isSessionToken = await this.prisma.userSession.findUnique({
        where: { sessionToken: decodedToken.sessionToken },
      });
      if (!isSessionToken) throw new UnauthorizedException();

      // Generate a new access token
      const { accessToken, refreshToken } = await this.jwtService.sign({
        id: user.id,
        session: decodedToken.session,
        sessionToken: decodedToken.sessionToken,
      });
      // response back
      return { accessToken, refreshToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getLog(
    page: number = 1,
    pageSize: number = 10,
    user: User,
  ): Promise<any> {
    try {
      // Calculate the offset for pagination
      const skip = (page - 1) * pageSize;

      // Build the search criteria conditionally
      const where: any = {
        userId: user.id,
      };

      // Get the total count of users matching the criteria
      const totalCount = await this.prisma.log.count({ where });

      // Calculate total pages
      const totalPages = Math.ceil(totalCount / pageSize);

      // Get the users with pagination and search criteria
      const data = await this.prisma.log.findMany({
        where,
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

  async getSession(
    page: number = 1,
    pageSize: number = 10,
    user: User,
  ): Promise<any> {
    try {
      // Calculate the offset for pagination
      const skip = (page - 1) * pageSize;

      // Build the search criteria conditionally
      const where: any = {
        userId: user.id,
      };

      // Get the total count of users matching the criteria
      const totalCount = await this.prisma.userSession.count({ where });

      // Calculate total pages
      const totalPages = Math.ceil(totalCount / pageSize);

      // Get the users with pagination and search criteria
      const data = await this.prisma.userSession.findMany({
        where,
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

  async logoutAllDevices(user: User): Promise<ResponseDeleteDTO> {
    try {
      // Check if user exists
      const existingUser = await this.prisma.user.findUnique({
        where: { id: user.id },
      });

      if (!existingUser) throw new NotFoundException();
      // start updata session
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          session: user.session + 1,
        },
      });
      // response back
      return {
        message: 'Logout successfully',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw error;
    }
  }

  async logoutDevice(sessionToken: string): Promise<ResponseDeleteDTO> {
    try {
      // Check if user exists
      const existingToken = await this.prisma.userSession.findUnique({
        where: { sessionToken: sessionToken },
      });

      if (!existingToken) throw new NotFoundException();
      // start updata session
      await this.prisma.userSession.delete({
        where: { sessionToken },
      });
      // response back
      return {
        message: 'Logout successfully',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw error;
    }
  }

  async logout(sessionToken: string): Promise<ResponseDeleteDTO> {
    try {
      // Check if user exists
      const existingToken = await this.prisma.userSession.findUnique({
        where: { sessionToken: sessionToken },
      });

      if (!existingToken) throw new NotFoundException();
      // start updata session
      await this.prisma.userSession.delete({
        where: { sessionToken },
      });
      // response back
      return {
        message: 'Logout successfully',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw error;
    }
  }

  async changePassword(
    changePassword: ChangePasswordDTO,
    user: User,
  ): Promise<ResponseDeleteDTO> {
    try {
      // check comfirm password is valid
      if (changePassword.newPassword !== changePassword.confirmPassword)
        throw new BadRequestException('Check you confirm password');
      // check is user is valid
      const oldUser = await this.prisma.user.findUnique({
        where: { id: user.id },
      });
      if (!oldUser) throw new UnauthorizedException();
      // compare password
      const passwordMatch = await bcrypt.compare(
        changePassword.currentPassword,
        oldUser.password,
      );
      if (!passwordMatch)
        throw new UnauthorizedException('Invalid current password');
      // hash password
      const hashedPassword = await bcrypt.hash(changePassword.newPassword, 10);
      // handle change password
      await this.prisma.user.update({
        where: { id: oldUser.id },
        data: {
          password: hashedPassword,
        },
      });
      // response back
      return {
        message: 'Changed password succesfully!',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(
    data: UpdateProfileDTO,
    user: User,
  ): Promise<ResponseDeleteDTO> {
    try {
      // check is user is valid
      const oldUser = await this.prisma.user.findUnique({
        where: { id: user.id },
      });
      if (!oldUser) throw new UnauthorizedException();
      // start update
      await this.prisma.user.update({
        where: {
          id: oldUser.id,
        },
        data: {
          name: data.name,
          email: data.email,
          gender: data.gender,
        },
      });
      // response back
      return {
        message: 'Updated succesfully!',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      //check if duplicate
      if (error.code === 'P2002')
        throw new ConflictException('Email already exists');
      throw error;
    }
  }

  async uploadAvatar(file: any, user: User): Promise<any> {
    try {
      // Use the FileUploadService here
      const result = this.fileUploadService.handleFileUpload(file);
      // check is user is valid
      const oldUser = await this.prisma.user.findUnique({
        where: { id: user.id },
      });
      if (!oldUser) throw new UnauthorizedException();
      // start update
      await this.prisma.user.update({
        where: {
          id: oldUser.id,
        },
        data: {
          avatar: result.path,
        },
      });
      // response back
      return {
        message: 'Updated succesfully!',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw error;
    }
  }
}
