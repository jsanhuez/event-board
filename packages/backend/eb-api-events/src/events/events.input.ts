import { IsString, IsDate, IsEnum, IsOptional } from "class-validator";
import { Type } from "class-transformer";
import { InputType, Field } from "@nestjs/graphql";
import { EventCategory, EventStatus } from "./events.entity";

@InputType()
export class CreateEventInput {
  @Field()
  @IsString()
  title!: string;

  @Field()
  @IsString()
  description!: string;

  @Field()
  @Type(() => Date)
  @IsDate()
  date!: Date;

  @Field()
  @IsString()
  location!: string;

  @Field(() => EventCategory)
  @IsEnum(EventCategory)
  category!: EventCategory;

  @Field()
  @IsString()
  organizer!: string;

  @Field(() => EventStatus, { defaultValue: EventStatus.DRAFT })
  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;
}

@InputType()
export class UpdateEventInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  title?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  date?: Date;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  location?: string;

  @Field(() => EventCategory, { nullable: true })
  @IsEnum(EventCategory)
  @IsOptional()
  category?: EventCategory;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  organizer?: string;

  @Field(() => EventStatus, { nullable: true })
  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;
}

@InputType()
export class EventFilterInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  category?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  status?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  organizer?: string;
}
