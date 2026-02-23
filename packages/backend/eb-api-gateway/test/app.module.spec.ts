import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

describe('Gateway AppModule', () => {
  it('should compile module without throwing', async () => {
    // prevent IntrospectAndCompose from performing network calls
    jest.mock('@apollo/gateway', () => ({
      IntrospectAndCompose: class {
        constructor() {}
      },
      RemoteGraphQLDataSource: class {
        constructor() {}
      },
    }));

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    expect(moduleRef).toBeDefined();
  });
});
