import { test } from '@japa/runner'
import { UserFactory } from 'Database/factories'
import Database from '@ioc:Adonis/Lucid/Database'

test.group('Auth get logged in user', (group) => {
  // Database global transactions to have a clean database state in-between tests.
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('should get user succeeded', async ({ client, assert }) => {
    const userData = {
      email: 'user@example.com',
      password: 'password',
    }
    const user = await UserFactory.with('role').merge(userData).create()
    const response = await client.get('/auth/user').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      id: user.id,
      email: userData.email,
      role: {
        name: user.role.name,
      },
    })
  })
})
