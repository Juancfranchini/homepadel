// Módulo de promociones — ofertas con fecha de inicio y fin

import { Module } from '@nestjs/common';
import { PromotionsController } from './promotions.controller';
import { PromotionsService } from './promotions.service';

@Module({ controllers: [PromotionsController], providers: [PromotionsService] })
export class PromotionsModule {}
