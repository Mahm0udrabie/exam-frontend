<template>
  <v-card>
    <v-card-title class="text-h4 text-center">Exam Results</v-card-title>
    <v-card-text>
      <v-list>
        <v-list-item>
          <v-list-item-title>Score</v-list-item-title>
          <v-list-item-subtitle>{{ results?.score }}</v-list-item-subtitle>
        </v-list-item>
        <v-list-item>
          <v-list-item-title>Passed</v-list-item-title>
          <v-list-item-subtitle>{{ results?.passed ? 'Yes' : 'No' }}</v-list-item-subtitle>
        </v-list-item>
        <v-list-item>
          <v-list-item-title>Correct Answers</v-list-item-title>
          <v-list-item-subtitle>{{ results?.correct_answers }}</v-list-item-subtitle>
        </v-list-item>
        <v-list-item>
          <v-list-item-title>Total Questions</v-list-item-title>
          <v-list-item-subtitle>{{ results?.total_questions }}</v-list-item-subtitle>
        </v-list-item>
        <v-list-item>
          <v-list-item-title>Level</v-list-item-title>
          <v-list-item-subtitle>{{ results?.level }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  props: ['results'],
};
</script>