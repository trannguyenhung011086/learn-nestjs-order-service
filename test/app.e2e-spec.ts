import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let client: ClientProxy;
  let orderId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        ClientsModule.register([
          { name: 'GATEWAY_SERVICE', transport: Transport.TCP },
        ]),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.connectMicroservice({
      transport: Transport.TCP,
    });

    await app.startAllMicroservicesAsync();
    await app.init();

    client = app.get('GATEWAY_SERVICE');
    await client.connect();
  });

  afterAll(async () => {
    await app.close();
    client.close();
  });

  it('Create order', async () => {
    const order = await client
      .send(
        { cmd: 'create_order' },
        {
          userId: '60b5d7c0009fde4d8f168ba4',
          amount: 200000,
          email: 'test123@gmail.com',
        },
      )
      .toPromise();

    expect(order).not.toBeNull();
    orderId = order._id;
  });

  it('Get order', async () => {
    const order = await client
      .send({ cmd: 'get_order' }, { orderId })
      .toPromise();

    expect(order).not.toBeNull();
  });
});
