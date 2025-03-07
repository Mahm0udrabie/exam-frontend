<template>
  <div class="evaluation-container">
    <v-card class="evaluation-card" elevation="0">
      <div class="text-center pa-4 pa-sm-6">
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
          <v-list-item-action>
            <v-chip
              :color="results.passed ? 'success' : 'error'"
              text-color="white"
              x-small
              class="font-weight-medium"
            >
              {{ results.passed ? 'PASSED' : 'FAILED' }}
            </v-chip>
          </v-list-item-action>
        </v-list-item>

        <v-list-item v-if="results.exam">
          <v-list-item-content>
            <v-list-item-title class="font-weight-bold text-body-2 text-sm-body-1">Required Score</v-list-item-title>
            <v-list-item-subtitle class="text-body-2">{{ results.exam.passing_criteria }}%</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-if="results.exam && !results.passed">
          <v-list-item-content>
            <v-list-item-title class="font-weight-bold text-body-2 text-sm-body-1">Attempts</v-list-item-title>
            <v-list-item-subtitle class="text-body-2">
              {{ results.exam.current_attempts }} of {{ results.exam.max_attempts }}
            </v-list-item-subtitle>
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
          <p class="caption grey--text">
            You have {{ remainingAttempts }} attempts remaining
          </p>
        </div>

        <div v-if="!results.passed && !canRetake && results.exam?.max_attempts" class="mb-4">
          <v-alert
            type="warning"
            text
            dense
            class="text-caption text-sm-body-2"
          >
            You have reached the maximum number of attempts for this exam.
          </v-alert>
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
        !this.results.passed &&
        this.results.exam.allow_retake &&
        this.results.exam.current_attempts < this.results.exam.max_attempts
      );
    },
    remainingAttempts() {
      if (!this.results.exam) return 0;
      return this.results.exam.max_attempts - this.results.exam.current_attempts;
    }
  },

  methods: {
    retakeExam() {
      this.loading = true;
      // Emit event to parent to handle retake
      this.$emit('retake');
    },
    goHome() {
      this.$router.push('/');
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