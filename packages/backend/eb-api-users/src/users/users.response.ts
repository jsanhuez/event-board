import { ObjectType, Field, ID } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@ObjectType()
export class UserResponse {
  @Field(() => ID)
  id!: string;

  @Field()
  email!: string;

  @Field()
  name!: string;
}

@ObjectType()
export class AuthResponse {
  @Field()
  @IsString()
  accessToken!: string;

  @Field()
  @IsString()
  refreshToken!: string;

  @Field(() => UserResponse)
  user!: UserResponse;
}
