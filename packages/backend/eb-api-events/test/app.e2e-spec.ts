import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import { GqlAuthGuard } from '../src/auth/gql-auth.guard';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { EventsModule } from '../src/events/events.module';
import { MongoMemoryServer } from 'mongodb-memory-server';

/**
 * Simple mock guard that bypasses authentication for tests.
 */
class AllowAllGuard {
  canActivate(context: ExecutionContext) {
    return true;
  }
}

describe('Events App (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const moduleRef = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        GraphQLModule.forRoot<ApolloFederationDriverConfig>({
          driver: ApolloFederationDriver,
          autoSchemaFile: { federation: 2, path: 'src/schema.gql' },
          context: ({ req }: { req: any }) => ({ user: req.user }),
        }),
        EventsModule,
      ],
    })
      .overrideGuard(GqlAuthGuard)
      .useClass(AllowAllGuard)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
    if (mongod) await mongod.stop();
  });

  it('/graphql (POST) basic query', async () => {
    const query = `query { events { _id title } }`;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query })
      .expect(200);

    expect(res.body).toHaveProperty('data.events');
  });
});
