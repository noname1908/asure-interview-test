import { GetterTree, ActionTree, MutationTree } from 'vuex'
import { RootState } from '~/store'

export const state = () => ({
  mentors: [] as any[],
})

export type MentorModuleState = ReturnType<typeof state>

export const getters: GetterTree<MentorModuleState, RootState> = {
  get: (state) => (id: number) => {
    return state.mentors.find((mentor) => mentor.id === id)
  },
}

export const mutations: MutationTree<MentorModuleState> = {
  SET_MENTORS: (state, mentors: any[]) => (state.mentors = mentors),
}

export const actions: ActionTree<MentorModuleState, RootState> = {
  async loadAll({ commit }) {
    const mentors = await this.$api.mentor.getList()
    // deserialize data
    mentors.forEach((mentor: any) => {
      mentor.attributes = {}
      mentor.attributes.id = mentor.id
      mentor.attributes.userId = mentor.user_id
      mentor.attributes.email = mentor.user.email
    })
    // commit data
    commit(
      'SET_MENTORS',
      mentors.map((mentor: any) => mentor.attributes)
    )
  },
}
