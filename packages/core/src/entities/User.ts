import { Entity, Fields, Validators, type Remult } from 'remult';
import { BaseRecord } from './BaseRecord';
import { isAdmin } from '../shared/permissions';

export type UserRole = 'admin' | 'school_admin' | 'teacher' | 'parent' | 'student';

@Entity('users', {
  allowApiRead: 'authenticated', // Users can read other users (needed for collaboration)
  allowApiInsert: true, // Allow registration
  allowApiUpdate: 'authenticated', // Users can update their own profile (validated in UI/backend)
  allowApiDelete: (c?: Remult) => isAdmin(c?.user), // Only admins can delete users
})
export class User extends BaseRecord {
  @Fields.string({
    validate: [Validators.required, Validators.unique],
  })
  email!: string;

  @Fields.string({
    includeInApi: false, // Password should never be exposed via API
  })
  password!: string;

  @Fields.string({
    validate: Validators.required,
  })
  name!: string;

  @Fields.string<User, UserRole>({
    validate: Validators.required,
  })
  role!: UserRole;

  @Fields.string({
    allowNull: true,
  })
  schoolId?: string;

  @Fields.integer({
    allowApiUpdate: false, // CRITICAL: Credits cannot be updated via API
  })
  credits: number = 0;
}
