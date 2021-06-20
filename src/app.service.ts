import { Inject, Injectable } from '@nestjs/common';
import { Db, ObjectID } from 'mongodb';
import { CancelOrderDto } from './dtos/cancelOrder.dto';
import { CreateOrderDto } from './dtos/createOrder.dto';
import { GetOrderDto } from './dtos/getOrder.dto';
import { UpdateOrderDto } from './dtos/updateOrder.dto';
import { Order } from './interfaces/order.interface';

@Injectable()
export class AppService {
  constructor(@Inject('DATABASE_CONNECTION') private db: Db) {}

  async createOrder(body: CreateOrderDto): Promise<Order> {
    const { userId, email, amount } = body;

    const orderId = (
      await this.db.collection<Partial<Order>>('orders').insertOne({
        userId: new ObjectID(userId),
        email,
        amount,
        status: 'created',
        createAt: new Date(),
      })
    ).insertedId;

    const res = await this.db
      .collection('orders')
      .findOne({ _id: new ObjectID(orderId) });

    console.log('New order created...', res);

    return res;
  }

  async cancelOrder(body: CancelOrderDto): Promise<Order> {
    const { userId, orderId, reason } = body;

    await this.db.collection<Order>('orders').updateOne(
      {
        _id: new ObjectID(orderId),
        userId: new ObjectID(userId),
        status: { $in: ['created', 'confirmed'] },
      },
      { $set: { status: 'cancelled', reason, refund: true } },
    );

    const res = await this.db
      .collection('orders')
      .findOne({ _id: new ObjectID(orderId) });

    console.log('Order cancelled...', res);

    return res;
  }

  async updateOrderStatus(body: UpdateOrderDto): Promise<Order> {
    const { orderId, paymentId, paymentStatus } = body;
    const orderStatusMapping = {
      confirmed: 'confirmed',
      declined: 'cancelled',
    };

    await this.db.collection('orders').updateOne(
      { _id: new ObjectID(orderId), status: 'created' },
      {
        $set: {
          status: orderStatusMapping[paymentStatus],
          paymentId: new ObjectID(paymentId),
          updatedAt: new Date(),
        },
      },
    );

    const res = await this.db
      .collection('orders')
      .findOne({ _id: new ObjectID(orderId) });

    console.log('Updated order...', res);

    return res;
  }

  async getOrder(input: GetOrderDto): Promise<Order> {
    const res = await this.db
      .collection('orders')
      .findOne({ _id: new ObjectID(input.orderId) });

    console.log('Get order...', res);

    return res;
  }
}
