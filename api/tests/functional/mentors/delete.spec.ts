import { test } from '@japa/runner'
import Database from '@ioc:Adonis/Lucid/Database'
import { MentorFactory, RoleFactory, UserFactory } from 'Database/factories'
import Mentor from 'App/Models/Mentor'

test.group('Mentors delete', (group) => {
  // Database global transactions to have a clean database state in-between tests.
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  const createMockData = async (isAdmin = true) => {
    const adminGrants = [{ action: ['*'], resource: ['mentor'], attributes: ['*'] }]
    const userGrants = []
    const userData = {
      email: 'user@example.com',
      password: 'password',
    }
    const userRole = await RoleFactory.merge({
      grants: isAdmin ? adminGrants : userGrants,
    }).create()
    const requestUser = await UserFactory.merge({ ...userData, roleId: userRole.id }).create()

    return { requestUser }
  }

  test('get a status code 404 with invalid mentor id', async ({ client }) => {
    const { requestUser } = await createMockData()
    const response = await client.delete('/mentors/wrong-id').loginAs(requestUser)

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'E_ROW_NOT_FOUND: Row not found',
    })
  })

  test('delete a mentor succeeded', async ({ client, assert }) => {
    const { requestUser } = await createMockData(true)
    const mentor = await MentorFactory.with('user', 1, (user) => user.with('role')).create()
    const response = await client.delete('/mentors/' + mentor.id).loginAs(requestUser)

    response.assertStatus(204)
    const oldMentor = await Mentor.find(mentor.id)
    assert.isNull(oldMentor)
  })
})
