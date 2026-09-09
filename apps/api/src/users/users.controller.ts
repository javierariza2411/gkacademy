import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsersService } from './users.service';
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class UsersController {
  constructor(private users: UsersService) {}
  @Get() list() { return this.users.list(); }
  @Post() create(@Body() body: { name: string; email: string; phone?: string; role: 'STUDENT' | 'COACH'; password: string }) { return this.users.createManaged(body); }
  @Patch(':id/status') setStatus(@Param('id') id: string, @Body() body: { active: boolean }) { return this.users.setActive(id, body.active); }
}
