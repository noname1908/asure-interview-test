import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Role from 'App/Models/Role'
import { AccessControl } from 'role-acl'

export default class extends BaseSeeder {
  public async run() {
    let ac = new AccessControl()

    ac.grant('admin')
      .execute('*')
      .on('student')
      .execute('*')
      .on('mentor')

      .grant('mentor')
      .execute('get')
      .on('student')

      .grant('student')
      .execute('get')
      .on('mentor')

    const acBuilt = ac.getGrants()
    await Role.query().delete()
    await Role.createMany([
      {
        name: 'admin',
        grants: acBuilt.admin.grants,
      },
      {
        name: 'mentor',
        grants: acBuilt.mentor.grants,
      },
      {
        name: 'student',
        grants: acBuilt.student.grants,
      },
    ])
  }
}
