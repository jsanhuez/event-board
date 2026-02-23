import { Test } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { EventsModule } from '../src/events/events.module';
import { EventsService } from '../src/events/events.service';
import { Event, EventSchema } from '../src/events/events.entity';

let mongod: MongoMemoryServer;
let service: EventsService;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  const moduleRef = await Test.createTestingModule({
    imports: [
      MongooseModule.forRoot(uri),
      MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
      EventsModule,
    ],
  }).compile();

  service = moduleRef.get(EventsService);
});

afterAll(async () => {
  if (mongod) await mongod.stop();
});

it('can create and retrieve an event', async () => {
  const input = {
    title: 'foo',
    description: 'desc',
    date: new Date().toISOString(),
    location: 'here',
    category: 'workshop',
    organizer: 'me',
  } as any;
  const created = await service.create(input, 'creator');
  const fetched = await service.findOne(created._id.toString());

  expect(fetched._id.toString()).toEqual(created._id.toString());
  expect(fetched.title).toEqual('foo');
});
