<template>
  <v-app>
    <v-app-bar app elevation="1" color="white">
      <v-container class="py-0 fill-height">
        <v-img
          :width="150"
          src="https://ftcourses.com/images/livitcafeee.png"
          contain
          class="mr-3"
        ></v-img>
        <v-spacer></v-spacer>
        <v-chip color="primary" class="font-weight-bold">
          <v-icon left>mdi-school</v-icon>
          Online Examination System
        </v-chip>
      </v-container>
    </v-app-bar>

    <v-main class="exam-background">
      <!-- Decorative elements -->
      <div class="exam-decorations">
        <v-icon class="decoration-icon" color="primary" size="64">mdi-pencil</v-icon>
        <v-icon class="decoration-icon" color="secondary" size="48">mdi-book-open-page-variant</v-icon>
        <v-icon class="decoration-icon" color="info" size="56">mdi-lightbulb-on</v-icon>
        <v-icon class="decoration-icon" color="success" size="40">mdi-check-circle</v-icon>
      </div>

      <v-container fluid>
        <v-row align="center" justify="center" class="fill-height">
          <v-col cols="12">
            <router-view v-slot="{ Component }">
              <v-fade-transition mode="out-in">
                <component :is="Component" />
              </v-fade-transition>
            </router-view>
          </v-col>
        </v-row>
      </v-container>

      <!-- Footer -->
      <v-footer app color="white" class="px-4">
        <small>&copy; {{ new Date().getFullYear() }} Fluency Thru Courses. All rights reserved.</small>
        <v-spacer></v-spacer>
        <v-btn
          small
          text
          color="grey"
          href="https://ftcourses.com"
          target="_blank"
          class="px-2"
        >
          <v-icon small left>mdi-web</v-icon>
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

<style scoped>
.exam-background {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
  position: relative;
  overflow: hidden;
}

.exam-decorations {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.decoration-icon {
  position: absolute;
  opacity: 0.1;
  transform: rotate(-15deg);
}

.decoration-icon:nth-child(1) {
  top: 10%;
  left: 5%;
  animation: float 8s ease-in-out infinite;
}

.decoration-icon:nth-child(2) {
  top: 20%;
  right: 10%;
  animation: float 6s ease-in-out infinite;
}

.decoration-icon:nth-child(3) {
  bottom: 15%;
  left: 15%;
  animation: float 7s ease-in-out infinite;
}

.decoration-icon:nth-child(4) {
  bottom: 20%;
  right: 15%;
  animation: float 5s ease-in-out infinite;
}

@keyframes float {
  0% {
    transform: translateY(0) rotate(-15deg);
  }
  50% {
    transform: translateY(-20px) rotate(-5deg);
  }
  100% {
    transform: translateY(0) rotate(-15deg);
  }
}

/* Ensure router-view transitions are smooth */
.v-fade-transition-enter-active,
.v-fade-transition-leave-active {
  transition: opacity 0.2s ease;
}

.v-fade-transition-enter-from,
.v-fade-transition-leave-to {
  opacity: 0;
}
</style>



