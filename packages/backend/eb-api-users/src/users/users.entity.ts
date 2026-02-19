import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
@Schema()
export class User extends Document {
  @Field()
  @Prop({ required: true, unique: true })
  email!: string;

  @Field()
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  password!: string;

  @Field()
  @Prop({ default: () => new Date() })
  createdAt!: Date;

  @Field()
  @Prop({ default: () => new Date() })
  updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
