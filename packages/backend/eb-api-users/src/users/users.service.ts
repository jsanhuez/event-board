import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { User } from "./users.entity";
import { RegisterInput, LoginInput, UpdateUserInput } from "./users.input";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerInput: RegisterInput) {
    const existingUser = await this.userModel.findOne({
      email: registerInput.email,
    });

    if (existingUser) {
      throw new BadRequestException("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(registerInput.password, 10);

    const user = new this.userModel({
      ...registerInput,
      password: hashedPassword,
    });

    const savedUser = await user.save();

    return this.generateTokens(savedUser);
  }

  async login(loginInput: LoginInput) {
    const user = await this.userModel.findOne({ email: loginInput.email });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(
      loginInput.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return this.generateTokens(user);
  }

  private generateTokens(user: any) {
    const payload = { sub: user._id.toString(), email: user.email };

    const accessToken = this.jwtService.sign(payload, { expiresIn: "1h" });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: "7d" });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
    };
  }

  async findOne(id: string): Promise<User> {
    return this.userModel.findById(id).exec() as Promise<User>;
  }

  async update(id: string, updateUserInput: UpdateUserInput): Promise<User> {
    const { id: _, ...updateData } = updateUserInput;
    return this.userModel
      .findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true },
      )
      .exec() as Promise<User>;
  }

  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email }).exec() as Promise<User>;
  }
}
