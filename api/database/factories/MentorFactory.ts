import Mentor from 'App/Models/Mentor'
import Factory from '@ioc:Adonis/Lucid/Factory'
import UserFactory from './UserFactory'

export default Factory.define(Mentor, ({ faker }) => {
  return {
    //
  }
})
  .relation('user', () => UserFactory)
  .build()
