import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSupplierDto {
  @ApiProperty({ example: 'Updated Acme Corp', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'newemail@acme.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '+1-555-9999', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: '456 Commerce Blvd, Business District', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
