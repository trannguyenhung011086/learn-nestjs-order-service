import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateOrderDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsNotEmpty()
  @IsString()
  paymentId: string;

  @IsNotEmpty()
  @IsString()
  paymentStatus: 'confirmed' | 'declined';

  @IsNotEmpty()
  @IsString()
  hash: string;
}
