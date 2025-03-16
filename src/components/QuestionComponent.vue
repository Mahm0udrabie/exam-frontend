<template>
  <div class="exam-container">
    <v-scale-transition>
      <v-container fluid class="pa-0 fill-height">
        <v-row no-gutters class="fill-height">
          <v-col cols="12" class="exam-panel">
            <v-card class="fill-height d-flex flex-column exam-card" elevation="3">
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
                
                <div class="d-flex align-center pa-2 pa-sm-4">
                  <div class="text-subtitle-1 text-sm-h5 white--text font-weight-bold">
                    Question {{ question.questionNumber || '' }}
                  </div>
                  <v-spacer></v-spacer>
                  <v-chip 
                    v-if="!question?.exam?.is_audio_level"
                    :color="timeRemaining <= 10 ? 'error' : 'white'"
                    :class="{ 'pulse-animation': timeRemaining <= 10 }"
                    :text-color="timeRemaining <= 10 ? 'white' : 'primary'"
                    small
                  >
                    <v-icon x-small left>mdi-clock-outline</v-icon>
                    {{ formatTime(timeRemaining) }}
                  </v-chip>
                </div>
              </div>

              <!-- Main Content -->
              <v-card-text class="exam-content">
                <!-- Question Section -->
                <div class="question-section">
                  <div class="text-h6 text-sm-h5 question-text">
                    {{ question.text }}

                     <!-- Question Metadata this part for testing will be removed later -->
                  <!-- <div class="question-metadata mt-4">
                    <v-chip
                      :color="getLevelColor"
                      outlined
                      class="mr-2"
                      x-small
                    >
                      <v-icon x-small left>mdi-stairs</v-icon>
                      {{ question.level }}
                    </v-chip>

                    <v-chip
                      color="info"
                      outlined
                      x-small
                    >
                      <v-icon x-small left>mdi-bookmark</v-icon>
                      {{ question.answer }}
                    </v-chip>
                  </div> -->
                  </div>
                </div>

                <!-- Options Section -->
                <div class="options-section">
                  <v-radio-group 
                    v-model="selectedAnswer"
                    class="options-list"
                    :mandatory="false"
                  >
                    <v-hover v-for="(option, index) in shuffledOptions" :key="index">
                      <template v-slot:default="{ hover }">
                        <v-card
                          class="option-card"
                          :elevation="hover || selectedAnswer === option ? 3 : 1"
                          :class="{ 
                            'selected-option': selectedAnswer === option,
                            'disabled-option': loading 
                          }"
                        >
                          <v-radio
                            :value="option"
                            color="primary"
                            class="option-radio"
                            :disabled="loading"
                          >
                            <template v-slot:label>
                              <div class="option-content">
                                <div class="option-label">
                                  <v-chip label color="primary" text-color="white" class="option-chip">
                                    {{ String.fromCharCode(65 + index) }}
                                  </v-chip>
                                </div>
                                <div class="option-text-wrapper">
                                  <span class="option-text">{{ option }}</span>
                                </div>
                              </div>
                            </template>
                          </v-radio>
                        </v-card>
                      </template>
                    </v-hover>
                  </v-radio-group>

                  <!-- Submit Button -->
                  <div class="submit-container mt-6">
                    <v-btn
                      @click="submitAnswer"
                      color="primary"
                      :loading="loading"
                      :disabled="!selectedAnswer || loading"
                      large
                      block
                      class="submit-button"
                    >
                      <v-icon left>mdi-check</v-icon>
                      Submit Answer
                    </v-btn>
                  </div>
                </div>
              </v-card-text>
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
      loading: false,
      shuffledOptions: []
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
          this.shuffleOptions();
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
    shuffleOptions() {
      if (this.question && this.question.options) {
        this.shuffledOptions = [...this.question.options].sort(() => Math.random() - 0.5);
      }
    },
    startTimer() {
      if(this.question?.exam?.is_audio_level) {
        return;
      }
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
      this.selectedAnswer = '';
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
  min-height: calc(100vh - 92px);
  overflow: hidden;
}

.exam-panel {
  padding: 8px;
}

.exam-card {
  overflow: hidden;
}

.exam-header {
  position: relative;
  height: 56px;
  z-index: 1;
}

.header-progress {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.exam-content {
  display: flex;
  flex-direction: column;
  height: calc(100% - 56px);
  padding: 0;
  overflow-y: auto;
}

.question-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 32px 16px;
  background-color: rgba(var(--v-primary-base), 0.02);
  min-height: 200px;
}

.question-text {
  font-size: 1.25rem;
  line-height: 1.6;
  color: #2c3e50;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  word-break: break-word;
  hyphens: auto;
}

.options-section {
  padding: 24px 16px;
  flex-grow: 1;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 800px;
  margin: 0 auto;
}

.option-card {
  transition: all 0.3s ease;
  border: 2px solid transparent;
  margin-bottom: 8px !important;
  border-radius: 12px;
  overflow: hidden;
}

.option-content {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  gap: 12px;
}

.option-label {
  flex-shrink: 0;
}

.option-chip {
  min-width: 28px;
  width: 28px;
  height: 28px !important;
  flex-shrink: 0;
  font-weight: 600;
}

.option-text-wrapper {
  flex: 1;
  min-width: 0;
}

.option-text {
  font-size: 1rem;
  line-height: 1.5;
  color: #2c3e50;
  word-break: break-word;
  hyphens: auto;
}

.submit-container {
  max-width: 800px;
  margin: 24px auto 0;
  padding: 0 16px;
}

.submit-button {
  width: 100%;
  transition: all 0.3s ease;
}

.submit-button:hover {
  transform: translateY(-2px);
}

/* Selected and disabled states */
.option-card.selected-option {
  border-color: var(--v-primary-base);
  background-color: rgba(var(--v-primary-base), 0.05);
}

.option-card:hover:not(.disabled-option) {
  background-color: rgba(var(--v-primary-base), 0.02);
}

.option-card.disabled-option {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .question-section {
    padding: 24px 12px;
  }

  .question-text {
    font-size: 1.1rem;
    line-height: 1.5;
  }

  .options-section {
    padding: 16px 12px;
  }

  .option-content {
    padding: 8px;
    gap: 8px;
  }

  .option-chip {
    min-width: 24px;
    width: 24px;
    height: 24px !important;
  }

  .option-text {
    font-size: 0.95rem;
    line-height: 1.4;
  }
}

@media (max-width: 420px) {
  .exam-panel {
    padding: 4px;
  }

  .question-section {
    padding: 16px 8px;
  }

  .question-text {
    font-size: 1rem;
    line-height: 1.4;
  }

  .options-section {
    padding: 12px 8px;
  }

  .option-content {
    padding: 6px;
    gap: 6px;
  }

  .option-text {
    font-size: 0.9rem;
    line-height: 1.35;
  }

  .option-chip {
    min-width: 22px;
    width: 22px;
    height: 22px !important;
  }

  .submit-container {
    padding: 0 8px;
    margin-top: 16px;
  }
}

/* Animation for timer */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.pulse-animation {
  animation: pulse 1s infinite;
}
</style>
