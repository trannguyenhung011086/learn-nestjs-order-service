import { ObjectID } from 'mongodb';

export type Order = {
  _id: ObjectID;
  id: string;
  userId: ObjectID;
  email: string;
  amount: number;
  paymentId: ObjectID;
  status: 'created' | 'confirmed' | 'cancelled' | 'delivered';
  createAt: Date;
  updatedAt: Date;
  reason?: string;
  refund?: boolean;
};
