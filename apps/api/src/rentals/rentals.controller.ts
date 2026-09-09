import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { RentalsService } from './rentals.service';

@Controller('rentals')
export class RentalsController {
  constructor(private rentals: RentalsService) {}
  @Post() create(@Body() body: any, @Req() req: any) { return this.rentals.create(body, req.user?.id); }
  @Get('me') @UseGuards(JwtAuthGuard) mine(@Req() req: any) { return this.rentals.mine(req.user.id); }
  @Get() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN', 'COACH') list() { return this.rentals.list(); }
  @Patch(':id') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN', 'COACH') update(@Param('id') id: string, @Body() body: any) { return this.rentals.update(id, body); }
}
