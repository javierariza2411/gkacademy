import { Body, Controller, Get, Headers, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private payments: PaymentsService) {}
  @Post('checkout/:planId') @UseGuards(JwtAuthGuard) checkout(@Req() req: any, @Param('planId') planId: string) { return this.payments.checkout(req.user.id, planId); }
  @Post('mock/:paymentId/approve') @UseGuards(JwtAuthGuard) mock(@Req() req: any, @Param('paymentId') id: string) { return this.payments.mockApprove(req.user.id, id); }
  @Post('wompi/webhook') webhook(@Body() body: any, @Headers('x-event-checksum') checksum?: string) { return this.payments.webhook(body, checksum); }
  @Get() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN') list() { return this.payments.list(); }
  @Post('cash') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN') cash(@Body() body: any) { return this.payments.recordCash(body); }
}
