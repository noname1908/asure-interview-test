import Role from 'App/Models/Role'
import Factory from '@ioc:Adonis/Lucid/Factory'

export default Factory.define(Role, ({ faker }) => {
  return {
    name: faker.word.noun(),
  }
}).build()
