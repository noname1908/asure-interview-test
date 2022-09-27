import { GetterTree, ActionTree, MutationTree } from 'vuex'
import { getAccessorType } from 'typed-vuex'

// Import all your submodules
import * as mentor from '~/store/mentor'
import * as student from '~/store/student'

// ---vanilla Vuex code---
export const state = () => ({
  name: 'Me',
})

export type RootState = ReturnType<typeof state>

export const getters: GetterTree<RootState, RootState> = {
  name: (state) => state.name,
}

export const mutations: MutationTree<RootState> = {
  CHANGE_NAME: (state, newName: string) => (state.name = newName),
}

export const actions: ActionTree<RootState, RootState> = {
  fetchThings({ commit }) {
    commit('CHANGE_NAME', 'New name')
  },
}
// #---vanilla Vuex code---

// This compiles to nothing and only serves to return the correct type of the accessor
export const accessorType = getAccessorType({
  state,
  getters,
  mutations,
  actions,
  modules: {
    // The key (submodule) needs to match the Nuxt namespace (e.g. ~/store/submodule.ts)
    mentor,
    student,
  },
})
