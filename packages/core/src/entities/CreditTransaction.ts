import { Entity, Fields, Validators } from 'remult';
import { BaseRecord } from './BaseRecord';

@Entity('credit_transactions', {
  allowApiCrud: false, // Append-only ledger, no direct API access
  allowApiRead: 'authenticated',
})
export class CreditTransaction extends BaseRecord {
  @Fields.string({
    validate: Validators.required,
  })
  userId!: string;

  @Fields.integer({
    validate: Validators.required,
  })
  amount!: number; // Negative = usage, Positive = purchase

  @Fields.integer({
    validate: Validators.required,
  })
  balanceAfter!: number;

  @Fields.string({
    validate: Validators.required,
  })
  description!: string;
}
