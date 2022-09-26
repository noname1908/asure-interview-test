import { test } from '@japa/runner'
import Database from '@ioc:Adonis/Lucid/Database'
import { UserFactory, RoleFactory, MentorFactory, StudentFactory } from 'Database/factories'

test.group('Students list', (group) => {
  // Database global transactions to have a clean database state in-between tests.
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  const createMockData = async (isAdmin = true) => {
    // create request user/admin
    const adminGrants = [{ action: ['*'], resource: ['student'], attributes: ['*'] }]
    const userGrants = []
    const userData = {
      email: 'user@example.com',
      password: 'password',
    }
    const userRole = await RoleFactory.merge({
      name: 'admin',
      grants: isAdmin ? adminGrants : userGrants,
    }).create()
    const requestUser = await UserFactory.merge({ ...userData, roleId: userRole.id }).create()

    // create mentors and students
    const mentorGrants = [{ action: ['get'], resource: ['student'], attributes: ['*'] }]
    const mentors = await MentorFactory.with('user', 1, (user) =>
      user.with('role', 1, (role) => role.merge({ grants: mentorGrants }))
    ).createMany(2)
    const studentGrants = [{ action: ['get'], resource: ['mentor'], attributes: ['*'] }]
    const student = await StudentFactory.with('user', 1, (user) =>
      user.with('role', 1, (role) => role.merge({ grants: studentGrants }))
    ).create()
    // assign student to mentor
    await mentors[0].related('students').attach([student.id])

    return { requestUser, mentors, student }
  }

  test('admin get a list students succeeded', async ({ client, assert }) => {
    const { requestUser, student } = await createMockData(true)

    const response = await client.get('/students').loginAs(requestUser)

    response.assertStatus(200)
    response.assertBodyContains([{ id: student.id }])
    assert.equal(response.body().length, 1)
  })

  test('mentor get a list students empty', async ({ client, assert }) => {
    const { mentors } = await createMockData(true)

    const response = await client.get('/students').loginAs(mentors[1].user)

    response.assertStatus(200)
    assert.isArray(response.body())
    assert.equal(response.body().length, 0)
  })
})
