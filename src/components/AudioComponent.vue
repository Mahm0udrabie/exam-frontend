<template>
  <v-container>
    <v-row align="center" justify="center">
      
        <v-col cols="auto">
          <v-text
            >Please listen to the audio carefully before answering the
            questions.</v-text
          >
          </v-col>
       </v-row>
    <v-row align="center" justify="center">
      <v-col>
        <audio
          v-if="!audioEnded"
          :src="audioFile"
          @ended="handleAudioEnded"
          controls
          controlsList="nodownload noplaybackrate"
          class="mb-4"
          ref="audioPlayer"
        ></audio>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="auto">
        <v-btn
          v-if="!audioEnded"
          @click="handleReplayAudio"
          color="primary"
          class="mr-2"
        >
          Replay Audio
        </v-btn>
        <v-btn @click="handleProceedToQuestion" color="success">
          Proceed to Questions
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
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
  created() {
    this.currentAudioListeningCount = 0;
  },
  methods: {
    handleAudioEnded() {
      this.currentAudioListeningCount++;
      if (this.currentAudioListeningCount >= this.audioListeningCount) {
        this.audioEnded = true;
        this.getCount();
        this.$emit('audio-ended');
      }
    },
    getCount() {
      this.$emit('update-count', this.currentAudioListeningCount);
    },
    handleReplayAudio() {
      const audio = this.$refs.audioPlayer;
      if (audio) {
        audio.currentTime = 0;
        audio.play();
        this.currentAudioListeningCount++;
      }
    },
    handleProceedToQuestion() {
      this.currentAudioListeningCount = this.audioListeningCount;
      this.audioEnded = true;
      this.getCount()
      this.$emit('proceed-to-question');
    },
  },
};
</script>
