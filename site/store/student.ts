import { GetterTree, ActionTree, MutationTree } from 'vuex'
import { RootState } from '~/store'

export const state = () => ({
  students: [] as any[],
})

export type StudentModuleState = ReturnType<typeof state>

export const getters: GetterTree<StudentModuleState, RootState> = {
  get: (state) => (id: number) => {
    return state.students.find((student) => student.id === id)
  },
}

export const mutations: MutationTree<StudentModuleState> = {
  SET_MENTORS: (state, students: any[]) => (state.students = students),
}

export const actions: ActionTree<StudentModuleState, RootState> = {
  async loadAll({ commit }) {
    const students = await this.$api.student.getList()
    // deserialize data
    students.forEach((student: any) => {
      student.attributes = {}
      student.attributes.id = student.id
      student.attributes.userId = student.user_id
      student.attributes.email = student.user.email
    })
    // commit data
    commit(
      'SET_MENTORS',
      students.map((student: any) => student.attributes)
    )
  },
}
