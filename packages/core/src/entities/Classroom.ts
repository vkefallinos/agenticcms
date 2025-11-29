import { Entity, Fields, Validators } from 'remult';
import { StaticResource } from './StaticResource';

@Entity('classrooms', {
  allowApiCrud: 'authenticated',
})
export class Classroom extends StaticResource {
  @Fields.string({
    validate: Validators.required,
  })
  name!: string;

  @Fields.string({
    validate: Validators.required,
  })
  gradeLevel!: string;

  @Fields.string({
    validate: Validators.required,
  })
  subject!: string;
}
