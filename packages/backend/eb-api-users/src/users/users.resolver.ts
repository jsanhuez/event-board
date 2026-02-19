import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { User } from './users.entity';
import { UsersService } from './users.service';
import { RegisterInput, LoginInput, UpdateUserInput } from './users.input';
import { AuthResponse } from './users.response';

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => User, { nullable: true })
  async user(@Args('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Mutation(() => AuthResponse)
  async register(@Args('input') input: RegisterInput): Promise<AuthResponse> {
    return this.usersService.register(input);
  }

  @Mutation(() => AuthResponse)
  async login(@Args('input') input: LoginInput): Promise<AuthResponse> {
    return this.usersService.login(input);
  }

  @Mutation(() => User)
  async updateUser(@Args('input') input: UpdateUserInput): Promise<User> {
    return this.usersService.update(input.id, input);
  }
}
