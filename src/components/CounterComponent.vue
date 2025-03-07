<template>
  <v-card class="counter-card" elevation="2">
    <v-card-text class="pa-3">
      <v-row no-gutters align="center" justify="space-between">
        <!-- Progress indicator -->
        <v-col cols="12" sm="4" md="5" class="pr-2">
          <div class="d-flex flex-column">
            <div class="d-flex align-center">
              <v-icon color="primary" x-small class="mr-1">mdi-checkbox-marked-circle</v-icon>
              <span class="text-body-2 font-weight-medium">Overall Progress</span>
              <v-spacer></v-spacer>
              <span class="text-body-2 primary--text font-weight-bold">{{ Math.ceil((current / total) * 100) }}%</span>
            </div>
            <v-progress-linear
              :value="(current / total) * 100"
              height="6"
              rounded
              background-color="grey lighten-3"
              color="primary"
              class="mt-1"
            ></v-progress-linear>
          </div>
        </v-col>

        <!-- Question counter -->
        <v-col cols="auto" class="px-2 text-center">
          <v-chip
            color="primary"
            outlined
            small
            class="counter-chip"
          >
            <span class="text-subtitle-2 font-weight-bold">{{ current }}</span>
            <span class="text-overline mx-1">/</span>
            <span class="text-subtitle-2">{{ total }}</span>
          </v-chip>
        </v-col>

        <!-- Remaining counter -->
        <v-col cols="12" sm="4" md="5" class="pl-2">
          <div class="d-flex align-center justify-end">
            <div class="text-right">
              <div class="d-flex align-center justify-end">
                <span class="text-body-2 grey--text text--darken-1">
                  {{ total - current }} question{{ total - current !== 1 ? 's' : '' }} remaining
                </span>
                <v-icon color="grey darken-1" x-small class="ml-1">mdi-flag-checkered</v-icon>
              </div>
              <div class="text-caption primary--text">
                {{ getCompletionMessage }}
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  props: {
    current: {
      type: Number,
      required: true,
      default: 1
    },
    total: {
      type: Number,
      required: true,
      default: 1
    }
  },
  computed: {
    progressPercentage() {
      return (this.current / this.total) * 100;
    },
    getCompletionMessage() {
      const percentage = this.progressPercentage;
      if (percentage === 100) return 'All done!';
      if (percentage >= 75) return 'Almost there!';
      if (percentage >= 50) return 'Halfway through!';
      if (percentage >= 25) return 'Keep going!';
      return 'Just started!';
    }
  }
};
</script>

<style scoped>
.counter-card {
  background: rgba(255, 255, 255, 0.98) !important;
  border-radius: 8px;
  transition: all 0.2s ease;
  max-height: 64px;
}

.counter-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important;
}

.counter-chip {
  min-width: 70px;
  height: 28px !important;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .counter-card {
    margin: 4px;
    max-height: none;
  }

  .v-card-text {
    padding: 8px !important;
  }

  .text-body-2 {
    font-size: 0.8rem !important;
  }

  .counter-chip {
    min-width: 60px;
    height: 24px !important;
  }
}
</style>