<template>
  <v-app dark>
    <v-app-bar :clipped-left="clipped" fixed app>
      <v-btn text v-text="title" />

      <!-- Desktop menu -->
      <template v-for="link in navLinks">
        <v-btn
          v-if="can(link.roles)"
          :key="link.name"
          text
          :to="link.to"
          class="hidden-sm-and-down"
        >
          {{ link.name }}
        </v-btn>
      </template>

      <v-spacer />

      <div v-if="$auth.loggedIn">
        {{ $auth.user.email }} ({{ $auth.user.role.name }})
        <v-btn text @click="$auth.logout()"> Logout </v-btn>
      </div>
      <div v-else>
        <v-btn text to="/login"> Login </v-btn>
      </div>
    </v-app-bar>
    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>
    <!-- <v-navigation-drawer v-model="rightDrawer" :right="right" temporary fixed>
      <v-list>
        <v-list-item @click.native="right = !right">
          <v-list-item-action>
            <v-icon light> mdi-repeat </v-icon>
          </v-list-item-action>
          <v-list-item-title>Switch drawer (click me)</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer> -->
    <v-footer :absolute="!fixed" app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  name: 'DefaultLayout',
  data() {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      navLinks: [
        {
          name: 'Mentors',
          to: '/mentors',
          roles: ['admin', 'student'],
        },
        {
          name: 'Students',
          to: '/students',
          roles: ['admin', 'mentor'],
        },
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'Vuetify.js',
    }
  },

  methods: {
    can(roles) {
      return this.$auth.loggedIn && roles.includes(this.$auth.user.role.name)
    },
  },
}
</script>
