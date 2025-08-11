import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtUser } from '../types/jwt-user.type';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtUser => {
    const req = ctx.switchToHttp().getRequest<Request>();
    // Aqui sabemos (pela JwtStrategy) que req.user existe e segue JwtUser
    return req.user as JwtUser;
  },
);
