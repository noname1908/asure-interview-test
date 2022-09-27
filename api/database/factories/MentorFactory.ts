import Mentor from 'App/Models/Mentor'
import Factory from '@ioc:Adonis/Lucid/Factory'
import UserFactory from './UserFactory'
import StudentFactory from './StudentFactory'

export default Factory.define(Mentor, ({}) => {
  return {
    //
  }
})
  .relation('user', () => UserFactory)
  .relation('students', StudentFactory)
  .build()
