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
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.signUp(createAuthDto);
  }

  @Post('signIn')
  signIn(@Body() singInDTO: SingInDTO) {
    return this.authService.signIn(singInDTO);
  }

  @Post('refreshToken')
  refreshToken(@Body() token: any) {
    return this.authService.refreshToken(token.refreshToken);
  }

  @Get('me')
  @UseGuards(AuthenticationGuard)
  me(@Req() { user }) {
    return user;
  }

  @Get('getLog/getAll')
  @Roles(Role.admin, Role.employee)
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  getLog(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Req() { user },
  ) {
    return this.authService.getLog(page, pageSize, user);
  }

  @Get('getSession/getAll')
  @Roles(Role.admin, Role.employee)
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  getSession(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Req() { user },
  ) {
    return this.authService.getSession(page, pageSize, user);
  }

  @Patch('account/logoutAllDevices')
  @Roles(Role.admin, Role.employee)
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  logoutAllDevices(@Req() { user }) {
    return this.authService.logoutAllDevices(user);
  }

  @Delete('account/logoutDevice/:sessionToken')
  @Roles(Role.admin, Role.employee)
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  logoutDevice(@Param('sessionToken') sessionToken: string) {
    return this.authService.logoutDevice(sessionToken);
  }

  @Delete('logout')
  @Roles(Role.admin, Role.employee)
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  logout(@Req() { session }) {
    return this.authService.logout(session);
  }

  @Patch('changePassword')
  @UseGuards(AuthenticationGuard)
  changePassword(
    @Body() changePasswordDTO: ChangePasswordDTO,
    @Req() { user },
  ) {
    return this.authService.changePassword(changePasswordDTO, user);
  }

  @Patch('updateProfile')
  @UseGuards(AuthenticationGuard)
  updateProfile(@Body() updateProfileDTO: UpdateProfileDTO, @Req() { user }) {
    return this.authService.updateProfile(updateProfileDTO, user);
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
  @Roles(Role.admin, Role.employee)
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  onlyAdmin() {
    return 'You are admin or principal.';
  }
}
