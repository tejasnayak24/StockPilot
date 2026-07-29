import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshDto {
  @ApiProperty({ example: 'refresh_token_string_here' })
  @IsNotEmpty()
  refreshToken: string;
}
