import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUrl, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiProperty({ example: 'iPhone 15 Pro', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'IPHONE15PRO-128', required: false })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiProperty({ example: '190198066779', required: false })
  @IsString()
  @IsOptional()
  barcode?: string;

  @ApiProperty({ example: 'Apple iPhone 15 Pro 128GB Titanium', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 899.99, required: false })
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @IsPositive()
  @IsOptional()
  costPrice?: number;

  @ApiProperty({ example: 999.99, required: false })
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @IsPositive()
  @IsOptional()
  sellingPrice?: number;

  @ApiProperty({ example: 'https://example.com/iphone15pro.jpg', required: false })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ example: 'category-id-here', required: false })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ example: 'supplier-id-here', required: false })
  @IsString()
  @IsOptional()
  supplierId?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
