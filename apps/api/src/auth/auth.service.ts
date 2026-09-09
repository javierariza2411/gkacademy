import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './dto';
@Injectable()
export class AuthService {
  constructor(private users: UsersService, private jwt: JwtService) {}
  async register(dto: RegisterDto) {
    if (await this.users.findByEmail(dto.email)) throw new ConflictException('El correo ya está registrado');
    const user = await this.users.create({ name:dto.name, email:dto.email.toLowerCase(), phone:dto.phone || '', role:'STUDENT', passwordHash:await bcrypt.hash(dto.password, 12), active:true });
    return this.issue(user);
  }
  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email);
    if (!user || !user.active || !(await bcrypt.compare(dto.password, user.passwordHash))) throw new UnauthorizedException('Credenciales inválidas');
    return this.issue(user);
  }
  private issue(user: any) {
    const payload = { sub:String(user._id), email:user.email, role:user.role, name:user.name, phone:user.phone || '' };
    return { accessToken:this.jwt.sign(payload), user:{ id:String(user._id), name:user.name, email:user.email, role:user.role, phone:user.phone } };
  }
}
