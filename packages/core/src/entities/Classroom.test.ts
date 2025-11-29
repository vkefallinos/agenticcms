import { describe, it, expect, beforeEach } from 'vitest';
import { Classroom } from './Classroom';

describe('Classroom Entity', () => {
  let classroom: Classroom;

  beforeEach(() => {
    classroom = new Classroom();
  });

  describe('Basic Properties', () => {
    it('should create a classroom instance', () => {
      expect(classroom).toBeInstanceOf(Classroom);
    });

    it('should allow setting name', () => {
      classroom.name = 'Math 101';
      expect(classroom.name).toBe('Math 101');
    });

    it('should allow setting grade level', () => {
      classroom.gradeLevel = 'Grade 5';
      expect(classroom.gradeLevel).toBe('Grade 5');
    });

    it('should allow setting subject', () => {
      classroom.subject = 'Mathematics';
      expect(classroom.subject).toBe('Mathematics');
    });
  });

  describe('StaticResource Properties', () => {
    it('should inherit ownerId from StaticResource', () => {
      classroom.ownerId = 'user-123';
      expect(classroom.ownerId).toBe('user-123');
    });

    it('should inherit organizationId from StaticResource', () => {
      classroom.organizationId = 'org-456';
      expect(classroom.organizationId).toBe('org-456');
    });
  });

  describe('Full Classroom Creation', () => {
    it('should create a complete classroom with all properties', () => {
      const fullClassroom = new Classroom();
      fullClassroom.name = 'Science Lab';
      fullClassroom.gradeLevel = 'Grade 6';
      fullClassroom.subject = 'Science';
      fullClassroom.ownerId = 'teacher-123';
      fullClassroom.organizationId = 'school-456';

      expect(fullClassroom.name).toBe('Science Lab');
      expect(fullClassroom.gradeLevel).toBe('Grade 6');
      expect(fullClassroom.subject).toBe('Science');
      expect(fullClassroom.ownerId).toBe('teacher-123');
      expect(fullClassroom.organizationId).toBe('school-456');
    });
  });
});
