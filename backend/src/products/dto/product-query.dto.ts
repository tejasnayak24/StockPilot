import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ProductQueryDto {
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

  @ApiProperty({ example: 'category-id-here', required: false })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ example: 'supplier-id-here', required: false })
  @IsString()
  @IsOptional()
  supplierId?: string;

  @ApiProperty({ example: true, required: false })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ example: false, required: false })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  lowStock?: boolean;
}
