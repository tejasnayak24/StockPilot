import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { TransactionType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class AdjustStockDto {
  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({ example: 10, description: 'Quantity delta or target value' })
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ example: 'Stock take adjustment', required: false })
  @IsString()
  @IsOptional()
  remarks?: string;

  @ApiProperty({ example: false, required: false, description: 'If true, quantity overrides current stock directly (only valid for ADJUSTMENT)' })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  isOverride?: boolean = false;
}
