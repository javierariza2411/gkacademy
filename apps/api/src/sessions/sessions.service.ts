import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session, SessionDocument } from './session.schema';

@Injectable()
export class SessionsService {
  constructor(@InjectModel(Session.name) private model: Model<SessionDocument>) {}

  list() {
    return this.model.find().populate('studentId', 'name email').populate('coachId', 'name email').sort({ date: 1, time: 1 }).lean();
  }

  create(data: any) { return this.model.create(data); }

  async update(id: string, data: any) {
    const session = await this.model.findByIdAndUpdate(id, data, { new: true }).populate('studentId', 'name email').populate('coachId', 'name email');
    if (!session) throw new NotFoundException('Sesión no encontrada');
    return session;
  }

  countUpcoming() { return this.model.countDocuments({ status: 'SCHEDULED' }); }

  weekly() {
    const today = new Date();
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    start.setDate(today.getDate() - today.getDay() + 1);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    const from = start.toISOString().slice(0, 10);
    const to = end.toISOString().slice(0, 10);
    return this.model.find({ date: { $gte: from, $lt: to } }).populate('studentId', 'name email').populate('coachId', 'name email').sort({ date: 1, time: 1 }).lean();
  }
}
