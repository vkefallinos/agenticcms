import { Entity, Fields, type Remult, remult } from 'remult';
import { BaseRecord } from './BaseRecord';
import { canManageContent } from '../shared/permissions';

@Entity('static_resources', {
  allowApiRead: 'authenticated',
  allowApiInsert: (c?: Remult) => canManageContent(c?.user),
  allowApiUpdate: 'authenticated',
  allowApiDelete: (c?: Remult) => canManageContent(c?.user),
  // Multi-tenancy: Automatically filter queries by organizationId
  apiPrefilter: (() => {
    const user = remult.user;

    // Super admins (admin role) can see all organizations
    if (user?.roles?.includes('admin')) {
      return {};
    }

    // All other users only see their organization's data
    if (user?.schoolId) {
      return { organizationId: user.schoolId };
    }

    // If no schoolId, return impossible filter to show nothing
    return { organizationId: '__no_access__' };
  }) as any,
  // Auto-set organizationId and ownerId on creation
  saving: (async (entity: StaticResource) => {
    const user = remult.user;

    // Set organizationId from user's schoolId on creation
    if (!entity.organizationId && user?.schoolId) {
      entity.organizationId = user.schoolId;
    }

    // Set ownerId from current user on creation
    if (!entity.ownerId && user?.id) {
      entity.ownerId = user.id;
    }
  }) as any,
})
export abstract class StaticResource extends BaseRecord {
  @Fields.string()
  ownerId!: string;

  @Fields.string()
  organizationId!: string;
}
