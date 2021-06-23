import { Test, TestingModule } from '@nestjs/testing';
import { Db } from 'mongodb';
import { CronService } from './cron.service';

describe('CronService', () => {
  let service: CronService;
  let connection: Db;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CronService,
        {
          provide: 'DATABASE_CONNECTION',
          useFactory: () => ({
            db: Db,
            collection: jest.fn().mockReturnThis(),
            updateMany: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
          }),
        },
      ],
    }).compile();

    service = module.get<CronService>(CronService);
    connection = module.get('DATABASE_CONNECTION');
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('should confirmOrderEveryMinute', async () => {
    await service.confirmOrderEveryMinute();
    expect(connection.collection('orders').updateMany).toHaveBeenCalled();
  });
});
