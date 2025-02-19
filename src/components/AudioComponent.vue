<template>
  <div>
    <v-text>Please listen to the audio carefully before answering the questions.</v-text>
    <audio
      v-if="!audioEnded"
      :src="audioFile"
      @ended="handleAudioEnded"
      controls
      controlsList="nodownload noplaybackrate"
      class="mb-4"
    ></audio>
    <div>
      <v-btn
        v-if="listeningToAudio"
        @click="handleReplayAudio"
        color="primary"
        class="mr-2"
      >
        Replay Audio
      </v-btn>
      <v-btn
        @click="handleProceedToQuestion"
        color="success"
      >
        Proceed to Questions
      </v-btn>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    audioFile: String,
    listeningToAudio: Boolean,
  },
  data() {
    return {
      audioEnded: false,
    };
  },
  methods: {
    handleAudioEnded() {
      this.audioEnded = true;
      this.$emit('audio-ended');
    },
    handleReplayAudio() {
      this.audioEnded = false;
      this.$emit('replay-audio');
    },
    handleProceedToQuestion() {
      this.$emit('proceed-to-question');
    },
  },
};
</script>