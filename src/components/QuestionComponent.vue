<template>
  <div class="exam-container">
    <v-scale-transition>
      <v-container fluid class="pa-0 fill-height">
        <v-row no-gutters class="fill-height">
          <!-- Left Panel - Question -->
          <v-col cols="12" lg="4" class="exam-panel">
            <v-card class="fill-height d-flex flex-column question-card" elevation="3">
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

              <!-- Question Content -->
              <v-card-text class="question-content flex-grow-1 d-flex flex-column">
                <div class="question-wrapper flex-grow-1 d-flex flex-column justify-center">
                  <!-- Question Text -->
                  <div class="text-body-1 text-sm-h6 question-text text-left px-3">{{ question.text }}</div>

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
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Right Panel - Options -->
          <v-col cols="12" lg="8" class="exam-panel">
            <v-card class="fill-height d-flex flex-column answer-card" elevation="3">
              <!-- Options Content -->
              <v-card-text class="options-content flex-grow-1">
                <!-- Options List -->
                <v-radio-group 
                  v-model="selectedAnswer"
                  class="options-list"
                  :mandatory="false"
                >
                  <v-hover v-for="(option, index) in question.options" :key="index">
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
  display: flex;
  flex-direction: column;
}

.fill-height {
  height: 100%;
}

.exam-panel {
  height: 100%;
  padding: 8px;
}

.question-card,
.answer-card {
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

.question-content {
  height: calc(100% - 56px);
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.question-wrapper {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.question-text {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #2c3e50;
  margin: 16px 0;
  width: 100%;
  word-break: break-word;
  hyphens: auto;
  max-width: 100%;
}

.image-container {
  background-color: #f8f8f8;
  border-radius: 12px;
  overflow: hidden;
  max-height: 300px;
  margin: 20px auto;
  border: 1px solid rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
}

.question-image {
  object-fit: contain;
  background-color: white;
  max-height: 300px;
}

.question-metadata {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 24px;
}

.options-content {
  height: calc(100% - 56px);
  padding: 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
  width: 100%;
}

.option-card {
  transition: all 0.3s ease;
  border: 2px solid transparent;
  margin-bottom: 8px !important;
  border-radius: 12px;
  width: 100%;
  overflow: hidden;
  background: #fff;
}

.option-content {
  display: flex;
  width: 100%;
  min-height: 48px;
  padding: 8px 12px;
}

.option-label {
  flex-shrink: 0;
  margin-right: 12px;
  display: flex;
  align-items: flex-start;
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
  display: flex;
  align-items: center;
}

.option-text {
  display: block;
  font-size: 0.95rem;
  line-height: 1.4;
  color: #2c3e50;
  width: 100%;
  white-space: normal;
  word-wrap: break-word;
  word-break: break-word;
}

.option-radio {
  width: 100%;
  margin: 0;
}

.submit-container {
  margin-top: 24px;
  padding: 0 16px;
}

.submit-button {
  min-width: 200px;
  transition: all 0.3s ease;
}

.submit-button:hover {
  transform: translateY(-2px);
}

/* Responsive adjustments */
@media (max-width: 1264px) {
  .exam-container {
    height: auto;
  }

  .exam-panel {
    height: auto;
    min-height: 400px;
  }

  .question-content,
  .options-content {
    height: auto;
    min-height: 350px;
  }

  .question-text {
    font-size: 1rem;
    height: auto;

  }

  .option-text {
    font-size: 0.95rem;
  }
}

@media (max-width: 600px) {
  .exam-panel {
    padding: 4px;
    min-height: 300px;
  }

  .question-content,
  .options-content {
    padding: 8px;
    min-height: 250px;
  }

  .image-container {
    margin: 16px auto;
    max-height: 200px;
  }

  .question-image {
    max-height: 200px;
  }

  .question-text {
    font-size: 1rem;
    line-height: 1.4;
    padding: 0 4px;
    margin: 12px 0;
    height: auto;
  }

  .option-content {
    padding: 8px;
    min-height: 40px;
  }

  .option-label {
    margin-right: 8px;
  }

  .option-chip {
    min-width: 24px;
    width: 24px;
    height: 24px !important;
  }

  .option-text {
    font-size: 0.9rem;
    line-height: 1.35;
  }

  .options-list {
    gap: 8px;
  }

  .submit-container {
    margin-top: 16px;
  }
}

@media (max-width: 420px) {
  .question-content,
  .options-content {
    padding: 6px;
  }

  .option-content {
    padding: 6px;
  }

  .option-label {
    margin-right: 6px;
  }

  .option-text {
    font-size: 0.85rem;
    line-height: 1.3;
  }

  .option-chip {
    min-width: 22px;
    width: 22px;
    height: 22px !important;
  }

  .options-content {
    padding: 4px;
  }

  .options-list {
    gap: 6px;
  }

  .option-card {
    margin-bottom: 6px !important;
  }

  /* Force text wrapping on very narrow screens */
  .option-text-wrapper {
    padding-right: 4px;
  }

  .option-text {
    display: inline-block;
    word-break: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
  }

  .submit-container {
    margin-top: 16px;
  }
}

@media (max-width: 412px) {
  .question-content,
  .options-content {
    padding: 0px;
  }

  .option-content {
    padding: 0px;
  }

  .option-label {
    margin-right: 4px;
  }

  .option-chip {
    display: none;
    min-width: 22px;
    width: 22px;
    height: 22px !important;
  }

  .options-content {
    padding: 2px;
  }

  .options-list {
    gap: 6px;
  }

  .option-card {
    margin-bottom: 6px !important;
  }

  /* Force text wrapping on very narrow screens */
  .option-text-wrapper {
    padding-right: 4px;
  }

  .option-text {
    font-size: 0.95rem;
    line-height: .9;
    display: inline-block;
    word-break: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
    width: 280px;
  }

  .submit-container {
    margin-top: 16px;
  }

  .question-text {
    height: auto;
    font-size: 0.95rem;
    line-height: .9;
    display: inline-block;
    word-break: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
    width: 370px;
  }
}

/* Scrollbar styling */
.question-content::-webkit-scrollbar,
.options-content::-webkit-scrollbar {
  width: 6px;
}

.question-content::-webkit-scrollbar-track,
.options-content::-webkit-scrollbar-track {
  background: transparent;
}

.question-content::-webkit-scrollbar-thumb,
.options-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.question-content::-webkit-scrollbar-thumb:hover,
.options-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* Pulse animation for timer */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.pulse-animation {
  animation: pulse 1s infinite;
}

/* Add styles for selected and hover states */
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
</style>
