<template>
  <div>
    <v-card-text>
      <p class="text-h6">{{ question.text }}</p>
      <v-radio-group v-model="selectedAnswer">
        <v-radio
          v-for="(option, index) in question.options"
          :key="index"
          :label="option"
          :value="option"
        ></v-radio>
      </v-radio-group>
      <p class="text-caption">Time remaining: {{ timeRemaining }} seconds {{ question.question_duration }}</p>
      <p>{{ question.answer }}</p>
    </v-card-text>
    <v-card-actions>
      <v-btn @click="submitAnswer" color="primary" :disabled="!selectedAnswer">
        Submit Answer
      </v-btn>
    </v-card-actions>
  </div>
</template>

<script>
export default {
  props: ['question', 'duration'],
  data() {
    return {
      selectedAnswer: '',
      timeRemaining: 0, // Initialize to 0, it will be set in watch
      timer: null,
    };
  },
  watch: {
    question: {
      immediate: true, // Ensures the timer starts when the component mounts
      handler(newQuestion) {
        if (newQuestion) {
          this.timeRemaining = this.duration; // Reset time when question changes
          this.resetTimer();
        }
      },
    },
  },
  mounted() {
    this.startTimer();
  },
  methods: {
    startTimer() {
      clearInterval(this.timer); // Clear any existing timer
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
    submitAnswer() {
      clearInterval(this.timer);
      this.$emit('answer', this.selectedAnswer);
    },
  },
  beforeUnmount() {
    clearInterval(this.timer);
  },
};
</script>
