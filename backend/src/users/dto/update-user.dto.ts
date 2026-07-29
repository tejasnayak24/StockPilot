import { IsBoolean, IsEmail, IsEnum, IsOptional, MinLength } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ example: 'updated@stockpilot.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'newpassword123', minLength: 6, required: false })
  @MinLength(6)
  @IsOptional()
  password?: string;

  @ApiProperty({ example: 'Updated Name', required: false })
  @IsOptional()
  name?: string;

  @ApiProperty({ enum: Role, required: false })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
