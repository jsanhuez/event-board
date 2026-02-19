import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { ObjectType, Field, ID, registerEnumType } from "@nestjs/graphql";

export enum EventCategory {
  WORKSHOP = "workshop",
  MEETUP = "meetup",
  TALK = "talk",
  SOCIAL = "social",
}

export enum EventStatus {
  DRAFT = "draft",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
}

registerEnumType(EventCategory, {
  name: "EventCategory",
});

registerEnumType(EventStatus, {
  name: "EventStatus",
});

@ObjectType()
@Schema()
export class Event extends Document {
  @Field()
  @Prop({ required: true })
  title!: string;

  @Field()
  @Prop({ required: true })
  description!: string;

  @Field()
  @Prop({ required: true })
  date!: Date;

  @Field()
  @Prop({ required: true })
  location!: string;

  @Field(() => EventCategory)
  @Prop({ enum: EventCategory, required: true })
  category!: EventCategory;

  @Field()
  @Prop({ required: true })
  organizer!: string;

  @Field(() => EventStatus)
  @Prop({ enum: EventStatus, default: EventStatus.DRAFT })
  status!: EventStatus;

  @Field()
  @Prop({ default: () => new Date() })
  createdAt!: Date;

  @Field()
  @Prop({ default: () => new Date() })
  updatedAt!: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);
