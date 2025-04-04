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
                
                <div class="d-flex align-center pa-2">
                  <div class="text-subtitle-1 white--text font-weight-bold">
                    Question {{ question.questionNumber || '' }}
                  </div>
                  <v-spacer></v-spacer>
                  <v-chip 
                    v-if="!question?.exam?.is_audio_level"
                    :color="timeRemaining <= 10 ? 'error' : 'white'"
                    :class="{ 'pulse-animation': timeRemaining <= 10 }"
                    :text-color="timeRemaining <= 10 ? 'white' : 'primary'"
                    class="timer-chip"
                  >
                    <v-icon left small>mdi-clock-outline</v-icon>
                    {{ formatTime(timeRemaining) }}
                  </v-chip>
                </div>
              </div>

              <!-- Main Content -->
              <v-card-text class="exam-content">
                <!-- Question Section -->
                <div class="question-section">
                  <div class="question-text">
                    {{ question.text }}
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
                          :elevation="hover || selectedAnswer === option ? 2 : 0"
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
                                  <v-chip label color="primary" text-color="white" class="option-chip" small>
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
                  <div class="submit-container">
                    <v-btn
                      @click="submitAnswer"
                      color="primary"
                      :loading="loading"
                      :disabled="!selectedAnswer || loading"
                      class="submit-button"
                    >
                      <v-icon left small>mdi-check</v-icon>
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
  padding: 4px;
  height: 100%;
}

.exam-card {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.exam-header {
  position: relative;
  height: 48px;
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
  flex: 1;
  padding: 0;
  overflow: hidden;
}

.question-section {
  padding: 12px 16px;
  background-color: rgba(var(--v-primary-base), 0.02);
  flex-shrink: 0;
}

.question-text {
  font-size: 1rem;
  line-height: 1.4;
  color: #2c3e50;
  text-align: center;
  word-break: break-word;
}

.options-section {
  padding: 8px 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  overflow-y: auto;
  padding-bottom: 8px;
}

.option-card {
  transition: all 0.2s ease;
  border: 1px solid transparent;
  border-radius: 8px;
  margin-bottom: 4px !important;
}

.option-content {
  display: flex;
  align-items: center;
  padding: 8px;
  gap: 8px;
}

.option-label {
  flex-shrink: 0;
}

.option-chip {
  min-width: 24px;
  width: 24px;
  height: 24px !important;
  font-weight: 600;
}

.option-text-wrapper {
  flex: 1;
  min-width: 0;
}

.option-text {
  font-size: 0.9rem;
  line-height: 1.3;
  color: #2c3e50;
  word-break: break-word;
}

.submit-container {
  padding: 8px 0;
  flex-shrink: 0;
}

.submit-button {
  width: 100%;
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

/* Animation for timer */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.pulse-animation {
  animation: pulse 1s infinite;
}

.timer-chip {
  margin: auto;
  font-weight: bold;
  font-size: 1.5rem;
  padding: 8px;
  border: 2px solid;
}
</style>