// Módulo de categorías de productos

import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

@Module({ controllers: [CategoriesController], providers: [CategoriesService] })
export class CategoriesModule {}
