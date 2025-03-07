<template>
  <v-container v-if="$route.query.exam_type && $route.query.student_id" >
    <v-row align="center" justify="center">
      <v-col cols="auto" >
        <v-card class="pa-6" >
          <!-- Loader -->
          <v-progress-circular
            v-if="loading"
            indeterminate
            color="primary"
            size="64"
            class="mx-auto"
          ></v-progress-circular>

          <div v-if="!examStarted && !loading" class="start-exam-content pa-8">
            <v-icon size="64" color="primary" class="mb-4">mdi-book-open-variant</v-icon>
            <h1 class="text-h4 mb-4">Online English Exam</h1>
            <div class="exam-description mb-6">
              <p class="text-body-1 mb-3">Welcome to the English Proficiency Test</p>
              <v-card class="info-card mb-4" flat>
                <v-list-item three-line>
                  <v-list-item-content>
                    <div class="exam-info-item">
                      <v-icon small color="primary" class="mr-2">mdi-clock-outline</v-icon>
                      <span>Duration: Multiple timed questions</span>
                    </div>
                    <div class="exam-info-item">
                      <v-icon small color="primary" class="mr-2">mdi-format-list-checks</v-icon>
                      <span>Question Types: Multiple choice</span>
                    </div>
                    <div class="exam-info-item">
                      <v-icon small color="primary" class="mr-2">mdi-headphones</v-icon>
                      <span>Audio Sections: Listening comprehension included</span>
                    </div>
                  </v-list-item-content>
                </v-list-item>
              </v-card>
              <v-alert
                type="info"
                text
                dense
                color="primary"
                class="mb-4"
              >
                Make sure you're in a quiet environment and your audio is working properly.
              </v-alert>
            </div>
            <v-btn
              @click="startExam"
              color="primary"
              x-large
              min-width="200"
              height="50"
              class="elevation-2"
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
            <QuestionComponent
              v-if="examQuestion && (!examConfig?.is_audio_level || listeningAudioCount >= examConfig?.audio_listening_count) && !examCompleted"
              :question="examQuestion"
              :duration="examQuestion?.question_duration || 7"
              @answer="handleAnswer"
              @time-up="handleTimeUp"
              @update-audio-completed="updateAudioCompleted"
            />
            <CounterComponent 
             v-if="examQuestion && (!examConfig?.is_audio_level || listeningAudioCount >= examConfig?.audio_listening_count) && !examCompleted"
            :current="examConfig?.question_number" :total="examConfig?.questions_count" 
            />
            <div v-else>
              {{ message }}
            </div>
            <EvaluationComponent v-if="examCompleted" :results="evaluationResults" />
          </div>
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
      baseUrl: 'http://ftcourses.test/api',
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
    this.urlData = `?exam_type=${this.$route.query.exam_type}&expires=${this.$route.query.expires}&student_id=${this.$route.query.student_id}&signature=${this.$route.query.signature}&exam_attempt_id=${this.examConfig?.exam_attempt_id}`;
  },
  watch: {
    examConfig: {
      immediate: true,
      deep: true,
      handler() {
        if(this.examConfig?.is_audio_level && this.listeningAudioCount < this.examConfig.audio_listening_count) { 
          this.getAudioFile()
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
        }).catch((error) => {
          this.message = error?.response?.data?.message ?? 'Error getting next question'
          console.error('Error getting next question:', error);
        });
      }
      this.loading = false;
    },
    evaluateExam() {
      axios.post(`${this.baseUrl}/exams/evaluate-exam/${this.examConfig?.exam_attempt_id}${this.urlData}`).then((response) => {
        this.examCompleted = true
        this.evaluationResults = response.data.data;
      }).catch((error) => {
        this.message = error?.response?.data?.message ?? 'Error getting evaluation results'
        console.error('Error getting evaluation results:', error);
      });
    }
  }

};
</script>

<style scoped>
.start-exam-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  transition: all 0.3s ease;
  max-width: 600px;
  margin: 0 auto;
}

.start-exam-content {
  text-align: center;
}

.exam-description {
  max-width: 500px;
  margin: 0 auto;
}

.info-card {
  background: rgba(var(--v-primary-base), 0.05);
  border-radius: 8px;
}

.exam-info-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  color: #666;
}

.exam-info-item:last-child {
  margin-bottom: 0;
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

.v-card {
  height: auto;
  display: flex;
  flex-direction: column;
}

.fill-height {
  height: 100%;
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
</style>