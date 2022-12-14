/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'
import HealthCheck from '@ioc:Adonis/Core/HealthCheck'

// health check
Route.get('/', async ({ response }) => {
  const report = await HealthCheck.getReport()

  return report.healthy ? response.ok(report) : response.badRequest(report)
})
Route.get('/api', async ({ response }) => {
  const report = await HealthCheck.getReport()

  return report.healthy ? response.ok(report) : response.badRequest(report)
})

// auth
Route.group(() => {
  Route.post('login', 'AuthController.login')
  Route.post('logout', 'AuthController.logout').middleware('auth:api')
  Route.get('user', 'AuthController.getLoggedInUser').middleware('auth:api')
}).prefix('api/auth')

// mentors
Route.group(() => {
  Route.post('mentors', 'MentorsController.store')
  Route.delete('mentors/:id', 'MentorsController.destroy')
  Route.get('mentors', 'MentorsController.index')
})
  .prefix('api')
  .middleware(['auth:api', 'checkPermission:mentor'])

// students
Route.group(() => {
  Route.post('mentors/:mentorId/students', 'StudentsController.store')
  Route.delete('students/:id', 'StudentsController.destroy')
  Route.get('students', 'StudentsController.index')
})
  .prefix('api')
  .middleware(['auth:api', 'checkPermission:student'])
