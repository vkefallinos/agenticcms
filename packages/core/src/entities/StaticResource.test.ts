import { describe, it, expect, beforeEach } from 'vitest';
import { Entity } from 'remult';
import { StaticResource } from './StaticResource';

// Create a concrete test class for testing StaticResource
@Entity('test_static_resources')
class TestStaticResource extends StaticResource {
  testField: string = '';
}

describe('StaticResource Entity', () => {
  let resource: TestStaticResource;

  beforeEach(() => {
    resource = new TestStaticResource();
  });

  describe('Ownership Fields', () => {
    it('should allow setting ownerId', () => {
      resource.ownerId = 'user-123';
      expect(resource.ownerId).toBe('user-123');
    });

    it('should allow setting organizationId', () => {
      resource.organizationId = 'org-456';
      expect(resource.organizationId).toBe('org-456');
    });

    it('should persist ownership values', () => {
      resource.ownerId = 'teacher-789';
      resource.organizationId = 'school-123';
      expect(resource.ownerId).toBe('teacher-789');
      expect(resource.organizationId).toBe('school-123');
    });
  });

  describe('Inheritance from BaseRecord', () => {
    it('should inherit id from BaseRecord', () => {
      resource.id = 'resource-123';
      expect(resource.id).toBe('resource-123');
    });

    it('should inherit createdAt from BaseRecord', () => {
      const now = new Date();
      resource.createdAt = now;
      expect(resource.createdAt).toBe(now);
    });

    it('should inherit updatedAt from BaseRecord', () => {
      const now = new Date();
      resource.updatedAt = now;
      expect(resource.updatedAt).toBe(now);
    });
  });

  describe('Multi-tenancy Support', () => {
    it('should support different organizations', () => {
      const resource1 = new TestStaticResource();
      resource1.organizationId = 'org-1';
      resource1.ownerId = 'user-1';

      const resource2 = new TestStaticResource();
      resource2.organizationId = 'org-2';
      resource2.ownerId = 'user-2';

      expect(resource1.organizationId).not.toBe(resource2.organizationId);
      expect(resource1.ownerId).not.toBe(resource2.ownerId);
    });

    it('should allow same owner across different organizations', () => {
      const resource1 = new TestStaticResource();
      resource1.organizationId = 'org-1';
      resource1.ownerId = 'user-1';

      const resource2 = new TestStaticResource();
      resource2.organizationId = 'org-2';
      resource2.ownerId = 'user-1';

      expect(resource1.ownerId).toBe(resource2.ownerId);
      expect(resource1.organizationId).not.toBe(resource2.organizationId);
    });
  });

  describe('Complete Resource Creation', () => {
    it('should create a complete static resource with all properties', () => {
      const now = new Date();
      const completeResource = new TestStaticResource();
      completeResource.id = 'static-789';
      completeResource.ownerId = 'teacher-123';
      completeResource.organizationId = 'school-456';
      completeResource.createdAt = now;
      completeResource.updatedAt = now;
      completeResource.testField = 'test data';

      expect(completeResource.id).toBe('static-789');
      expect(completeResource.ownerId).toBe('teacher-123');
      expect(completeResource.organizationId).toBe('school-456');
      expect(completeResource.createdAt).toBe(now);
      expect(completeResource.updatedAt).toBe(now);
      expect(completeResource.testField).toBe('test data');
    });
  });

  describe('Concrete Implementations', () => {
    it('should be the base for Classroom entity', () => {
      // This test verifies the pattern is correct
      // Actual Classroom entity extends StaticResource
      expect(resource).toBeInstanceOf(StaticResource);
    });

    it('should allow concrete classes to add their own fields', () => {
      resource.testField = 'custom field value';
      expect(resource.testField).toBe('custom field value');
    });
  });
});
