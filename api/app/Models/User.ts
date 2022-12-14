import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import {
  column,
  beforeSave,
  BaseModel,
  belongsTo,
  BelongsTo,
  hasOne,
  HasOne,
} from '@ioc:Adonis/Lucid/Orm'
import Role from 'App/Models/Role'
import Mentor from 'App/Models/Mentor'
import Student from 'App/Models/Student'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public roleId: number

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public rememberMeToken?: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword(User: User) {
    if (User.$dirty.password) {
      User.password = await Hash.make(User.password)
    }
  }

  @belongsTo(() => Role)
  public role: BelongsTo<typeof Role>

  @hasOne(() => Mentor)
  public mentor: HasOne<typeof Mentor>

  @hasOne(() => Student)
  public student: HasOne<typeof Student>
}
