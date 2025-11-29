import { describe, it, expect, beforeEach } from 'vitest';
import { Entity } from 'remult';
import { BaseRecord } from './BaseRecord';

// Create a concrete test class since BaseRecord might be abstract or used as base
@Entity('test_records')
class TestRecord extends BaseRecord {
  testField: string = '';
}

describe('BaseRecord Entity', () => {
  let record: TestRecord;

  beforeEach(() => {
    record = new TestRecord();
  });

  describe('ID Field', () => {
    it('should allow setting id', () => {
      record.id = 'test-123';
      expect(record.id).toBe('test-123');
    });

    it('should allow reading id after setting', () => {
      record.id = 'test-456';
      expect(record.id).toBeDefined();
      expect(record.id).toBe('test-456');
    });
  });

  describe('Timestamp Fields', () => {
    it('should allow setting createdAt', () => {
      const now = new Date();
      record.createdAt = now;
      expect(record.createdAt).toBe(now);
    });

    it('should allow setting updatedAt', () => {
      const now = new Date();
      record.updatedAt = now;
      expect(record.updatedAt).toBe(now);
    });

    it('should persist timestamp values', () => {
      const created = new Date('2024-01-01');
      const updated = new Date('2024-01-02');
      record.createdAt = created;
      record.updatedAt = updated;
      expect(record.createdAt).toBe(created);
      expect(record.updatedAt).toBe(updated);
    });
  });

  describe('Inheritance', () => {
    it('should be extendable by concrete classes', () => {
      expect(record).toBeInstanceOf(TestRecord);
      expect(record).toBeInstanceOf(BaseRecord);
    });

    it('should allow concrete classes to add their own fields', () => {
      record.testField = 'test value';
      expect(record.testField).toBe('test value');
    });
  });

  describe('Complete Record', () => {
    it('should create a complete record with all base fields', () => {
      const now = new Date();
      const completeRecord = new TestRecord();
      completeRecord.id = 'record-456';
      completeRecord.createdAt = now;
      completeRecord.updatedAt = now;
      completeRecord.testField = 'complete';

      expect(completeRecord.id).toBe('record-456');
      expect(completeRecord.createdAt).toBe(now);
      expect(completeRecord.updatedAt).toBe(now);
      expect(completeRecord.testField).toBe('complete');
    });
  });
});
