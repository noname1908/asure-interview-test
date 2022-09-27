<template>
  <v-form ref="form" v-model="valid" lazy-validation @submit.prevent="submit">
    <v-text-field
      v-model="email"
      :rules="emailRules"
      label="E-mail"
      required
    ></v-text-field>

    <v-text-field
      v-model="password"
      :counter="10"
      :rules="passwordRules"
      label="Password"
      required
      type="password"
    ></v-text-field>

    <v-btn
      :disabled="email && password && !valid"
      color="success"
      class="mr-4"
      type="submit"
    >
      Login
    </v-btn>
  </v-form>
</template>

<script>
export default {
  name: 'LoginPage',
  data: () => ({
    valid: true,
    password: '',
    passwordRules: [
      (v) => !!v || 'Password is required',
      (v) => (v && v.length >= 6) || 'Password must be great than 6 characters',
    ],
    email: '',
    emailRules: [
      (v) => !!v || 'E-mail is required',
      (v) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
    ],
  }),

  mounted() {},

  methods: {
    validate() {
      this.$refs.form.validate()
    },
    reset() {
      this.$refs.form.reset()
    },
    resetValidation() {
      this.$refs.form.resetValidation()
    },
    async submit() {
      try {
        await this.$auth.loginWith('local', {
          data: { email: this.email, password: this.password },
        })
        this.$toast.success('Successfully authenticated')
        this.reset()
        // this.$router.push('/')
      } catch (error) {
        this.$toast.error(error.response.data?.errors[0].message)
      }
    },
  },
}
</script>
