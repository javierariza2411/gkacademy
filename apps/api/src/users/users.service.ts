import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import * as bcrypt from 'bcryptjs';
@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private model: Model<UserDocument>) {}
  findByEmail(email: string) { return this.model.findOne({ email: email.toLowerCase() }).exec(); }
  findById(id: string) { return this.model.findById(id).exec(); }
  async list() { return this.model.find().select('-passwordHash').sort({ createdAt: -1 }).lean(); }
  async setActive(id: string, active: boolean) {
    const user = await this.model.findByIdAndUpdate(id, { active }, { new: true }).select('-passwordHash');
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }
  create(data: Partial<User>) { return this.model.create(data); }
  async createManaged(data: { name: string; email: string; phone?: string; role: string; password: string }) {
    if (!['COACH', 'STUDENT'].includes(data.role)) throw new BadRequestException('Solo se pueden crear profesores o estudiantes desde este formulario');
    const existing = await this.findByEmail(data.email);
    if (existing) throw new Error('El correo ya está registrado');
    return this.model.create({ name: data.name, email: data.email.toLowerCase(), phone: data.phone || '', role: data.role, passwordHash: await bcrypt.hash(data.password, 12), active: true });
  }
  countStudents() { return this.model.countDocuments({ role: 'STUDENT', active: true }); }
}
