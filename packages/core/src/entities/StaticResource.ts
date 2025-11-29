import { Entity, Fields } from 'remult';
import { BaseRecord } from './BaseRecord';

@Entity('static_resources', {
  allowApiCrud: 'authenticated',
})
export abstract class StaticResource extends BaseRecord {
  @Fields.string()
  ownerId!: string;

  @Fields.string()
  organizationId!: string;
}
