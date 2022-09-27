interface MentorSchema {
  email: string
  password: string
}

export default class MentorService {
  private axios: any
  constructor(axios: any) {
    this.axios = axios
  }

  create(payload: MentorSchema): Promise<any> {
    return this.axios.$post('/api/mentors', { ...payload })
  }

  delete(mentorId: number): Promise<any> {
    return this.axios.$delete('/api/mentors/' + mentorId)
  }

  getList(): Promise<any> {
    return this.axios.$get('/api/mentors')
  }
}
