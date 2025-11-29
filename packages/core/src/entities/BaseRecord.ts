import { Entity, Fields, IdEntity } from 'remult';

@Entity('base_records', {
  allowApiCrud: false,
})
export abstract class BaseRecord extends IdEntity {
  @Fields.string()
  id!: string;

  @Fields.createdAt()
  createdAt!: Date;

  @Fields.updatedAt()
  updatedAt!: Date;
}
