import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUrl, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 15' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'IPHONE15-128', required: false })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiProperty({ example: '190198066778', required: false })
  @IsString()
  @IsOptional()
  barcode?: string;

  @ApiProperty({ example: 'Apple iPhone 15 128GB Black', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 699.99 })
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @IsPositive()
  costPrice: number;

  @ApiProperty({ example: 799.99 })
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @IsPositive()
  sellingPrice: number;

  @ApiProperty({ example: 'https://example.com/iphone15.jpg', required: false })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ example: 'category-id-here' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ example: 'supplier-id-here' })
  @IsString()
  @IsNotEmpty()
  supplierId: string;

  @ApiProperty({ example: 5, required: false, default: 10 })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(0)
  @IsOptional()
  minimumStock?: number = 10;

  @ApiProperty({ example: 100, required: false })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(0)
  @IsOptional()
  maximumStock?: number;
}
