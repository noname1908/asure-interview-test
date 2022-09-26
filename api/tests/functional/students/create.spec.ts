import { test } from '@japa/runner'
import Database from '@ioc:Adonis/Lucid/Database'
import { UserFactory, RoleFactory, MentorFactory } from 'Database/factories'

test.group('Students create', (group) => {
  // Database global transactions to have a clean database state in-between tests.
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  const createMockData = async (isAdmin = true) => {
    // create request user
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

  test('get a status code 422 with invalid data', async ({ client }) => {
    const { requestUser, mentor } = await createMockData()
    const userData = {
      email: 'user@example',
      password: 'password',
    }
    const response = await client
      .post(`/mentors/${mentor.id}/students`)
      .json(userData)
      .loginAs(requestUser)

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          rule: 'email',
          field: 'email',
          message: 'email validation failed',
        },
      ],
    })
  })

  test('get a status code 403 without permissions', async ({ client }) => {
    const { requestUser, mentor } = await createMockData(false)
    const userData = {
      email: 'user@example',
      password: 'password',
    }
    const response = await client
      .post(`/mentors/${mentor.id}/students`)
      .json(userData)
      .loginAs(requestUser)

    response.assertStatus(403)
    response.assertTextIncludes('You are not allowed to perform this action')
  })

  test('create a new student succeeded', async ({ client, assert }) => {
    const { requestUser, mentor } = await createMockData(true)
    const userData = {
      email: 'user@example.com',
      password: 'password',
    }
    const response = await client
      .post(`/mentors/${mentor.id}/students`)
      .json(userData)
      .loginAs(requestUser)

    response.assertStatus(200)
    response.assertBodyContains({ email: userData.email })
    const mentorStudents = await mentor.related('students').query()
    assert.equal(mentorStudents.length, 1)
  })
})
