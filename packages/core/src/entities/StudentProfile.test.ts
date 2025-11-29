import { describe, it, expect, beforeEach } from 'vitest';
import { StudentProfile } from './StudentProfile';

describe('StudentProfile Entity', () => {
  let profile: StudentProfile;

  beforeEach(() => {
    profile = new StudentProfile();
  });

  describe('Basic Properties', () => {
    it('should create a student profile instance', () => {
      expect(profile).toBeInstanceOf(StudentProfile);
    });

    it('should allow setting student name', () => {
      profile.studentName = 'Alice Johnson';
      expect(profile.studentName).toBe('Alice Johnson');
    });

    it('should have default empty needs', () => {
      expect(profile.needs).toBe('');
    });

    it('should allow setting needs', () => {
      profile.needs = 'Extra time on tests, preferential seating';
      expect(profile.needs).toBe('Extra time on tests, preferential seating');
    });

    it('should have default empty learning style', () => {
      expect(profile.learningStyle).toBe('');
    });

    it('should allow setting learning style', () => {
      profile.learningStyle = 'Visual learner';
      expect(profile.learningStyle).toBe('Visual learner');
    });

    it('should have default empty classroom ID', () => {
      expect(profile.classroomId).toBe('');
    });

    it('should allow setting classroom ID', () => {
      profile.classroomId = 'classroom-123';
      expect(profile.classroomId).toBe('classroom-123');
    });

    it('should have default empty grade level', () => {
      expect(profile.gradeLevel).toBe('');
    });

    it('should allow setting grade level', () => {
      profile.gradeLevel = 'Grade 5';
      expect(profile.gradeLevel).toBe('Grade 5');
    });

    it('should have default empty additional info', () => {
      expect(profile.additionalInfo).toEqual({});
    });

    it('should allow setting additional info', () => {
      profile.additionalInfo = {
        parentEmail: 'parent@example.com',
        allergies: ['peanuts'],
      };
      expect(profile.additionalInfo.parentEmail).toBe('parent@example.com');
      expect(profile.additionalInfo.allergies).toEqual(['peanuts']);
    });
  });

  describe('StaticResource Properties', () => {
    it('should inherit ownerId from StaticResource', () => {
      profile.ownerId = 'teacher-123';
      expect(profile.ownerId).toBe('teacher-123');
    });

    it('should inherit organizationId from StaticResource', () => {
      profile.organizationId = 'school-456';
      expect(profile.organizationId).toBe('school-456');
    });
  });

  describe('Full Profile Creation', () => {
    it('should create a complete student profile with all properties', () => {
      const fullProfile = new StudentProfile();
      fullProfile.studentName = 'Bob Smith';
      fullProfile.needs = 'IEP accommodations';
      fullProfile.learningStyle = 'Kinesthetic learner';
      fullProfile.classroomId = 'class-789';
      fullProfile.gradeLevel = 'Grade 4';
      fullProfile.ownerId = 'teacher-456';
      fullProfile.organizationId = 'school-789';
      fullProfile.additionalInfo = {
        emergencyContact: '555-1234',
        medicalConditions: ['asthma'],
      };

      expect(fullProfile.studentName).toBe('Bob Smith');
      expect(fullProfile.needs).toBe('IEP accommodations');
      expect(fullProfile.learningStyle).toBe('Kinesthetic learner');
      expect(fullProfile.classroomId).toBe('class-789');
      expect(fullProfile.gradeLevel).toBe('Grade 4');
      expect(fullProfile.ownerId).toBe('teacher-456');
      expect(fullProfile.organizationId).toBe('school-789');
      expect(fullProfile.additionalInfo.emergencyContact).toBe('555-1234');
      expect(fullProfile.additionalInfo.medicalConditions).toEqual(['asthma']);
    });
  });
});
