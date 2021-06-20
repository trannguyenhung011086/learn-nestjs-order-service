import { IsNotEmpty, IsString } from 'class-validator';

export class GetOrderDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;
}
