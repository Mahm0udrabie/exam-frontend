<template>
  <v-app>
    <v-main>
      <v-container fluid fill-height>
        <v-row align="center" justify="center">
          <v-col cols="auto">
            <v-img
              :width="300"
              src="https://ftcourses.com/images/livitcafeee.png"
            ></v-img>
          </v-col>
        </v-row>
        <v-row align="center" justify="center">
          <v-col rows="auto" >
            <router-view />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>



