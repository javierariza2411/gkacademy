import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsersService } from '../users/users.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { RentalsService } from '../rentals/rentals.service';
import { PaymentsService } from '../payments/payments.service';
import { SessionsService } from '../sessions/sessions.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class DashboardController {
  constructor(private users: UsersService, private subs: SubscriptionsService, private rentals: RentalsService, private payments: PaymentsService, private sessions: SessionsService) {}

  @Get('summary')
  async summary() {
    return {
      activeStudents: await this.users.countStudents(),
      activeSubscriptions: await this.subs.countActive(),
      pendingRentals: await this.rentals.countPending(),
      upcomingSessions: await this.sessions.countUpcoming(),
      revenue: await this.payments.revenue(),
      weeklyRevenue: await this.payments.weeklyRevenue(),
    };
  }

  @Get('weekly') weekly() { return this.sessions.weekly(); }
}
