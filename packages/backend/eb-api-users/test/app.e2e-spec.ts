import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User, UserSchema } from '../src/users/users.entity';
import { UsersService } from '../src/users/users.service';
import { UsersResolver } from '../src/users/users.resolver';

let mongod: MongoMemoryServer;
let app: INestApplication;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  const moduleBuilder = Test.createTestingModule({
    imports: [
      MongooseModule.forRoot(uri),
      MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      GraphQLModule.forRoot<ApolloFederationDriverConfig>({
        driver: ApolloFederationDriver,
        autoSchemaFile: { federation: 2, path: 'src/schema.gql' },
        context: ({ req }: { req: any }) => ({ req }),
      }),
    ],
    providers: [
      UsersService,
      UsersResolver,
      {
        provide: JwtService,
        useValue: { sign: jest.fn(() => 'token') },
      },
    ],
  });
  const moduleRef = await moduleBuilder.compile();

  app = moduleRef.createNestApplication();
  await app.init();
});

afterAll(async () => {
  if (app) await app.close();
  if (mongod) await mongod.stop();
});

it('/graphql register mutation', async () => {
  const mutation = `mutation { register(input:{email:\"a@b.com\",name:\"A\",password:\"p\"}){accessToken user{email}}}`;
  const res = await request(app.getHttpServer()).post('/graphql').send({ query: mutation }).expect(200);
  expect(res.body.data.register.user.email).toBe('a@b.com');
});
