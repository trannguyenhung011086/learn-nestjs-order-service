import { Controller, Inject } from '@nestjs/common';
import {
  ClientProxy,
  EventPattern,
  MessagePattern,
} from '@nestjs/microservices';
import { AppService } from './app.service';
import { CancelOrderDto } from './dtos/cancelOrder.dto';
import { CreateOrderDto } from './dtos/createOrder.dto';
import { GetOrderDto } from './dtos/getOrder.dto';
import { UpdateOrderDto } from './dtos/updateOrder.dto';
import { Order } from './interfaces/order.interface';
import { UtilsService } from './utils/utils.service';

@Controller()
export class AppController {
  constructor(
    private appService: AppService,
    @Inject('PAYMENT_SERVICE')
    private readonly paymentServiceClient: ClientProxy,
    private readonly utilsService: UtilsService,
  ) {}

  // async onApplicationBootstrap() {
  //   await this.paymentServiceClient.connect();
  // }

  @EventPattern('order_updated')
  async handleOrderPaymentStatus(order: UpdateOrderDto) {
    const { paymentId, orderId, hash } = order;
    const isValid = this.utilsService.verifySignature(
      hash,
      { orderId, paymentId },
      process.env.SECRET_SIG || '1234',
    );
    if (!isValid) throw new Error('Invalid signature!');

    await this.appService.updateOrderStatus(order);
  }

  @MessagePattern({ cmd: 'create_order' })
  async createOrder(orderInfo: CreateOrderDto): Promise<Order> {
    // create order in db
    const order = await this.appService.createOrder(orderInfo);

    // call Payment Service to process order
    if (order) {
      const hash = this.utilsService.generateSignature(
        { userId: order.userId, orderId: order._id },
        process.env.SECRET_SIG || '1234',
      );

      this.paymentServiceClient.emit<any>('order_created', {
        userId: order.userId,
        orderId: order._id,
        amount: order.amount,
        hash,
      });
    }

    return order;
  }

  @MessagePattern({ cmd: 'cancel_order' })
  async cancelOrder(orderInfo: CancelOrderDto): Promise<Order> {
    // update order in db
    const order = await this.appService.cancelOrder(orderInfo);

    // call Payment Service to process order
    if (order) {
      const hash = this.utilsService.generateSignature(
        { userId: order.userId, orderId: order._id },
        process.env.SECRET_SIG || '1234',
      );

      this.paymentServiceClient.emit<any>('order_cancelled', {
        userId: order.userId,
        orderId: order._id,
        refund: order.refund,
        hash,
      });
    }

    return order;
  }

  @MessagePattern({ cmd: 'get_order' })
  async getOrderById(input: GetOrderDto): Promise<Order> {
    return await this.appService.getOrder(input);
  }
}
