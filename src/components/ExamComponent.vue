<template>
  <v-container v-if="$route.query.examType && $route.query.studentId">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card class="pa-6">
          <!-- Loader -->
          <v-progress-circular
            v-if="loading"
            indeterminate
            color="primary"
            size="64"
            class="mx-auto"
          ></v-progress-circular>

          <v-btn
            v-if="!examStarted && !loading"
            @click="startExam"
            color="primary"
            large
          >
            Start Exam
          </v-btn>
          <div v-if="examStarted && !loading">
            <AudioComponent
              v-if="examConfig.is_audio_level && !audioCompleted"
              :audioFile="audioFile"
              :listeningToAudio="listeningToAudio"
              :audioListeningCount="examConfig.audio_listening_count"
              @audio-ended="handleAudioEnded"
              @replay-audio="handleReplayAudio"
              @proceed-to-question="handleProceedToQuestion"
            />
            <QuestionComponent
              v-if="!examConfig.is_audio_level || audioCompleted"
              :question="examQuestion"
              :duration="examQuestion.question_duration || 8"
              @answer="handleAnswer"
              @time-up="handleTimeUp"
            />
            <CounterComponent :current="examConfig.question_number" :total="examConfig.questions_count" />
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
      examAttemptId: null,
      examStarted: false,
      examConfig: null,
      examQuestion: null,
      audioFile: null,
      evaluationResults: null,
    };
  },
  watch: {
    examConfig: {
      immediate: true,
      deep: true,
      handler() {
        if(this.examConfig.is_audio_level) { 
          this.getAudioFile()
        }
      }
    }
  },
  methods: {
    handleAudioEnded() {
      this.getNextQuestion()
    },
    handleProceedToQuestion() {
      this.getNextQuestion()
    },
    getAudioFile() {
      axios.get(`${this.baseUrl}/exams/get-audio/${this.examConfig.exam_attempt_id}`, {
        params: {
          ...this.$route.query
        }
      }).then((response) => {
        this.audioFile = response.data.data.audio_file;
        this.examConfig = response.data.data.exam;
      }).catch((error) => {
        console.error('Error getting audio file:', error);
      });
    },
    startExam() {
      this.examStarted = true;
      this.loading = true;

      axios.post(`${this.baseUrl}/exams/start`, {
        params: {
          exam_type: this.$route.query.examType,
          student_id: this.$route.query.studentId,
        },
      }).then((response) => {
        this.examConfig = response.data.data.exam;
        this.examQuestion = response.data.data;
        this.loading = false;
      }).catch((error) => {
        console.error('Error starting exam:', error);
        this.loading = false;
      });
    },
    handleAnswer(answer) {

      axios.post(`${this.baseUrl}/exams/submit-answer`, {
        params: {
         ...this.$route.query
        },
        body: {
          answer: answer,
          question_id: this.examQuestion.id,
          exam_attempt_id: this.examConfig.exam_attempt_id
        }
      }).then((response) => {
        this.examConfig = response.data.data.exam;
        this.getNextQuestion()
      }).catch((error) => {
        console.error('Error submitting answer:', error);
      });
    },
    handleTimeUp() {
      this.handleAnswer('')
    },
    getNextQuestion() {
      if (this.examConfig.question_number < this.examConfig.questions_count) {


        axios.get(`${this.baseUrl}/exams/get-question/${this.examConfig.exam_attempt_id}`, {
          params: {
            ...this.$route.query
          }
        }).then((response) => {
          this.examConfig = response.data.data.exam;
          this.examQuestion = response.data.data;
        }).catch((error) => {
          console.error('Error getting next question:', error);
        });
      }
      else {
        this.examCompleted = true;
        this.getEvaluationResults
      }
    },
    getEvaluationResults() {
      axios.get(`${this.baseUrl}/exams/evaluation-exam/${this.examConfig.exam_attempt_id}`, {
        params: {
          ...this.$route.query
        }
      }).then((response) => {
        this.evaluationResults = response.data.data;
      }).catch((error) => {
        console.error('Error getting evaluation results:', error);
      });
    }
  }

};
</script>