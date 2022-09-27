interface StudentSchema {
  email: string
  password: string
}

export default class StudentService {
  private axios: any
  constructor(axios: any) {
    this.axios = axios
  }

  create(mentorId: string, payload: StudentSchema): Promise<any> {
    return this.axios.$post(`/api/mentors/${mentorId}/students`, { ...payload })
  }

  delete(studentId: string): Promise<any> {
    return this.axios.$delete(`/api/students/${studentId}`)
  }

  getList(): Promise<any> {
    return this.axios.$get('/api/students')
  }
}
