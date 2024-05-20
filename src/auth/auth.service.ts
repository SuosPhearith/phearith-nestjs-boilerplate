import {
  ConflictException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { ResponseCreateOrUpdateDTO } from 'src/global/dto/response.create.update.dto';
import { SingInDTO } from './dto/sign-in.dto';
import { JwtService } from './jwt.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
  async signUp(
    createAuthDto: CreateAuthDto,
  ): Promise<ResponseCreateOrUpdateDTO> {
    try {
      //::==>>hash password
      const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);
      //::==>>apply hash password
      const savedUser = { ...createAuthDto, password: hashedPassword };
      const newUser = await this.prisma.user.create({
        data: savedUser,
      });
      //::==>>remove field password
      newUser.password = undefined;
      //::==>>response back
      const response: ResponseCreateOrUpdateDTO = {
        data: newUser,
        message: 'Created successfully',
        statusCode: HttpStatus.CREATED,
      };
      return response;
    } catch (error) {
      //::==>>check if duplicate
      if (error.code === 'P2002')
        throw new ConflictException('Email already exists');
      throw error;
    }
  }

  async signIn(singInDTO: SingInDTO): Promise<any> {
    try {
      //::==>> get data
      const { email, password } = singInDTO;
      //::==>> find user by email
      const user = await this.prisma.user.findFirst({
        where: {
          email,
        },
      });
      //::==>>check account is valid
      if (!user.status) throw new UnauthorizedException();
      // return user;
      if (!user) throw new UnauthorizedException('Invalid phone');
      //::==>> compare password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) throw new UnauthorizedException('Invalid password');
      //::==>> remove password
      user.password = undefined;
      //::==>> generate jwt
      const { accessToken, refreshToken } = await this.jwtService.sign({
        id: user.id,
      });
      //::==>> response back
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
      //::==>> Verify the refresh token
      const decodedToken: any = await this.jwtService.verifyRefreshToken(token);
      const userId = decodedToken.id;
      //::==>> Fetch the user from the database
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      //::==>> Check if the user exists
      if (!user) throw new UnauthorizedException('User not found');

      //::==>> Generate a new access token
      const { accessToken, refreshToken } = await this.jwtService.sign({
        id: user.id,
      });
      //::==>> response back
      return { accessToken, refreshToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
