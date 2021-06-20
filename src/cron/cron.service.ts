import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Db } from 'mongodb';
import { Order } from 'src/interfaces/order.interface';

@Injectable()
export class CronService {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private db: Db,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async confirmOrderEveryMinute() {
    console.log('Every 30 seconds');

    await this.db
      .collection<Order>('orders')
      .updateMany(
        {
          status: 'confirmed',
          updatedAt: {
            $lte: new Date(new Date().getTime() - 30 * 1000),
          },
        },
        { $set: { status: 'delivered' } },
      )
      .then((res) => console.log('Orders delivered...', res.modifiedCount));
  }
}
