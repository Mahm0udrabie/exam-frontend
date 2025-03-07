<template>
  <v-app>
    <v-app-bar app elevation="1" color="white" height="56">
      <v-container class="py-0 fill-height">
        <v-img
          :width="120"
          src="https://ftcourses.com/images/livitcafeee.png"
          contain
          class="mr-3"
        ></v-img>
        <v-spacer></v-spacer>
        <v-chip color="primary" class="font-weight-bold">
          <v-icon left small>mdi-school</v-icon>
          Online Examination System
        </v-chip>
      </v-container>
    </v-app-bar>

    <v-main class="exam-background pa-0">
      <v-container fluid class="fill-height pa-0">
        <router-view v-slot="{ Component }">
          <v-fade-transition mode="out-in">
            <component :is="Component" />
          </v-fade-transition>
        </router-view>
      </v-container>

      <!-- Footer -->
      <v-footer app absolute color="white" height="36" class="px-4 caption">
        <small>&copy; {{ new Date().getFullYear() }} FT Courses. All rights reserved.</small>
        <v-spacer></v-spacer>
        <v-btn
          x-small
          text
          color="grey"
          href="https://ftcourses.com"
          target="_blank"
          class="px-2"
        >
          <v-icon x-small left>mdi-web</v-icon>
          Visit Website
        </v-btn>
      </v-footer>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'App'
};
</script>

<style>
html, body {
  overflow: hidden;
  height: 100%;
}

.v-application {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.exam-background {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
  position: relative;
  overflow: hidden;
  flex: 1;
}

/* Remove default margins and padding that might cause scrolling */
.v-main__wrap {
  display: flex;
  flex-direction: column;
}

.v-main__wrap > .container {
  flex: 1;
  padding: 0 !important;
}

/* Ensure router view takes full height */
.v-main__wrap > .container > .v-fade-transition {
  height: 100%;
}
</style>



