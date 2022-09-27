import { test } from '@japa/runner'
import Database from '@ioc:Adonis/Lucid/Database'
import { MentorFactory, RoleFactory, UserFactory, StudentFactory } from 'Database/factories'
import Student from 'App/Models/Student'

test.group('Students delete', (group) => {
  // Database global transactions to have a clean database state in-between tests.
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  const createMockData = async (isAdmin = true) => {
    const adminGrants = [{ action: ['*'], resource: ['student'], attributes: ['*'] }]
    const userGrants = []
    const userData = {
      email: 'user@example.com',
      password: 'password',
    }
    const userRole = await RoleFactory.merge({
      grants: isAdmin ? adminGrants : userGrants,
    }).create()
    const requestUser = await UserFactory.merge({ ...userData, roleId: userRole.id }).create()

    // create mentor
    const mentor = await MentorFactory.with('user', 1, (user) => user.with('role')).create()

    return { requestUser, mentor }
  }

  test('get a status code 404 with invalid mentor id', async ({ client }) => {
    const { requestUser } = await createMockData()
    const response = await client.delete(`/students/wrong-id`).loginAs(requestUser)

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'E_ROW_NOT_FOUND: Row not found',
    })
  })

  test('delete a mentor succeeded', async ({ client, assert }) => {
    const { requestUser, mentor } = await createMockData(true)
    const student = await StudentFactory.with('user', 1, (user) => user.with('role')).create()
    await mentor.related('students').attach([student.id])

    const response = await client.delete(`/students/${student.id}`).loginAs(requestUser)

    response.assertStatus(204)
    const oldStudent = await Student.find(student.id)
    assert.isNull(oldStudent)
    const mentorStudents = await mentor.related('students').query()
    assert.equal(mentorStudents.length, 0)
  })
})
