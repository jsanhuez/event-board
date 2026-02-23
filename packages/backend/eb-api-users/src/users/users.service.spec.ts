import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
// mock bcrypt functions to avoid spy issues
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
  compare: jest.fn(),
}));
import * as bcrypt from 'bcryptjs';
import { UsersService } from './users.service';
import { User } from './users.entity';

describe('UsersService (unit)', () => {
  let service: UsersService;
  let model: any; // we'll use a jest.fn() constructor with static methods
  let jwt: JwtService;

  beforeEach(() => {
    model = jest.fn();
    // static mongoose methods
    model.findOne = jest.fn();
    model.findById = jest.fn();
    model.findByIdAndUpdate = jest.fn();

    jwt = { sign: jest.fn(() => 'token') } as any;
    service = new UsersService(model as Model<User>, jwt);
  });

  it('registers a new user if email not taken', async () => {
    (model.findOne as jest.Mock).mockResolvedValue(null);
    const fakeUser = { _id: { toString: () => 'id' }, email: 'a', name: 'n' };
    const saveMock = jest.fn().mockResolvedValue(fakeUser);
    // make model callable (constructor) and attach save to instance
    model.mockImplementation(function (this: any, init: any) {
      Object.assign(this, init);
      this.save = saveMock;
    });

    // bcrypt.hash is already mocked at file level, nothing to do here

    const result = await service.register({ email: 'a', name: 'n', password: 'p' } as any);
    expect(result.accessToken).toBe('token');
    expect(bcrypt.hash).toHaveBeenCalled();
    expect(model.findOne).toHaveBeenCalledWith({ email: 'a' });
  });

  it('throws when login credentials invalid', async () => {
    (model.findOne as jest.Mock).mockResolvedValue(null);
    await expect(service.login({ email: 'x', password: 'y' } as any)).rejects.toThrow();
  });
});
