import { Entity, Fields, Validators } from 'remult';
import { StaticResource } from './StaticResource';

@Entity('student_profiles', {
  allowApiCrud: 'authenticated',
})
export class StudentProfile extends StaticResource {
  @Fields.string({
    validate: Validators.required,
  })
  studentName!: string;

  @Fields.string()
  needs: string = '';

  @Fields.string()
  learningStyle: string = '';

  @Fields.string()
  classroomId: string = '';

  @Fields.string()
  gradeLevel: string = '';

  @Fields.json()
  additionalInfo: Record<string, any> = {};
}
