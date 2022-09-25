import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'
import Role from 'App/Models/Role'

export default class extends BaseSeeder {
  public async run() {
    const adminRole = await Role.query().where({ name: 'admin' }).first()
    if (adminRole) {
      const searchPayload = { email: 'admin@gmail.com' }
      const persistancePayload = { password: 'secret', roleId: adminRole.id }

      await User.updateOrCreate(searchPayload, persistancePayload)
    }
  }
}
