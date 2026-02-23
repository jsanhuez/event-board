import { connect, disconnect, Model } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { UsersService } from '../src/users/users.service';
import { User, UserSchema } from '../src/users/users.entity';
import { JwtService } from '@nestjs/jwt';

let mongod: MongoMemoryServer;
let service: UsersService;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  // connect mongoose directly
  await connect(uri, { dbName: 'test' });
  // use mongoose singleton
  const mongoose = await import('mongoose');
  const model = mongoose.model<User>(User.name, UserSchema);
  const fakeJwt: JwtService = { sign: jest.fn(() => 'token') } as any;
  service = new UsersService(model as unknown as Model<User>, fakeJwt);
});

afterAll(async () => {
  if (mongod) await mongod.stop();
});

it('registers and logs in a user', async () => {
  const input = { email: 'test@example.com', name: 'Test', password: 'secret' } as any;
  const { accessToken, user } = await service.register(input);
  expect(accessToken).toBeDefined();
  const login = await service.login({ email: input.email, password: 'secret' } as any);
  expect(login.accessToken).toBeDefined();
  const found = await service.findByEmail(input.email);
  expect(found.email).toEqual(input.email);
});
