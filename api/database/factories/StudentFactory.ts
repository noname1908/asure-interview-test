import Student from 'App/Models/Student'
import Factory from '@ioc:Adonis/Lucid/Factory'
import UserFactory from './UserFactory'

export default Factory.define(Student, ({ faker }) => {
  return {
    //
  }
})
  .relation('user', () => UserFactory)
  .build()
