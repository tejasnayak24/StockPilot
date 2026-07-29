import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { UpdateLimitsDto } from './dto/update-limits.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @ApiOperation({ summary: 'Get current inventory levels' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved inventory' })
  @Get()
  async findAll(@Query() query: InventoryQueryDto) {
    return this.inventoryService.findAll(query);
  }

  @ApiOperation({ summary: 'Get inventory level by Product ID' })
  @ApiResponse({ status: 200, description: 'Inventory record found' })
  @ApiResponse({ status: 404, description: 'Inventory not found' })
  @Get(':productId')
  async findByProductId(@Param('productId') productId: string) {
    return this.inventoryService.findByProductId(productId);
  }

  @ApiOperation({ summary: 'Update min/max stock limits (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'Limits successfully updated' })
  @Roles(Role.ADMIN, Role.MANAGER)
  @Patch(':productId/limits')
  async updateLimits(
    @Param('productId') productId: string,
    @Body() dto: UpdateLimitsDto,
  ) {
    return this.inventoryService.updateLimits(productId, dto);
  }

  @ApiOperation({ summary: 'Adjust stock level (In, Out, Override)' })
  @ApiResponse({ status: 200, description: 'Stock adjusted and transaction recorded' })
  @ApiResponse({ status: 400, description: 'Invalid adjustment amount or limits exceeded' })
  @Post(':productId/adjust')
  async adjustStock(
    @Param('productId') productId: string,
    @Body() dto: AdjustStockDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.inventoryService.adjustStock(productId, dto, userId);
  }
}
