import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CancelOrderDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsOptional()
  @IsString()
  reason: string;
}
