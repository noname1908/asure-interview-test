import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'
import Role from 'App/Models/Role'
import Mentor from 'App/Models/Mentor'

export default class MentorsController {
  public async index({}: HttpContextContract) {}

  public async store({ request }: HttpContextContract) {
    // Mentor schema definition
    const newMentorSchema = schema.create({
      email: schema.string([rules.email(), rules.normalizeEmail({ allLowercase: true })]),
      password: schema.string([rules.minLength(8)]),
    })

    // Validate request body against the schema
    const payload = await request.validate({ schema: newMentorSchema })

    // create new mentor
    const mentorRole = await Role.findByOrFail('name', 'mentor')
    const user = await User.create({ ...payload, roleId: mentorRole.id })
    const mentor = await user.related('mentor').create({})

    return {
      id: mentor.id,
      ...user.serialize(),
    }
  }

  public async show({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({ request, response }: HttpContextContract) {
    const mentorId = request.param('id', null)
    // remove mentor from the database
    const mentor = await Mentor.findOrFail(mentorId)
    await mentor.delete()

    return response.noContent()
  }
}