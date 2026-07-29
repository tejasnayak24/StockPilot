import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SupplierQueryDto } from './dto/supplier-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Suppliers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  @ApiOperation({ summary: 'Create a new supplier (Admin/Manager only)' })
  @ApiResponse({ status: 201, description: 'Supplier created' })
  @Roles(Role.ADMIN, Role.MANAGER)
  @Post()
  async create(@Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(dto);
  }

  @ApiOperation({ summary: 'Get all suppliers' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved supplier list' })
  @Get()
  async findAll(@Query() query: SupplierQueryDto) {
    return this.suppliersService.findAll(query);
  }

  @ApiOperation({ summary: 'Get a supplier by ID' })
  @ApiResponse({ status: 200, description: 'Supplier found' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a supplier (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'Supplier updated' })
  @Roles(Role.ADMIN, Role.MANAGER)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return this.suppliersService.update(id, dto);
  }

  @ApiOperation({ summary: 'Remove a supplier (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'Supplier deleted/deactivated' })
  @Roles(Role.ADMIN, Role.MANAGER)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.suppliersService.remove(id);
  }
}
