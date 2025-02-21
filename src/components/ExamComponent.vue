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
// import axios from 'axios';
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
      studentId: null,
      examType: null,
      urlData: null,
      loading: false,
      examAttemptId: null,
    };
  },

  computed: {
    queryParams() {
      return this.$route;
    }
  },
  mounted() {
    const queryParams = this.$route.query;
console.log('Query Params:', queryParams);
  }

};
</script>