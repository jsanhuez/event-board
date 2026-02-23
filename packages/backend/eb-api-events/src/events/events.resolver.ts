import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { Event } from "./events.entity";
import { EventsService } from "./events.service";
import { GqlAuthGuard } from "../auth/gql-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import {
  CreateEventInput,
  UpdateEventInput,
  EventFilterInput,
} from "./events.input";

@Resolver(() => Event)
export class EventsResolver {
  constructor(private eventsService: EventsService) {}

  @Query(() => [Event])
  async events(
    @Args("filter", { type: () => EventFilterInput, nullable: true })
    filter?: EventFilterInput,
  ): Promise<Event[]> {
    return this.eventsService.findAll(filter);
  }

  @Query(() => Event, { nullable: true })
  async event(@Args("id", { type: () => String }) id: string): Promise<Event> {
    return this.eventsService.findOne(id);
  }

  @Mutation(() => Event)
  @UseGuards(GqlAuthGuard)
  async createEvent(
    @Args("input") input: CreateEventInput,
    @CurrentUser() user: any,
  ): Promise<Event> {
    return this.eventsService.create(input, user.userId);
  }

  @Mutation(() => Event)
  @UseGuards(GqlAuthGuard)
  async updateEvent(
    @Args("id") id: string,
    @Args("input") input: UpdateEventInput,
    @CurrentUser() user: any,
  ): Promise<Event> {
    return this.eventsService.update(id, input);
  }

  @Mutation(() => Event, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async deleteEvent(
    @Args("id") id: string,
    @CurrentUser() user: any,
  ): Promise<Event> {
    return this.eventsService.remove(id);
  }
}
