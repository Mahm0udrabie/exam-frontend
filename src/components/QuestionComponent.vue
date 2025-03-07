<template>
  <div class="exam-container">
    <v-scale-transition>
      <!-- Main exam layout -->
      <v-container fluid class="pa-0 fill-height">
        <v-row no-gutters class="fill-height">
          <!-- Left Panel - Question -->
          <v-col cols="12" md="5" class="exam-panel">
            <v-card class="fill-height d-flex flex-column" elevation="3">
              <!-- Progress and Timer Header -->
              <div class="exam-header primary darken-1">
                <v-progress-linear
                  :value="(timeRemaining / duration) * 100"
                  :color="progressColor"
                  height="4"
                  striped
                  background-opacity="0.2"
                  class="header-progress"
                ></v-progress-linear>
                
                <div class="d-flex align-center pa-4">
                  <div class="text-h5 white--text font-weight-bold">
                    Question {{ question.questionNumber || '' }}
                  </div>
                  <v-spacer></v-spacer>
                  <v-chip 
                    :color="timeRemaining <= 10 ? 'error' : 'white'"
                    :class="{ 'pulse-animation': timeRemaining <= 10 }"
                    :text-color="timeRemaining <= 10 ? 'white' : 'primary'"
                  >
                    <v-icon left>mdi-clock-outline</v-icon>
                    {{ formatTime(timeRemaining) }}
                  </v-chip>
                </div>
              </div>

              <!-- Question Content -->
              <v-card-text class="question-content flex-grow-1 d-flex flex-column">
                <!-- Question Text -->
                <div class="text-h6 question-text">{{ question.text }}</div>

                <!-- Question Image -->
                <div v-if="question.image" class="image-container my-4">
                  <v-img
                    :src="question.image"
                    max-height="200"
                    contain
                    class="question-image"
                  ></v-img>
                </div>

                <!-- Question Metadata -->
                <div class="mt-auto pt-4">
                  <v-chip
                    :color="getLevelColor"
                    outlined
                    class="mr-2"
                    small
                  >
                    <v-icon left x-small>mdi-stairs</v-icon>
                    {{ question.level }}
                  </v-chip>
                  
                  <v-chip
                    color="info"
                    outlined
                    small
                  >
                    <v-icon left x-small>mdi-bookmark</v-icon>
                    {{ question.answer }}
                  </v-chip>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Right Panel - Options -->
          <v-col cols="12" md="7" class="exam-panel">
            <v-card class="fill-height d-flex flex-column" elevation="3">
              <!-- Options Header -->
              <div class="exam-header secondary darken-1">
                <div class="pa-4">
                  <div class="text-h5 white--text font-weight-bold d-flex align-center">
                    <v-icon color="white" class="mr-2">mdi-format-list-checks</v-icon>
                    Select Your Answer
                  </div>
                </div>
              </div>

              <!-- Options Content -->
              <v-card-text class="options-content flex-grow-1">
                <!-- Time Warning -->
                <v-slide-y-transition>
                  <v-alert
                    v-if="timeRemaining <= 10"
                    dense
                    type="error"
                    class="mb-4"
                    prominent
                  >
                    <v-icon left>mdi-alert</v-icon>
                    Time is running out!
                  </v-alert>
                </v-slide-y-transition>

                <!-- Options List -->
                <v-radio-group 
                  v-model="selectedAnswer"
                  class="options-list"
                  :mandatory="false"
                >
                  <v-hover v-for="(option, index) in question.options" :key="index">
                    <template v-slot:default="{ hover }">
                      <v-card
                        class="option-card mb-3"
                        :elevation="hover || selectedAnswer === option ? 3 : 1"
                        :class="{ 'selected-option': selectedAnswer === option }"
                      >
                        <v-radio
                          :value="option"
                          color="primary"
                          class="option-radio ma-0"
                        >
                          <template v-slot:label>
                            <div class="d-flex align-center py-2">
                              <v-chip small label color="primary" text-color="white" class="mr-3">
                                {{ String.fromCharCode(65 + index) }}
                              </v-chip>
                              <span class="option-text">{{ option }}</span>
                            </div>
                          </template>
                        </v-radio>
                      </v-card>
                    </template>
                  </v-hover>
                </v-radio-group>
              </v-card-text>

              <!-- Submit Button -->
              <v-card-actions class="pa-4 submit-actions">
                <v-spacer></v-spacer>
                <v-btn
                  @click="submitAnswer"
                  color="primary"
                  :loading="loading"
                  x-large
                  min-width="200"
                  height="50"
                >
                  <v-icon left>mdi-check</v-icon>
                  Submit Answer
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-scale-transition>
  </div>
