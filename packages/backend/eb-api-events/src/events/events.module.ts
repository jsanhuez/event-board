import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './events.entity';
import { EventsResolver } from './events.resolver';
import { EventsService } from './events.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }])],
  providers: [EventsResolver, EventsService],
  exports: [EventsService],
})
export class EventsModule {}
