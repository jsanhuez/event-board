import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from "@nestjs/apollo";
import { MongooseModule } from "@nestjs/mongoose";
import { EventsModule } from "./events/events.module";

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI ||
        "mongodb://root:password@mongodb:27017/eb_events?authSource=admin",
    ),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: {
        federation: 2,
        path: "src/schema.gql",
      },
      context: ({ req }: { req: any }) => ({
        user: req.user,
      }),
    }),
    EventsModule,
  ],
})
export class AppModule {}
