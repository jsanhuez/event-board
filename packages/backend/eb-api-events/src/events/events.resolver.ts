import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Event } from './events.entity';
import { EventsService } from './events.service';
import { CreateEventInput, UpdateEventInput, EventFilterInput } from './events.input';

@Resolver(() => Event)
export class EventsResolver {
  constructor(private eventsService: EventsService) {}

  @Query(() => [Event])
  async events(
    @Args('filter', { type: () => EventFilterInput, nullable: true }) filter?: EventFilterInput,
  ): Promise<Event[]> {
    return this.eventsService.findAll(filter);
  }

  @Query(() => Event, { nullable: true })
  async event(@Args('id', { type: () => String }) id: string): Promise<Event> {
    return this.eventsService.findOne(id);
  }

  @Mutation(() => Event)
  async createEvent(@Args('input') input: CreateEventInput): Promise<Event> {
    return this.eventsService.create(input);
  }

  @Mutation(() => Event)
  async updateEvent(
    @Args('input') input: UpdateEventInput,
  ): Promise<Event> {
    return this.eventsService.update(input.id, input);
  }

  @Mutation(() => Event, { nullable: true })
  async deleteEvent(@Args('id') id: string): Promise<Event> {
    return this.eventsService.remove(id);
  }
}
