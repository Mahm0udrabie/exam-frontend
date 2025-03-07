<template>
  <v-container class="audio-container">
    <v-card class="audio-card pa-6" elevation="3">
      <!-- Header -->
      <v-card-title class="text-center d-flex flex-column align-center">
        <v-icon color="primary" size="48" class="mb-4">mdi-headphones</v-icon>
        <h2 class="text-h5 font-weight-bold primary--text mb-2">Listening Section</h2>
        <div class="text-subtitle-1 grey--text text--darken-1 text-center">
          Please listen to the audio carefully before answering the questions.
          <template v-if="audioListeningCount > 1">
            <br>
            <span class="font-weight-medium">
              You can listen up to {{ audioListeningCount }} times.
              ({{ currentAudioListeningCount }}/{{ audioListeningCount }} plays)
            </span>
          </template>
        </div>
      </v-card-title>

      <!-- Audio Player Section -->
      <v-card-text class="pt-6">
        <v-fade-transition>
          <div v-if="!audioEnded" class="audio-player-container">
            <!-- Custom styled audio container -->
            <div class="custom-audio-wrapper pa-4 rounded-lg">
              <audio
                :src="audioFile"
                @ended="handleAudioEnded"
                controls
                controlsList="nodownload noplaybackrate"
                ref="audioPlayer"
                class="custom-audio-player"
              ></audio>
            </div>

            <!-- Progress indicator -->
            <v-progress-linear
              :value="(currentAudioListeningCount / audioListeningCount) * 100"
              color="primary"
              height="8"
              rounded
              class="mt-4"
            >
              <template v-slot:default="{ value }">
                <span class="progress-text">{{ Math.ceil(value) }}%</span>
              </template>
            </v-progress-linear>
          </div>
        </v-fade-transition>
      </v-card-text>

      <!-- Action Buttons -->
      <v-card-actions class="pt-4 pb-2">
        <v-row justify="center" align="center" no-gutters>
          <v-col cols="auto">
            <v-fade-transition>
              <v-btn
                v-if="!audioEnded"
                @click="handleReplayAudio"
                color="primary"
                class="mr-4"
                :disabled="currentAudioListeningCount >= audioListeningCount"
                elevation="2"
              >
                <v-icon left>mdi-replay</v-icon>
                Replay Audio
              </v-btn>
            </v-fade-transition>
            
            <v-btn
              @click="handleProceedToQuestion"
              color="success"
              elevation="2"
              :class="{'pulse-animation': audioEnded}"
            >
              <v-icon left>mdi-arrow-right-circle</v-icon>
              Proceed to Questions
            </v-btn>
          </v-col>
        </v-row>
      </v-card-actions>

      <!-- Helper Text -->
      <v-card-text class="text-center pt-4">
        <v-fade-transition>
          <div v-if="!audioEnded && currentAudioListeningCount < audioListeningCount" class="text-caption grey--text">
            <v-icon small color="grey">mdi-information</v-icon>
            You can replay the audio {{ audioListeningCount - currentAudioListeningCount }} more times
          </div>
        </v-fade-transition>
      </v-card-text>
    </v-card>
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

<style scoped>
.audio-container {
  max-width: 800px;
  margin: 0 auto;
}

.audio-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.custom-audio-wrapper {
  background: linear-gradient(to right, #f3f4f6, #ffffff);
  border: 1px solid #e0e0e0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80px;
}

.custom-audio-player {
  width: 100%;
  height: 40px;
}

.custom-audio-player::-webkit-media-controls-panel {
  background-color: transparent;
}

.custom-audio-player::-webkit-media-controls-play-button,
.custom-audio-player::-webkit-media-controls-timeline {
  filter: grayscale(0.5);
}

.progress-text {
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.pulse-animation {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .audio-container {
    padding: 12px;
  }
  
  .audio-card {
    padding: 16px !important;
  }
  
  .v-card-actions {
    flex-direction: column;
    gap: 16px;
  }
  
  .v-btn {
    width: 100%;
    margin: 4px 0 !important;
  }
}
</style>
