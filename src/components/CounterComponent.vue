<template>
    <v-card-text>
      <p class="text-h6">Question {{ current }} of {{ total }}</p>
    </v-card-text>
  </template>
  
  <script>
  export default {
    props: ['current', 'total'],
  };
  </script>