// Initialize databases and collections
db = db.getSiblingDB('eb_events');
db.createCollection('events');
db.events.insertMany([
  {
    _id: ObjectId(),
    title: 'TypeScript Workshop',
    description: 'Learn advanced TypeScript patterns and best practices',
    date: new Date('2026-03-15T10:00:00Z'),
    location: 'Room 3',
    category: 'workshop',
    organizer: 'John Doe',
    status: 'confirmed',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId(),
    title: 'React Meetup',
    description: 'Monthly React community meetup',
    date: new Date('2026-03-20T18:00:00Z'),
    location: 'Virtual',
    category: 'meetup',
    organizer: 'Jane Smith',
    status: 'confirmed',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId(),
    title: 'GraphQL Talk',
    description: 'Deep dive into GraphQL federation',
    date: new Date('2026-03-25T14:00:00Z'),
    location: 'Conference Hall A',
    category: 'talk',
    organizer: 'Bob Johnson',
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId(),
    title: 'Team Social',
    description: 'Team building and networking event',
    date: new Date('2026-04-01T17:00:00Z'),
    location: 'Rooftop Terrace',
    category: 'social',
    organizer: 'HR Team',
    status: 'confirmed',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

db = db.getSiblingDB('eb_users');
db.createCollection('users');
db.users.insertMany([
  {
    _id: ObjectId(),
    email: 'john@example.com',
    name: 'John Doe',
    password: '$2b$10$6kG1w2L8k8x8i7j9j9j9j9j9j9j9j9j9j9j9j9j9j9j9j9j9j9j9j', // hashed password
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId(),
    email: 'jane@example.com',
    name: 'Jane Smith',
    password: '$2b$10$6kG1w2L8k8x8i7j9j9j9j9j9j9j9j9j9j9j9j9j9j9j9j9j9j9j9j',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);
