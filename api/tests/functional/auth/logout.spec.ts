import { test } from '@japa/runner'
import { UserFactory } from 'Database/factories'
import Database from '@ioc:Adonis/Lucid/Database'

test.group('Auth logout', (group) => {
  // Database global transactions to have a clean database state in-between tests.
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('should login failed', async ({ client }) => {
    const response = await client.post('/auth/logout')

    response.assertStatus(401)
    response.assertTextIncludes('E_UNAUTHORIZED_ACCESS: Unauthorized access')
  })

  test('should logout succeeded', async ({ client }) => {
    const userData = {
      email: 'user@example.com',
      password: 'password',
    }
    const user = await UserFactory.with('role').merge(userData).create()
    const response = await client.post('/auth/logout').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      revoked: true,
    })
  })
})
