import { Plugin } from '@nuxt/types'

import Auth from '@/api/Auth'
import Mentor from '@/api/Mentor'
import Student from '@/api/Student'

declare module 'vue/types/vue' {
  // this.$api inside Vue components
  interface Vue {
    $api: {
      auth: InstanceType<typeof Auth>
      mentor: InstanceType<typeof Mentor>
      student: InstanceType<typeof Student>
    }
  }
}

declare module '@nuxt/types' {
  // nuxtContext.app.$api inside asyncData, fetch, plugins, middleware, nuxtServerInit
  interface NuxtAppOptions {
    $api: {
      auth: InstanceType<typeof Auth>
      mentor: InstanceType<typeof Mentor>
      student: InstanceType<typeof Student>
    }
  }
}

declare module 'vuex/types/index' {
  // this.$api inside Vuex stores
  interface Store<S> {
    $api: {
      auth: InstanceType<typeof Auth>
      mentor: InstanceType<typeof Mentor>
      student: InstanceType<typeof Student>
    }
  }
}

const apiPlugin: Plugin = (context, inject) => {
  // initialize API factories
  const factories = {
    auth: new Auth(context.$axios),
    mentor: new Mentor(context.$axios),
    student: new Student(context.$axios),
  }

  // Inject $api
  inject('api', factories)
}

export default apiPlugin
