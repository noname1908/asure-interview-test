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
import Student from 'App/Models/Student'

export default class Mentor extends BaseModel {
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

  @manyToMany(() => Student, {
    localKey: 'id',
    pivotForeignKey: 'mentor_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'student_id',
    pivotTable: 'student_mentor',
  })
  public students: ManyToMany<typeof Student>
}
