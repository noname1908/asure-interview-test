import { test } from '@japa/runner'
import Role from 'App/Models/Role'
import User from 'App/Models/User'
import { UserFactory } from 'Database/factories'
import Database from '@ioc:Adonis/Lucid/Database'

test.group('Auth login', (group) => {
  // Database global transactions to have a clean database state in-between tests.
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('should login failed', async ({ client }) => {
    const userData = {
      email: 'user@example.com',
      password: 'password',
    }
    const response = await client.post('/auth/login').json(userData)

    response.assertStatus(401)
    response.assertTextIncludes('Invalid credentials')
  })

  test('should login succeeded', async ({ client, assert }) => {
    const userData = {
      email: 'user@example.com',
      password: 'password',
    }
    await UserFactory.with('role').merge(userData).create()
    const response = await client.post('/auth/login').json(userData)

    response.assertStatus(200)
    // ensure response contains the token type and value
    assert.properties(response.body(), {
      type: 'bearer',
      token: 'MQ.6lyab7Y73oMS4D3-xK7lfqNWk-6zyinb_o8bKNBcPVFBOTgKMga6hOPVuMms',
    })
  })
})
