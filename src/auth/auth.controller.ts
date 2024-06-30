import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Query,
  Patch,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { SingInDTO } from './dto/sign-in.dto';
import { AuthenticationGuard } from './guards/authentication/authentication.guard';
import { Roles } from './decorators/roles/roles.decorator';
import { AuthorizationGuard } from './guards/authorization/authorization.guard';
import { Role } from 'src/global/enum/role.enum';
import { ChangePasswordDTO } from './dto/change-password.dto';
import { UpdateProfileDTO } from './dto/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { File as MulterFile } from 'multer';
import { multerConfig } from 'src/config/multer.config';
import { FileImagePipe } from 'src/file/validation/file-image.pipe';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signUp')
  async create(@Body() createAuthDto: CreateAuthDto) {
    return await this.authService.signUp(createAuthDto);
  }

  @Post('signIn')
  async signIn(@Body() singInDTO: SingInDTO) {
    return await this.authService.signIn(singInDTO);
  }

  @Post('refreshToken')
  async refreshToken(@Body() token: any) {
    return await this.authService.refreshToken(token.refreshToken);
  }

  @Get('me')
  @UseGuards(AuthenticationGuard)
  me(@Req() { user }) {
    return user;
  }

  @Get('getSession/getAll')
  @UseGuards(AuthenticationGuard)
  async getSession(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Req() { user },
  ) {
    return await this.authService.getSession(page, pageSize, user);
  }

  @Patch('account/logoutAllDevices')
  @UseGuards(AuthenticationGuard)
  async logoutAllDevices(@Req() { user }) {
    return await this.authService.logoutAllDevices(user);
  }

  @Delete('deleteAccount')
  @UseGuards(AuthenticationGuard)
  async deleteAccount(@Req() { user }) {
    return await this.authService.deleteAccount(user);
  }

  @Delete('account/logoutDevice/:sessionToken')
  @UseGuards(AuthenticationGuard)
  async logoutDevice(@Param('sessionToken') sessionToken: string) {
    return await this.authService.logoutDevice(sessionToken);
  }

  @Delete('logout')
  @UseGuards(AuthenticationGuard)
  async logout(@Req() { session }) {
    return await this.authService.logout(session);
  }

  @Patch('changePassword')
  @UseGuards(AuthenticationGuard)
  async changePassword(
    @Body() changePasswordDTO: ChangePasswordDTO,
    @Req() { user },
  ) {
    return await this.authService.changePassword(changePasswordDTO, user);
  }

  @Patch('updateProfile')
  @UseGuards(AuthenticationGuard)
  async updateProfile(
    @Body() updateProfileDTO: UpdateProfileDTO,
    @Req() { user },
  ) {
    return await this.authService.updateProfile(updateProfileDTO, user);
  }

  @Post('uploadAvatar')
  @UseGuards(AuthenticationGuard)
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadAvatar(
    @UploadedFile(FileImagePipe) file: MulterFile,
    @Req() { user },
  ) {
    return this.authService.uploadAvatar(file, user);
  }

  @Get('onlyAdmin')
  @Roles(Role.admin)
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  onlyAdmin() {
    return 'You are admin!';
  }

  @Get('onlyUser')
  @Roles(Role.user)
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  onlyUser() {
    return 'You are user!';
  }

  @Get('bothAdminAndUser')
  @Roles(Role.admin, Role.user)
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  bothAdminAndUser() {
    return 'You are admin or user!';
  }
}
