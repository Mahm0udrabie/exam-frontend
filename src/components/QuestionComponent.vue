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
      <p class="text-caption">Time remaining: {{ timeRemaining }} seconds</p>
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
      timeRemaining: this.duration,
      timer: null,
    };
  },
  watch: {
    duration() {
      this.resetTimer();
    },
  },
  mounted() {
    this.startTimer();
  },
  methods: {
    startTimer() {
      this.timeRemaining = this.duration;
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