import { Module } from '@nestjs/common';
import { StockTransactionsService } from './transactions.service';
import { StockTransactionsController } from './transactions.controller';

@Module({
  controllers: [StockTransactionsController],
  providers: [StockTransactionsService],
  exports: [StockTransactionsService],
})
export class StockTransactionsModule {}
