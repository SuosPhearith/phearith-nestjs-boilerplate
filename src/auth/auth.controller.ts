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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { SingInDTO } from './dto/sign-in.dto';
import { AuthenticationGuard } from './guards/authentication/authentication.guard';
import { Roles } from './decorators/roles/roles.decorator';
import { AuthorizationGuard } from './guards/authorization/authorization.guard';
import { Role } from 'src/global/enum/role.enum';

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

  @Get('onlyAdmin')
  @Roles(Role.admin, Role.employee)
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  onlyAdmin() {
    return 'You are admin or principal.';
  }

  // change password
  // update profile
}
