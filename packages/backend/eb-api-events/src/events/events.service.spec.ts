import { Model } from 'mongoose';
import { EventsService } from './events.service';
import { Event } from './events.entity';

describe('EventsService (unit)', () => {
  let service: EventsService;
  let model: Partial<Record<keyof Model<Event>, jest.Mock>>;

  beforeEach(() => {
    // minimal mock of mongoose model methods used by service
    model = {
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      // save is called on new model instance, so stub constructor
    };
    service = new EventsService(model as unknown as Model<Event>);
  });

  it('findAll returns events sorted by date', async () => {
    const stub = [{ date: new Date(2020, 1, 1) }];
    // chainable stub: .sort().exec()
    (model.find as jest.Mock).mockReturnValue({
      sort: () => ({ exec: () => Promise.resolve(stub) }),
    });

    const result = await service.findAll();
    expect(result).toBe(stub);
    expect(model.find).toHaveBeenCalledWith({});
  });

  it('findOne delegates to model.findById', async () => {
    const doc = { _id: 'abc' } as any;
    (model.findById as jest.Mock).mockReturnValue({ exec: () => Promise.resolve(doc) });

    expect(await service.findOne('abc')).toBe(doc);
    expect(model.findById).toHaveBeenCalledWith('abc');
  });
});
