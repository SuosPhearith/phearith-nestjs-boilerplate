import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...args: number[]) => SetMetadata('roles', args);
