import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AuthController {
  public async login({ auth, request }: HttpContextContract) {
    const email = request.input('email')
    const password = request.input('password')
    // generate an API token for the user
    const token = await auth.use('api').attempt(email, password)
    return token
  }

  public async logout({ auth }: HttpContextContract) {
    // remove the token sent during the current request
    await auth.use('api').revoke()
    return {
      revoked: true,
    }
  }
}
