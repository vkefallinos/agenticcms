import { Entity, Fields, type Remult } from 'remult';
import { BaseRecord } from './BaseRecord';
import { canManageContent } from '../shared/permissions';

@Entity('static_resources', {
  allowApiRead: 'authenticated',
  allowApiInsert: (c?: Remult) => canManageContent(c?.user),
  allowApiUpdate: 'authenticated',
  allowApiDelete: (c?: Remult) => canManageContent(c?.user),
})
export abstract class StaticResource extends BaseRecord {
  @Fields.string()
  ownerId!: string;

  @Fields.string()
  organizationId!: string;
}
