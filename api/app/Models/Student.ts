import { DateTime } from 'luxon'
import {
  BaseModel,
  belongsTo,
  BelongsTo,
  column,
  ManyToMany,
  manyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'
import Mentor from './Mentor'

export default class Student extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @manyToMany(() => Mentor, {
    localKey: 'id',
    pivotForeignKey: 'student_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'mentor_id',
    pivotTable: 'student_mentor',
  })
  public mentors: ManyToMany<typeof Mentor>
}
