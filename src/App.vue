<template>
  <v-app>
    <v-main>
      <!-- <v-img
        :width="300"
        src="https://ftcourses.com/images/livitcafeee.png"
      ></v-img> -->
      <ExamComponent />
    </v-main>
  </v-app>
</template>

<script>
import ExamComponent from "./components/ExamComponent.vue";

export default {
  name: "App",
  components: {
    ExamComponent,
  },
};
</script>
