import User from 'App/Models/User'
import Factory from '@ioc:Adonis/Lucid/Factory'
import RoleFactory from './RoleFactory'

export default Factory.define(User, ({ faker }) => {
  return {
    email: faker.internet.email(),
    password: faker.internet.password(),
  }
})
  .relation('role', () => RoleFactory)
  .build()
