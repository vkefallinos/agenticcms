import { describe, it, expect } from 'vitest';
import { User } from './User';

describe('User Entity', () => {
  it('should create a user with default credits', () => {
    const user = new User();
    expect(user.credits).toBe(0);
  });

  it('should have the correct role type', () => {
    const user = new User();
    user.role = 'teacher';
    expect(user.role).toBe('teacher');
  });

  it('should allow setting email and name', () => {
    const user = new User();
    user.email = 'test@example.com';
    user.name = 'Test User';

    expect(user.email).toBe('test@example.com');
    expect(user.name).toBe('Test User');
  });
});
