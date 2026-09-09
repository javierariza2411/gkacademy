import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { SessionsService } from './sessions.service';

@Controller('sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class SessionsController {
  constructor(private sessions: SessionsService) {}
  @Get() list() { return this.sessions.list(); }
  @Get('weekly') weekly() { return this.sessions.weekly(); }
  @Post() create(@Body() body: any) { return this.sessions.create(body); }
  @Patch(':id') update(@Param('id') id: string, @Body() body: any) { return this.sessions.update(id, body); }
}
