export default class AuthService {
  private axios: any
  constructor(axios: any) {
    this.axios = axios
  }

  login(email: string, password: string): Promise<any> {
    return this.axios.$post('/api/auth/login', { email, password })
  }

  logout(): Promise<any> {
    return this.axios.$post('/api/auth/logout')
  }

  getUser(): Promise<any> {
    return this.axios.$get('/api/auth/user')
  }
}
