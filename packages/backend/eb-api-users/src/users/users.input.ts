import { IsEmail, IsString, MinLength } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @IsString()
  name!: string;

  @Field()
  @IsString()
  @MinLength(6)
  password!: string;
}

@InputType()
export class LoginInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @IsString()
  password!: string;
}

@InputType()
export class UpdateUserInput {
  @Field(() => String)
  id!: string;

  @Field({ nullable: true })
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsEmail()
  email?: string;
}
