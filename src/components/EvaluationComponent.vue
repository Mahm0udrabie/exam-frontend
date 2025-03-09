<template>
  <div class="evaluation-container">
    <v-card class="evaluation-card" elevation="0">
      <div class="text-center pa-4 pa-sm-6" v-if="results?.exam?.exam_type == 'progression'">
        <v-icon 
          class="result-icon mb-4"
          :color="results.passed ? 'success' : 'error'"
        >
          {{ results.passed ? 'mdi-check-circle' : 'mdi-alert-circle' }}
        </v-icon>
        <h2 class="text-h5 text-sm-h4 mb-2">{{ results.passed ? 'Congratulations!' : 'Keep Practicing!' }}</h2>
        <p class="text-subtitle-2 text-sm-subtitle-1 grey--text">
          {{ results.passed ? 'You have successfully passed the exam.' : 'You did not pass this time.' }}
        </p>
      </div>

      <v-divider></v-divider>

      <v-list class="py-0">
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="font-weight-bold text-body-2 text-sm-body-1">Score</v-list-item-title>
            <v-list-item-subtitle class="text-body-2">{{ results.score }}%</v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-content>
            <v-list-item-title class="font-weight-bold text-body-2 text-sm-body-1">Total Questions</v-list-item-title>
            <v-list-item-subtitle class="text-body-2">{{ results.total_questions }}</v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-content>
            <v-list-item-title class="font-weight-bold text-body-2 text-sm-body-1">Correct Answers</v-list-item-title>
            <v-list-item-subtitle class="text-body-2">{{ results.correct_answers }}</v-list-item-subtitle>
          </v-list-item-content>

        </v-list-item>
      </v-list>

      <v-divider></v-divider>


      <div class="text-center pa-4 pa-sm-6">
        <div v-if="!results.passed && canRetake" class="mb-4">
          <v-btn
            color="primary"
            large
            @click="retakeExam"
            :loading="loading"
            min-width="200"
            class="retake-button mb-2"
          >
            <v-icon left>mdi-refresh</v-icon>
            Retake Exam
          </v-btn>
        </div>

        <v-btn
          text
          color="grey"
          @click="goHome"
          class="home-button mt-2"
        >
          <v-icon left>mdi-home</v-icon>
          Return to Home
        </v-btn>
      </div>
    </v-card>
  </div>
</template>

<script>
export default {
  props: {
    results: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      loading: false
    }
  },

  computed: {
    canRetake() {
      if (!this.results.exam) return false;
      return (
        !this.results.passed && this.results.exam.allow_retake && this.results.exam.attempts_count < this.results.exam.max_attempts
      );
    }
  },

  methods: {
    retakeExam() {
      // reload the page
      window.location.reload();
    },
    goHome() {
      window.location.reload();
    }
  }
}
</script>

<style scoped>
.evaluation-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
}

.evaluation-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  overflow: hidden;
}

.result-icon {
  font-size: 64px;
  height: 64px;
  width: 64px;
}

.retake-button {
  min-width: 200px;
}

.v-list-item {
  min-height: 48px;
  padding: 8px 16px;
}

@media (max-width: 600px) {
  .evaluation-container {
    padding: 8px;
  }

  .v-list-item {
    min-height: 40px;
    padding: 4px 16px;
  }

  .result-icon {
    font-size: 48px;
    height: 48px;
    width: 48px;
  }

  .retake-button,
  .home-button {
    width: 100%;
  }
}

/* Transition animations */
.v-btn {
  transition: all 0.3s ease;
}

.v-btn:not(.v-btn--block):hover {
  transform: translateY(-2px);
}

.v-chip {
  transition: all 0.3s ease;
}

.v-chip:hover {
  opacity: 0.9;
}
</style>