</template>

<script>
export default {
  props: ['question', 'duration'],
  data() {
    return {
      selectedAnswer: '',
      timeRemaining: 0,
      timer: null,
      loading: false
    };
  },
  computed: {
    progressColor() {
      if (this.timeRemaining <= 10) return 'error';
      if (this.timeRemaining <= 30) return 'warning';
      return 'success';
    },
    getLevelColor() {
      const level = this.question.level?.toLowerCase();
      switch(level) {
        case 'easy': return 'success';
        case 'medium': return 'warning';
        case 'hard': return 'error';
        default: return 'primary';
      }
    }
  },
  watch: {
    question: {
      immediate: true,
      handler(newQuestion) {
        if (newQuestion) {
          this.timeRemaining = this.duration;
          this.resetTimer();
        }
      },
    },
  },
  mounted() {
    this.startTimer();
  },
  beforeUnmount() {
    clearInterval(this.timer);
  },
  methods: {
    startTimer() {
      clearInterval(this.timer);
      this.timer = setInterval(() => {
        if (this.timeRemaining > 0) {
          this.timeRemaining--;
        } else {
          clearInterval(this.timer);
          this.$emit('time-up');
        }
      }, 1000);
    },
    resetTimer() {
      clearInterval(this.timer);
      this.startTimer();
    },
    async submitAnswer() {
      this.loading = true;
      clearInterval(this.timer);
      await this.$emit('answer', this.selectedAnswer);
      this.loading = false;
    },
    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  }
};
</script>

<style scoped>
.exam-container {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.fill-height {
  height: 100%;
}

.exam-panel {
  height: 100%;
  padding: 4px;
}

.exam-header {
  position: relative;
  height: 52px;
}

.header-progress {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.question-content {
  height: calc(100% - 52px);
  padding: 12px;
  display: flex;
  flex-direction: column;
}

.question-text {
  line-height: 1.4;
  font-size: 1.1rem;
  margin-bottom: 12px;
}

.image-container {
  background-color: #f8f8f8;
  border-radius: 8px;
  overflow: hidden;
  max-height: 160px;
  margin: 8px 0;
}

.question-image {
  object-fit: contain;
  background-color: white;
  max-height: 160px;
}

.options-content {
  height: calc(100% - 52px);
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
}

.time-warning {
  margin: 0 0 8px 0;
  padding: 4px 12px;
}

.options-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 8px;
  margin: 0;
  flex: 1;
}

.option-card {
  transition: all 0.2s ease;
  border: 1px solid transparent;
  margin: 0 !important;
}

.option-card:hover {
  transform: translateX(2px);
}

.selected-option {
  border-color: var(--v-primary-base);
  background-color: var(--v-primary-lighten-5);
}

.option-radio {
  width: 100%;
  margin: 0;
}

.option-content {
  padding: 6px 8px;
}

.option-text {
  font-size: 0.95rem;
  line-height: 1.3;
}

.submit-actions {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  background-color: #fafafa;
  padding: 8px 12px !important;
}

/* Responsive adjustments */
@media (max-width: 959px) {
  .exam-container {
    min-height: 100%;
  }

  .exam-panel {
    padding: 2px;
  }

  .options-list {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .question-content, .options-content {
    padding: 8px;
  }
  
  .submit-actions {
    padding: 6px 8px !important;
  }
}

/* Minimal scrollbar */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #bdbdbd;
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: #9e9e9e;
}
</style>
