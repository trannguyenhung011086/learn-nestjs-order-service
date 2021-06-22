import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { ObjectID } from 'mongodb';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UtilsService } from './utils/utils.service';

describe('AppController', () => {
  let appController: AppController;
  let spyAppService: AppService;
  let spyUtilsService: UtilsService;
  let spyPaymentService: ClientProxy;

  beforeEach(async () => {
    const mockOrder = {
      userId: new ObjectID(),
      email: 'test@email.com',
      amount: 1000,
      status: 'created',
      createAt: new Date(),
    };
    const AppServiceProvider = {
      provide: AppService,
      useFactory: () => ({
        createOrder: jest.fn(() => mockOrder),
        cancelOrder: jest.fn(() => mockOrder),
        getOrder: jest.fn(() => mockOrder),
        updateOrderStatus: jest.fn(() => mockOrder),
      }),
    };
    const UtilsServiceProvider = {
      provide: UtilsService,
      useFactory: () => ({
        generateSignature: jest.fn(() => 'hash signature'),
        verifySignature: jest.fn(() => true),
      }),
    };
    const PaymentServiceProvider = {
      provide: 'PAYMENT_SERVICE',
      useFactory: () => ({
        emit: jest.fn(() => 'emit event'),
      }),
    };
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        AppServiceProvider,
        UtilsServiceProvider,
        PaymentServiceProvider,
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    spyAppService = app.get<AppService>(AppService);
    spyUtilsService = app.get<UtilsService>(UtilsService);
    spyPaymentService = app.get<ClientProxy>('PAYMENT_SERVICE');
  });

  describe('root', () => {
    it('should call createOrder', async () => {
      await appController.createOrder({
        userId: new ObjectID().toString(),
        email: 'test@email.com',
        amount: 1000,
      });
      expect(spyAppService.createOrder).toHaveBeenCalled();
      expect(spyUtilsService.generateSignature).toHaveBeenCalled();
      expect(spyPaymentService.emit).toHaveBeenCalled();
    });

    it('should call cancelOrder', async () => {
      await appController.cancelOrder({
        userId: new ObjectID().toString(),
        orderId: new ObjectID().toString(),
        reason: 'test',
      });
      expect(spyAppService.cancelOrder).toHaveBeenCalled();
      expect(spyUtilsService.generateSignature).toHaveBeenCalled();
      expect(spyPaymentService.emit).toHaveBeenCalled();
    });

    it('should call getOrderById', async () => {
      await appController.getOrderById({
        orderId: new ObjectID().toString(),
      });
      expect(spyAppService.getOrder).toHaveBeenCalled();
    });

    it('should call handleOrderPaymentStatus', async () => {
      await appController.handleOrderPaymentStatus({
        orderId: new ObjectID().toString(),
        paymentId: new ObjectID().toString(),
        paymentStatus: 'confirmed',
        hash: 'hash',
      });
      expect(spyUtilsService.verifySignature).toHaveBeenCalled();
      expect(spyAppService.updateOrderStatus).toHaveBeenCalled();
    });
  });
});
