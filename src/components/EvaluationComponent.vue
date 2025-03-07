<template>
  <v-scale-transition>
    <v-card class="evaluation-card mx-auto my-4" max-width="800">
      <!-- Score circle -->
      <v-card-text class="text-center pt-6">
        <v-progress-circular
          :value="(results?.score || 0)"
          :color="getScoreColor"
          size="150"
          width="15"
        >
          <div class="text-h4">{{ results?.score }}%</div>
        </v-progress-circular>
      </v-card-text>

      <!-- Detailed results -->
      <v-card-text class="pt-4">
        <v-row justify="center" align="center">
          <v-col cols="12" sm="6">
            <v-card outlined class="stat-card mb-4">
              <v-card-text>
                <div class="text-center">
                  <div class="text-h6 success--text">
                    <v-icon color="success">mdi-check</v-icon>
                    Correct Answers
                  </div>
                  <div class="text-h3 font-weight-bold">
                    {{ results?.correct_answers }}
                  </div>
                  <div class="caption grey--text">
                    out of {{ results?.total_questions }} questions
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" v-if="results?.exam?.level === 'placement'">
            <v-card outlined class="stat-card mb-4">
              <v-card-text>
                <div class="text-center">
                  <div class="text-h6 primary--text">
                    <v-icon color="primary">mdi-stairs</v-icon>
                    Achieved Level
                  </div>
                  <div class="text-h3 font-weight-bold">
                    {{ formatLevel(results?.level) }}
                  </div>
                  <div class="caption grey--text">
                    Your placement result
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Performance breakdown -->
        <v-card outlined class="mt-4">
          <v-card-title class="text-h6">
            <v-icon left>mdi-chart-bar</v-icon>
            Performance Breakdown
          </v-card-title>
          <v-card-text>
            <v-list dense>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title class="d-flex align-center">
                    Accuracy Rate
                    <v-spacer></v-spacer>
                    <span class="font-weight-bold">
                      {{ calculateAccuracy(results?.correct_answers, results?.total_questions) }}%
                    </span>
                  </v-list-item-title>
                  <v-progress-linear
                    :value="calculateAccuracy(results?.correct_answers, results?.total_questions)"
                    height="8"
                    rounded
                    color="success"
                    class="mt-2"
                  ></v-progress-linear>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title class="d-flex align-center">
                    Completion Rate
                    <v-spacer></v-spacer>
                    <span class="font-weight-bold">100%</span>
                  </v-list-item-title>
                  <v-progress-linear
                    value="100"
                    height="8"
                    rounded
                    color="info"
                    class="mt-2"
                  ></v-progress-linear>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-card-text>
    </v-card>
  </v-scale-transition>
</template>

<script>
export default {
  props: {
    results: {
      type: Object,
      required: true
    }
  },
  computed: {
    getScoreColor() {
      const score = this.results?.score || 0;
      if (score >= 80) return 'success';
      if (score >= 60) return 'warning';
      return 'error';
    },
  },
  methods: {
    calculateAccuracy(correct, total) {
      if (!correct || !total) return 0;
      return Math.round((correct / total) * 100);
    },
    formatLevel(level) {
      if (!level) return 'N/A';
      return level.charAt(0).toUpperCase() + level.slice(1);
    }
  }
};
</script>

<style scoped>
.evaluation-card {
  transition: all 0.3s ease;
}

.evaluation-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.15) !important;
}

.stat-card {
  transition: all 0.2s ease;
  border-radius: 8px;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
}

/* Ensure proper spacing in list items */
.v-list-item {
  padding: 16px;
}

/* Add some depth to progress bars */
.v-progress-linear {
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}
</style>