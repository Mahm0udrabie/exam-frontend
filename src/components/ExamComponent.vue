<template>
  <v-container v-if="examType && studentId">
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
              v-if="isAudioLevel && !audioCompleted"
              :audioFile="audioFile"
              :listeningToAudio="listeningToAudio"
              @audio-ended="handleAudioEnded"
              @replay-audio="handleReplayAudio"
              @proceed-to-question="handleProceedToQuestion"
            />
            <QuestionComponent
              v-if="!isAudioLevel || audioCompleted"
              :question="currentQuestion"
              :duration="questionDuration"
              @answer="handleAnswer"
              @time-up="handleTimeUp"
            />
            <CounterComponent :current="questionNumber" :total="totalQuestions" />
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
      examStarted: false,
      isQuestionsAnswered: false,
      currentQuestion: null,
      questionNumber: 0,
      totalQuestions: 100,
      examCompleted: false,
      evaluationResults: null,
      isAudioLevel: false,
      audioFile: '',
      audioCompleted: false,
      listeningToAudio: false,
      questionDuration: 7,
      loading: false,
      baseUrl: 'http://ftcourses.test/api',
      studentId: null,
      examType: null,
      urlData: null,
      examAttemptId: null,
      listeningToAudioCount: 0,
      audioListeningCount: 0,
      audioEnded: false,
    };
  },
  watch: {
    audioCompleted: {
      immediate: true,
      deep: true,
      handler(newValue) {
        if (newValue) {
          if (this.audioListeningCount === this.listeningToAudioCount) {
            this.fetchNextQuestion();
          }
        }
      },
    },
  },
  created() {
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get('student_id');
    const examType = urlParams.get('exam_type');
    this.studentId = studentId;
    this.examType = examType;
    this.getExamSettings();
  },
  methods: {
    async getExamSettings() {
      const urlParams = new URLSearchParams(window.location.search);
      const examType = urlParams.get('exam_type');
      try {
        const examSettings = await axios.get(`${this.baseUrl}/exams/get-exam-settings/${examType}`);
        this.totalQuestions = examSettings.data.data?.questions_count;
        this.audioListeningCount = examSettings.data.data?.audio_listening_count;
      } catch (error) {
        console.error('Error starting exam:', error);
      } finally {
        this.loading = false;
      }
    },
    async startExam() {
      this.loading = true;
      const urlParams = new URLSearchParams(window.location.search);
      const studentId = urlParams.get('student_id');
      const examType = urlParams.get('exam_type');
      const expires = urlParams.get('expires');
      const signature = urlParams.get('signature');
      this.studentId = studentId;
      this.examType = examType;
      try {
        const response = await axios.post(`${this.baseUrl}/exams/start`, {
          student_id: studentId,
          exam_type: examType,
        });
        this.currentQuestion = response.data.data;
        this.questionDuration = this.currentQuestion.question_duration;
        this.examStarted = true;
        this.examAttemptId = this.currentQuestion.exam_attempt_id;
        this.questionNumber = this.currentQuestion?.exam?.question_number;
        this.isAudioLevel = this.currentQuestion?.exam?.is_audio_level;
        this.listeningToAudio = this.currentQuestion?.exam?.listening_to_audio;
        this.listeningToAudioCount = this.currentQuestion?.exam?.listening_to_audio_count;
        this.audioListeningCount = this.currentQuestion?.exam?.audio_listening_count;
        this.urlData = `?exam_type=${examType}&expires=${expires}&student_id=${studentId}&signature=${signature}&exam_attempt_id=${this.examAttemptId}`;
        if (this.isAudioLevel) {
          this.checkAudioLevel();
        }
      } catch (error) {
        console.error('Error starting exam:', error);
      } finally {
        this.loading = false;
      }
    },
    async checkAudioLevel() {
      const audioResponse = await axios.get(`${this.baseUrl}/exams/get-audio/${this.examAttemptId}${this.urlData}`);
      this.audioFile = audioResponse.data.data.audio_file;
      this.listeningToAudio = audioResponse.data.data.listening_to_audio;
      this.listeningToAudioCount = audioResponse.data.data.exam.listening_to_audio_count;
    },
    handleAudioEnded() {
      this.audioCompleted = true;
    },
    handleReplayAudio() {
      if (this.listeningToAudioCount < this.audioListeningCount) {
        this.listeningToAudioCount++;
        this.audioCompleted = false;
      } else {
        this.audioCompleted = true;
      }
    },
    handleProceedToQuestion() {
      if (this.listeningToAudioCount < this.audioListeningCount) {
        this.listeningToAudioCount++;
        this.audioCompleted = false;
      } else {
        this.audioCompleted = true;
      }
    },
    async handleAnswer(answer) {
      this.loading = true;
      if (!this.examCompleted) {
        await this.submitAnswer(answer);
      }
      this.loading = false;
      this.fetchNextQuestion();
    },
    async handleTimeUp() {
      if (!this.examCompleted) {
        await this.submitAnswer('');
      }
      this.fetchNextQuestion();
    },
    async submitAnswer(answer) {
      try {
        const response = await axios.post(`${this.baseUrl}/exams/submit-answer${this.urlData}`, {
          exam_attempt_id: this.currentQuestion.exam_attempt_id,
          question_id: this.currentQuestion.id,
          answer: answer,
        });
        this.examData = response.data.data.exam;
        this.isAudioLevel = this.currentQuestion?.exam?.is_audio_level;
        this.listeningToAudio = this.currentQuestion?.exam?.listening_to_audio;
        this.listeningToAudioCount = this.currentQuestion?.exam?.listening_to_audio_count;
        this.audioListeningCount = this.currentQuestion?.exam?.audio_listening_count;
        this.questionNumber = this.currentQuestion?.exam?.question_number;
      } catch (error) {
        console.error('Error on submit answer:', error);
      }
    },
    async fetchNextQuestion() {
        if (this.questionNumber < this.totalQuestions && !this.examCompleted) {
          const response = await axios.post(`${this.baseUrl}/exams/get-question/${this.currentQuestion.exam_attempt_id}${this.urlData}`);
          this.currentQuestion = response.data.data;
          this.questionDuration = this.currentQuestion.question_duration;
          this.questionNumber = this.currentQuestion?.exam?.question_number;
        } else {
          if (!this.examCompleted) {
            this.evaluateExam();
          }
        }
    },
    async evaluateExam() {
      const response = await axios.post(`${this.baseUrl}/exams/evaluate-exam/${this.currentQuestion.exam_attempt_id}${this.urlData}`);
      this.evaluationResults = response.data.data;
      this.examCompleted = true;
    },
  },
};
</script>