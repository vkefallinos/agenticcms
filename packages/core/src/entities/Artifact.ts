import { Entity, Fields, Validators } from 'remult';
import { BaseRecord } from './BaseRecord';

export type FileType = 'html' | 'pdf' | 'json';

@Entity('artifacts', {
  allowApiCrud: 'authenticated',
})
export class Artifact extends BaseRecord {
  @Fields.string({
    validate: Validators.required,
  })
  parentId!: string; // Links to AgentResource

  @Fields.string({
    validate: Validators.required,
  })
  fileName!: string;

  @Fields.string<Artifact, FileType>({
    validate: Validators.required,
  })
  fileType!: FileType;

  @Fields.string({
    validate: Validators.required,
  })
  url!: string; // Mock storage URL for MVP

  @Fields.string({
    allowNull: true,
  })
  content?: string; // Optional text content storage
}
