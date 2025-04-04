<template>
  <v-container v-if="$route.query.exam_type && $route.query.student_id" class="pa-0">
    <v-row align="center" justify="center" class="ma-0">
      <v-col cols="12" class="pa-0">
        <v-card class="exam-card">
          <!-- Loader -->
          <v-progress-circular
            v-if="loading"
            indeterminate
            color="primary"
            size="64"
            class="ma-8"
          ></v-progress-circular>

          <div v-if="!examStarted && !loading" class="start-exam-content pa-4 pa-sm-8">
            <v-icon size="48" color="primary" class="mb-4">mdi-book-open-variant</v-icon>
            <h1 class="text-h4 text-sm-h3 mb-4">Online English Exam</h1>
            <div class="exam-description mb-6">
              <p class="text-body-1 mb-3">Welcome to the English Proficiency Test</p>
              <v-card class="info-card mb-4" flat>
                <v-list-item three-line>
                  <v-list-item-content>
                    <div class="exam-info-item">
                      <v-icon small color="primary" class="mr-2">mdi-clock-outline</v-icon>
                      <span class="info-text">Duration: Multiple timed questions</span>
                    </div>
                    <div class="exam-info-item">
                      <v-icon small color="primary" class="mr-2">mdi-format-list-checks</v-icon>
                      <span class="info-text">Question Types: Multiple choice</span>
                    </div>
                    <div class="exam-info-item">
                      <v-icon small color="primary" class="mr-2">mdi-headphones</v-icon>
                      <span class="info-text">Audio Sections: Listening comprehension included</span>
                    </div>
                  </v-list-item-content>
                </v-list-item>
              </v-card>
              <v-alert
                type="info"
                text
                dense
                color="primary"
                class="mb-4 text-caption text-sm-body-2"
              >
                Make sure you're in a quiet environment and your audio is working properly.
              </v-alert>
            </div>
            <v-btn
              @click="startExam"
              color="primary"
              x-large
              class="elevation-2 start-button"
            >
              <v-icon left>mdi-play-circle</v-icon>
              Start Exam
            </v-btn>
          </div>
          <div v-if="examStarted && !loading">
            <AudioComponent
             @update-count="handleCount"
              v-if="examConfig?.is_audio_level && listeningAudioCount < examConfig?.audio_listening_count && !examCompleted"
              :audioFile="audioFile"
              :listeningToAudio="listeningToAudio"
              :audioListeningCount="examConfig?.audio_listening_count"
              @audio-ended="handleAudioEnded"
              @replay-audio="handleReplayAudio"
              @proceed-to-question="handleProceedToQuestion"
            />
            <CounterComponent 
              v-if="examQuestion && (!examConfig?.is_audio_level || listeningAudioCount >= examConfig?.audio_listening_count) && !examCompleted"
              :current="examConfig?.question_number" 
              :total="examConfig?.questions_count" 
            />
            <QuestionComponent
              v-if="examQuestion && (!examConfig?.is_audio_level || listeningAudioCount >= examConfig?.audio_listening_count) && !examCompleted"
              :question="examQuestion"
              :duration="examQuestion?.question_duration || 7"
              @answer="handleAnswer"
              @time-up="handleTimeUp"
              @update-audio-completed="updateAudioCompleted"
            />

            <div v-if="message && examStarted && !examCompleted" class="error-container pa-4">
              <v-alert
                border="left"
                colored-border
                type="error"
                elevation="2"
                class="error-alert mb-4"
              >
                <div class="d-flex align-center">
                  <v-icon size="24" class="mr-3">mdi-alert-circle</v-icon>
                  <div>
                    <div class="text-subtitle-1 font-weight-medium mb-1">An error occurred</div>
                    <div class="text-body-2">{{ message }}</div>
                  </div>
                </div>
              </v-alert>
            </div>
          </div>
          <EvaluationComponent 
            v-if="examCompleted" 
            :results="evaluationResults" 
          />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';
import QuestionComponent from './QuestionComponent.vue';
import CounterComponent from './CounterComponent.vue';
import EvaluationComponent from './EvaluationComponent.vue';
import AudioComponent from './AudioComponent.vue';

