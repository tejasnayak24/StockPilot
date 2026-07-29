import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { TransactionType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class TransactionQueryDto {
  @ApiProperty({ example: 1, required: false, default: 1 })
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ example: 10, required: false, default: 10 })
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({ example: 'iPhone', required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ enum: TransactionType, required: false })
  @IsEnum(TransactionType)
  @IsOptional()
  type?: TransactionType;

  @ApiProperty({ example: 'user-id-here', required: false })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({ example: '2026-07-01', required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ example: '2026-07-31', required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
