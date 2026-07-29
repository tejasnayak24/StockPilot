import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class InventoryQueryDto {
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

  @ApiProperty({ example: false, required: false })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  lowStock?: boolean;
}
