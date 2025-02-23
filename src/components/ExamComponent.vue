<template>
  <v-container>
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
              v-if="examConfig?.is_audio_level && !audioCompleted"
              :audioFile="audioFile"
              :listeningToAudio="listeningToAudio"
              :audioListeningCount="examConfig?.audio_listening_count"
              @audio-ended="handleAudioEnded"
              @replay-audio="handleReplayAudio"
              @proceed-to-question="handleProceedToQuestion"
            />
            <QuestionComponent
              v-if="(!examConfig?.is_audio_level || audioCompleted)"
              :question="examQuestion"
              :duration="examQuestion?.question_duration || 7"
              @answer="handleAnswer"
              @time-up="handleTimeUp"
              @update-audio-completed="updateAudioCompleted"
            />
            <CounterComponent :current="examConfig?.question_number" :total="examConfig?.questions_count" />
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
      urlData: null,
      examCompleted:false,
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
        if(this.examConfig?.is_audio_level) { 
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
      axios.get(`${this.baseUrl}/exams/get-audio/${this.examConfig?.exam_attempt_id}${this.urlData}`
      ).then((response) => {
        this.audioFile = response.data.data.audio_file;
      }).catch((error) => {
        console.error('Error getting audio file:', error);
      });
    },
    startExam() {
      this.examStarted = true;
      this.loading = true;
     

      axios.post(`${this.baseUrl}/exams/start`, {
          exam_type: this.$route.query.exam_type,
          student_id: this.$route.query.student_id
      }).then((response) => {
        this.examConfig = response.data.data.exam;
        if (this.examConfig?.question_number == this.examConfig?.questions_count) {
          this.examCompleted = true;
          this.loading = false;
          return;
        } else {
          this.examQuestion = response.data.data;
          this.loading = false;
        }
      }).catch((error) => {
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
        this.getNextQuestion()
      }).catch((error) => {
        console.error('Error submitting answer:', error);
      });
    },
    handleTimeUp() {
      this.handleAnswer('')
    },
    getNextQuestion() {
      if (this.examConfig?.question_number < this.examConfig?.questions_count) {

        axios.post(`${this.baseUrl}/exams/get-question/${this.examConfig?.exam_attempt_id}${this.urlData}`).then((response) => {
          this.examConfig = response.data.data.exam;
          this.examQuestion = response.data.data;
        }).catch((error) => {
          console.error('Error getting next question:', error);
        });
      }
      else {
        this.evaluateExam()
      }
    },
    evaluateExam() {
      axios.post(`${this.baseUrl}/exams/evaluate-exam/${this.examConfig?.exam_attempt_id}${this.urlData}`).then((response) => {
        console.log(response.data.data?.score)
        this.evaluationResults = response.data.data;
      }).catch((error) => {
        console.error('Error getting evaluation results:', error);
      });
    }
  }

};
</script>