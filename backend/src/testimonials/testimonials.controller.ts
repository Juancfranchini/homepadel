import { Controller, Get, Post, Patch, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TestimonialsService } from './testimonials.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Testimonials')
@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Get()
  findAll() { return this.testimonialsService.findAll(); }

  @Get('admin/all')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN)
  findAllAdmin() { return this.testimonialsService.findAllAdmin(); }

  @Post()
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN)
  create(@Body() dto: any) { return this.testimonialsService.create(dto); }

  @Patch(':id')
  @Put(':id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: any) { return this.testimonialsService.update(id, dto); }

  @Delete(':id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN)
  remove(@Param('id') id: string) { return this.testimonialsService.remove(id); }
}
