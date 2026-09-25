import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { POS_PERMISSIONS } from '../common/permissions';
import { CashService } from './cash.service';
import { CashEntryDto, CloseCashSessionDto, OpenCashSessionDto } from './dto/cash.dto';

interface CashUser {
  id: string;
}

@ApiTags('Cash register')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions(POS_PERMISSIONS.CASH)
@Controller('cash')
export class CashController {
  constructor(private readonly cash: CashService) {}

  @Post('sessions')
  open(@Body() dto: OpenCashSessionDto, @CurrentUser() user: CashUser) {
    return this.cash.open(dto, user.id);
  }

  @Get('sessions/current')
  current(@Query('registerId') registerId?: string) {
    return this.cash.current(registerId);
  }

  @Get('sessions/history')
  history() {
    return this.cash.history();
  }

  @Get('sessions/:id/summary')
  summary(@Param('id') id: string) {
    return this.cash.summary(id);
  }

  @Post('movements')
  movement(@Body() dto: CashEntryDto, @CurrentUser() user: CashUser) {
    return this.cash.movement(dto, user.id);
  }

  @Post('sessions/:id/close')
  close(@Param('id') id: string, @Body() dto: CloseCashSessionDto, @CurrentUser() user: CashUser) {
    return this.cash.close(id, dto, user.id);
  }
}
