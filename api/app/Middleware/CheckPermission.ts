import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { AccessControl } from 'role-acl'
let ac = new AccessControl()

export default class CheckPermission {
  public async handle(
    { auth, request, response }: HttpContextContract,
    next: () => Promise<void>,
    resources: string[]
  ) {
    // get user role
    const loggedInUser = await auth.use('api').user!
    const userRole = await loggedInUser.related('role').query().first()

    // check permissions
    ac.setGrants({ [userRole!.name]: { grants: userRole!.grants } })
    const permission = await ac.can(userRole!.name).execute(request.method()).on(resources[0])
    if (!permission.granted) {
      return response.forbidden('You are not allowed to perform this action')
    }
    // code for middleware goes here. ABOVE THE NEXT CALL
    await next()
  }
}
