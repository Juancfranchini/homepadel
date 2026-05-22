// Módulo de gastos operativos — para el backoffice de gestión financiera

import { Module } from '@nestjs/common';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';

@Module({ controllers: [ExpensesController], providers: [ExpensesService] })
export class ExpensesModule {}
