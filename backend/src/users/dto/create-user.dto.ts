import { IsEmail, IsEnum, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@stockpilot.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Jane Doe' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: Role, default: Role.STAFF, required: false })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
