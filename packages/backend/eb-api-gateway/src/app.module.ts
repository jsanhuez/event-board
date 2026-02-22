import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from "@nestjs/apollo";
import { IntrospectAndCompose } from "@apollo/gateway";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || "your-secret-key",
      signOptions: { expiresIn: "24h" },
    }),
    GraphQLModule.forRoot<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      gateway: {
        supergraphSdl: new IntrospectAndCompose({
          subgraphs: [
            {
              name: "events",
              url:
                process.env.EVENTS_SUBGRAPH_URL ||
                "http://eb-api-events:4001/graphql",
            },
            {
              name: "users",
              url:
                process.env.USERS_SUBGRAPH_URL ||
                "http://eb-api-users:4002/graphql",
            },
          ],
          pollIntervalInMs: 10_000,
        }),
      },
    }),
    AuthModule,
  ],
})
export class AppModule {}
