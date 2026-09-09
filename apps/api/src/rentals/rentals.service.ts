import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Rental, RentalDocument } from './rental.schema';

@Injectable()
export class RentalsService {
  constructor(@InjectModel(Rental.name) private model: Model<RentalDocument>) {}
  create(data: any, userId?: string) { return this.model.create({ ...data, ...(userId ? { userId } : {}) }); }
  list() { return this.model.find().sort({ createdAt: -1 }).lean(); }
  async mine(userId: string, phone?: string) {
    if (phone) await this.model.updateMany({ phone, userId: { $exists: false } }, { $set: { userId } });
    return this.model.find({ userId }).sort({ createdAt: -1 }).lean();
  }
  async update(id: string, data: any) { const rental = await this.model.findByIdAndUpdate(id, data, { new: true }); if (!rental) throw new NotFoundException('Solicitud no encontrada'); return rental; }
  countPending() { return this.model.countDocuments({ status: 'PENDING' }); }
}
