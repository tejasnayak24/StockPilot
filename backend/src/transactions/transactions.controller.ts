import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StockTransactionsService } from './transactions.service';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('transactions')
export class StockTransactionsController {
  constructor(private transactionsService: StockTransactionsService) {}

  @ApiOperation({ summary: 'Get stock transaction log / audit history' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved transactions list' })
  @Get()
  async findAll(@Query() query: TransactionQueryDto) {
    return this.transactionsService.findAll(query);
  }

  @ApiOperation({ summary: 'Get details of a single stock transaction' })
  @ApiResponse({ status: 200, description: 'Transaction record found' })
  @ApiResponse({ status: 404, description: 'Transaction record not found' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }
}
