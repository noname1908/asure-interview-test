import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'
import Role from 'App/Models/Role'
import Student from 'App/Models/Student'
import Mentor from 'App/Models/Mentor'

export default class StudentsController {
  public async index({ isAdmin, auth }: HttpContextContract) {
    const students = isAdmin
      ? await Student.query().preload('user') // requested by admin
      : await Student.query()
          .whereHas('mentors', (studentsQuery) => {
            studentsQuery.where('user_id', auth.user!.id) // requested by student
          })
          .preload('user')

    return students.map((student) => student.serialize())
  }

  public async store({ request }: HttpContextContract) {
    const mentorId = request.param('mentorId')
    // Mentor schema definition
    const newStudentSchema = schema.create({
      email: schema.string([
        rules.email(),
        rules.normalizeEmail({ allLowercase: true }),
        rules.unique({ table: 'users', column: 'email' }),
      ]),
      password: schema.string([rules.minLength(8)]),
    })

    // Validate request body against the schema
    const { email, password, ...rest } = await request.validate({
      schema: newStudentSchema,
    })

    // create new mentor
    const mentor = await Mentor.findOrFail(mentorId)
    const studentRole = await Role.findByOrFail('name', 'student')
    const user = await User.create({ email, password, roleId: studentRole.id })
    const student = await user.related('student').create(rest)
    // assign student to mentor
    await mentor.related('students').attach([student.id])

    return {
      id: student.id,
      ...user.serialize({
        fields: {
          omit: ['id'],
        },
      }),
    }
  }

  public async show({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({ request, response }: HttpContextContract) {
    const studentId = request.param('id')
    // remove student from the database
    const student = await Student.findOrFail(studentId)
    // unassign student from all mentor
    await student.related('mentors').detach()
    // remove student
    await student.delete()

    return response.noContent()
  }
}
