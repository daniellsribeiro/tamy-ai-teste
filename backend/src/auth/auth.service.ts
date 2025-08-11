import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.users.create(dto.name, dto.email, dto.password);
    const accessToken = this.signToken(user.id, user.email);
    return {
      accessToken,
      user: { id: user.id, name: user.name, email: user.email },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const ok = await this.users.validatePassword(user, dto.password);
    if (!ok) throw new UnauthorizedException('Credenciais inválidas');

    const accessToken = this.signToken(user.id, user.email);
    return {
      accessToken,
      user: { id: user.id, name: user.name, email: user.email },
    };
  }

  private signToken(sub: number, email: string) {
    return this.jwt.sign(
      { sub, email },
      {
        secret: process.env.JWT_SECRET || 'supersecret_dev_key',
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
      },
    );
  }
}
