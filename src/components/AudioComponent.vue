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
      ref="audioPlayer"
    ></audio>
    <div>
      <v-btn
        v-if="!audioEnded"
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
    audioListeningCount: Number,
  },
  data() {
    return {
      audioEnded: false,
      currentAudioListeningCount: 0,
    };
  },
  methods: {
    handleAudioEnded() {
      this.currentAudioListeningCount++;
      if (this.currentAudioListeningCount >= this.audioListeningCount) { 
        this.audioEnded = true;
        this.$emit('audio-ended');
      }
    },
    handleReplayAudio() {
      const audio = this.$refs.audioPlayer;
      if (audio) {
        audio.currentTime = 0;
        audio.play();
      }
    },
    handleProceedToQuestion() {
      this.$emit('proceed-to-question');
    },
  },
};
</script>