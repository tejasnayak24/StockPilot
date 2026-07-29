import { IsInt, IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLimitsDto {
  @ApiProperty({ example: 10 })
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(0)
  minimumStock: number;

  @ApiProperty({ example: 100, required: false })
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(0)
  @IsOptional()
  maximumStock?: number;
}