export default {
  components: {
    QuestionComponent,
    CounterComponent,
    EvaluationComponent,
    AudioComponent,
  },
  data() {
    return {
      baseUrl: 'https://ftcourses.com/api',
      loading: false,
      examStarted: false,
      examConfig: null,
      examQuestion: null,
      audioFile: null,
      evaluationResults: null,
      urlData: null,
      examCompleted:false,
      listeningAudioCount:0,
      message: ''
    };
  },
  created() {
    this.urlData = `?exam_type=${this.$route.query.exam_type}&expires=${this.$route.query.expires}&student_id=${this.$route.query.student_id}&signature=${this.$route.query.signature}`;
  },
  watch: {
    examConfig: {
      immediate: true,
      deep: true,
      handler() {
        if(this.examConfig?.is_audio_level && this.listeningAudioCount < this.examConfig.audio_listening_count) { 
          if(this.examConfig?.audio_used && this.examConfig.exam_type == 'progression') {
            this.listeningAudioCount  = this.examConfig.audio_listening_count;
            this.handleAudioEnded()
          } else {
            this.getAudioFile()
          }
        }
      }
    }
  },
  methods: {
    handleCount(value) {
      this.listeningAudioCount = value;
    },
    handleAudioEnded() {
      this.getNextQuestion()
    },
    handleProceedToQuestion() {
      this.getNextQuestion()
    },
    getAudioFile() {
      this.loading = true;
      axios.get(`${this.baseUrl}/exams/get-audio/${this.examConfig?.exam_attempt_id}${this.urlData}`
      ).then((response) => {
        this.audioFile = response.data.data.audio_file;
        this.loading = false;
      }).catch((error) => {
        this.message = error?.response?.data?.message ?? 'Error getting audio file'
        console.error('Error getting audio file:', error);
      });
    },
    startExam() {
      this.examStarted = true;
      this.loading = true;
      axios.post(`${this.baseUrl}/exams/start${this.urlData}`, {
          exam_type: this.$route.query.exam_type,
          student_id: this.$route.query.student_id
      }).then((response) => {
         this.examConfig = response.data.data.exam;
         this.examQuestion = response.data.data;
         this.urlData = `?exam_type=${this.$route.query.exam_type}&expires=${this.$route.query.expires}&student_id=${this.$route.query.student_id}&signature=${this.$route.query.signature}&exam_attempt_id=${this.examConfig?.exam_attempt_id}`;
         this.loading = false;
      }).catch((error) => {
        this.message = error?.response?.data?.message ?? 'Error starting exam'
        console.error('Error starting exam:', error);
        this.loading = false;
      });
    },
    handleAnswer(answer) {
      this.loading = true
      axios.post(`${this.baseUrl}/exams/submit-answer${this.urlData}`,
        {
          answer: answer,
          question_id: this.examQuestion.id,
          exam_attempt_id: this.examConfig?.exam_attempt_id
        }).then((response) => {
        this.examConfig = response.data.data.exam;
        if (this.examConfig?.question_number == this.examConfig?.questions_count) {
          this.evaluateExam()
        } else {
          if((!this.examConfig?.is_audio_level || this.listeningAudioCount >= this.examConfig?.audio_listening_count) && !this.examCompleted) {
            this.getNextQuestion()
          }
        }
      }).catch((error) => {
        this.message = error?.response?.data?.message ?? 'Error submitting answer'
        console.error('Error submitting answer:', error);
      });
      this.loading = false;
    },
    handleTimeUp() {
      this.handleAnswer('')
    },
    getNextQuestion() {
      this.loading = true

      if (this.examConfig?.question_number < this.examConfig?.questions_count) {
        axios.post(`${this.baseUrl}/exams/get-question/${this.examConfig?.exam_attempt_id}${this.urlData}`).then((response) => {
          this.examConfig = response.data.data.exam;
          this.examQuestion = response.data.data;
          if(!this.examConfig.is_audio_level) {
            this.listeningAudioCount = 0
          }
         this.message= ''
        }).catch((error) => {
          this.message = error?.response?.data?.message ?? 'Error getting next question'
          console.error('Error getting next question:', error);
        });
      }
      this.loading = false;
    },
    evaluateExam() {
      axios.post(`${this.baseUrl}/exams/evaluate-exam/${this.examConfig?.exam_attempt_id}${this.urlData}`).then((response) => {
        this.examCompleted = true;
        this.evaluationResults = response.data.data;
      }).catch((error) => {
        this.message = error?.response?.data?.message ?? 'Error getting evaluation results';
        console.error('Error getting evaluation results:', error);
      });
    },
  }

};
</script>

<style scoped>
.exam-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  transition: all 0.3s ease;
  width: 100%;
  min-height: calc(100vh - 92px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.start-exam-content {
  text-align: center;
  max-width: 100%;
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.exam-description {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: 0 16px;
}

.info-card {
  background: rgba(var(--v-primary-base), 0.05);
  border-radius: 8px;
  width: 100%;
}

.exam-info-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
  color: #666;
  padding: 0 8px;
}

.info-text {
  font-size: 0.9rem;
  line-height: 1.4;
}

.start-button {
  min-width: 200px;
  height: 50px;
}

@media (max-width: 600px) {
  .exam-card {
    min-height: calc(100vh - 92px);
    border-radius: 0;
    overflow-y: auto;
  }

  .exam-info-item {
    margin-bottom: 16px;
  }

  .info-text {
    font-size: 0.85rem;
  }

  .start-button {
    width: 100%;
    max-width: 280px;
    height: 44px;
    font-size: 0.875rem;
  }
}

.exam-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.question-component {
  flex: 1;
  min-height: 0;
}

.counter-component {
  margin-top: auto;
  padding: 16px;
}

/* Animation for the start button */
.v-btn {
  transition: transform 0.3s ease;
}

.v-btn:hover {
  transform: translateY(-2px);
}

.v-btn:active {
  transform: translateY(1px);
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  text-align: center;
}

.error-alert {
  max-width: 500px;
  width: 100%;
  margin: 0 auto;
}

.retry-button {
  min-width: 150px;
  transition: all 0.3s ease;
}

.retry-button:hover {
  transform: translateY(-2px);
}

@media (max-width: 600px) {
  .error-container {
    min-height: 180px;
    padding: 16px;
  }

  .error-alert {
    text-align: left;
  }

  .retry-button {
    width: 100%;
    max-width: 280px;
  }
}
</style>