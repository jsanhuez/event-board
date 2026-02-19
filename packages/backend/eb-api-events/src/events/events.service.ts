import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Event } from "./events.entity";
import {
  CreateEventInput,
  UpdateEventInput,
  EventFilterInput,
} from "./events.input";

@Injectable()
export class EventsService {
  constructor(@InjectModel(Event.name) private eventModel: Model<Event>) {}

  async create(createEventInput: CreateEventInput): Promise<Event> {
    const createdEvent = new this.eventModel(createEventInput);
    return createdEvent.save();
  }

  async findAll(filter?: EventFilterInput): Promise<Event[]> {
    const query: Record<string, any> = {};
    if (filter) {
      if (filter.category) {
        query["category"] = filter.category;
      }
      if (filter.status) {
        query["status"] = filter.status;
      }
      if (filter.organizer) {
        query["organizer"] = filter.organizer;
      }
    }
    return this.eventModel.find(query).sort({ date: 1 }).exec();
  }

  async findOne(id: string): Promise<Event> {
    return this.eventModel.findById(id).exec() as Promise<Event>;
  }

  async update(id: string, updateEventInput: UpdateEventInput): Promise<Event> {
    const { id: _, ...updateData } = updateEventInput;
    return this.eventModel
      .findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true },
      )
      .exec() as Promise<Event>;
  }

  async remove(id: string): Promise<Event> {
    return this.eventModel.findByIdAndDelete(id).exec() as Promise<Event>;
  }
}
