<template>
  <v-data-table :headers="headers" :items="mentors" class="elevation-1">
    <template #top>
      <v-toolbar flat>
        <v-toolbar-title>Mentors</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="500px">
          <template #activator="{ on, attrs }">
            <v-btn
              v-if="isAdmin"
              color="primary"
              dark
              class="mb-2"
              v-bind="attrs"
              v-on="on"
            >
              New Item
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="text-h5">New Item</span>
            </v-card-title>

            <v-form v-model="valid" lazy-validation @submit.prevent="save">
              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12" sm="6" md="6">
                      <v-text-field
                        v-model="editedItem.email"
                        label="Email"
                        :rules="emailRules"
                        required
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="6">
                      <v-text-field
                        v-model="editedItem.password"
                        label="Password"
                        :rules="passwordRules"
                        required
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="close">
                  Cancel
                </v-btn>
                <v-btn
                  :disabled="editedItem.email && editedItem.password && !valid"
                  color="blue darken-1"
                  text
                  type="submit"
                >
                  Save
                </v-btn>
              </v-card-actions>
            </v-form>
          </v-card>
        </v-dialog>
        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card>
            <v-card-title class="text-h5"
              >Are you sure you want to delete this item?</v-card-title
            >
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="closeDelete"
                >Cancel</v-btn
              >
              <v-btn color="blue darken-1" text @click="deleteItemConfirm"
                >OK</v-btn
              >
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template #item.actions="{ item }">
      <!-- <v-icon small class="mr-2" @click="editItem(item)"> mdi-pencil </v-icon> -->
      <v-icon small @click="deleteItem(item)"> mdi-delete </v-icon>
    </template>
    <template #no-data> No data </template>
  </v-data-table>
</template>

<script>
export default {
  name: 'MentorsIndexPage',
  middleware: 'auth',
  data() {
    return {
      valid: true,
      dialog: false,
      dialogDelete: false,
      headers: [
        { text: 'ID', value: 'id' },
        { text: 'E-mail', value: 'email' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      editedItem: {
        email: '',
        password: '',
      },
      defaultItem: {
        email: '',
        password: '',
      },
      emailRules: [
        (v) => !!v || 'E-mail is required',
        (v) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
      ],
      passwordRules: [
        (v) => !!v || 'Password is required',
        (v) =>
          (v && v.length >= 8) || 'Password must be great than 8 characters',
      ],
    }
  },

  computed: {
    mentors() {
      return this.$accessor.mentor.mentors
    },

    isAdmin() {
      return this.$auth.loggedIn && this.$auth.user.role.name === 'admin'
    },
  },

  created() {
    this.loadAllMentors()
  },

  methods: {
    close() {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    async deleteItemConfirm() {
      try {
        await this.$api.mentor.delete(this.editedItem.id)
        this.closeDelete()
        await this.loadAllMentors()
      } catch (error) {
        this.$toast.error(error.response.data?.errors[0].message)
      }
    },

    closeDelete() {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    async save() {
      try {
        await this.$api.mentor.create(this.editedItem)
        this.close()
        await this.loadAllMentors()
      } catch (error) {
        this.$toast.error(error.response.data?.errors[0].message)
      }
    },

    deleteItem(item) {
      this.editedIndex = this.mentors.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },

    async loadAllMentors() {
      await this.$accessor.mentor.loadAll()
    },
  },
}
</script>
