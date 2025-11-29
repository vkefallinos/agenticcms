import { describe, it, expect, beforeEach } from 'vitest';
import { CreditTransaction } from './CreditTransaction';

describe('CreditTransaction Entity', () => {
  let transaction: CreditTransaction;

  beforeEach(() => {
    transaction = new CreditTransaction();
  });

  describe('Basic Properties', () => {
    it('should create a credit transaction instance', () => {
      expect(transaction).toBeInstanceOf(CreditTransaction);
    });

    it('should allow setting user ID', () => {
      transaction.userId = 'user-123';
      expect(transaction.userId).toBe('user-123');
    });

    it('should allow setting amount', () => {
      transaction.amount = 100;
      expect(transaction.amount).toBe(100);
    });

    it('should allow negative amounts for deductions', () => {
      transaction.amount = -50;
      expect(transaction.amount).toBe(-50);
    });

    it('should allow setting balance after', () => {
      transaction.balanceAfter = 150;
      expect(transaction.balanceAfter).toBe(150);
    });

    it('should allow setting description', () => {
      transaction.description = 'Purchase 100 credits';
      expect(transaction.description).toBe('Purchase 100 credits');
    });
  });

  describe('Transaction Scenarios', () => {
    it('should represent a credit purchase', () => {
      const purchase = new CreditTransaction();
      purchase.userId = 'user-123';
      purchase.amount = 100;
      purchase.balanceAfter = 100;
      purchase.description = 'Purchased 100 credits';

      expect(purchase.amount).toBeGreaterThan(0);
      expect(purchase.description).toContain('Purchased');
    });

    it('should represent an AI generation cost', () => {
      const cost = new CreditTransaction();
      cost.userId = 'user-123';
      cost.amount = -15;
      cost.balanceAfter = 85;
      cost.description = 'AI lesson generation cost';

      expect(cost.amount).toBeLessThan(0);
      expect(cost.description).toContain('cost');
    });

    it('should track balance correctly', () => {
      const t1 = new CreditTransaction();
      t1.userId = 'user-123';
      t1.amount = 100;
      t1.balanceAfter = 100;

      const t2 = new CreditTransaction();
      t2.userId = 'user-123';
      t2.amount = -20;
      t2.balanceAfter = t1.balanceAfter + t2.amount;

      expect(t2.balanceAfter).toBe(80);
    });
  });

  describe('BaseRecord Properties', () => {
    it('should have an ID field (inherited from BaseRecord)', () => {
      transaction.id = 'txn-123';
      expect(transaction.id).toBe('txn-123');
    });
  });

  describe('Full Transaction Creation', () => {
    it('should create a complete transaction with all properties', () => {
      const fullTransaction = new CreditTransaction();
      fullTransaction.id = 'txn-456';
      fullTransaction.userId = 'user-789';
      fullTransaction.amount = 500;
      fullTransaction.balanceAfter = 1500;
      fullTransaction.description = 'Monthly subscription credits';

      expect(fullTransaction.id).toBe('txn-456');
      expect(fullTransaction.userId).toBe('user-789');
      expect(fullTransaction.amount).toBe(500);
      expect(fullTransaction.balanceAfter).toBe(1500);
      expect(fullTransaction.description).toBe('Monthly subscription credits');
    });
  });
});
