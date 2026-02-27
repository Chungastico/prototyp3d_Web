"use client";

import * as amplitude from '@amplitude/analytics-browser';
import { sessionReplayPlugin } from '@amplitude/plugin-session-replay-browser';

let isInitialized = false;

async function initAmplitude() {
  if (isInitialized) return;
  isInitialized = true;

  // Add Session Replay to the Amplitude instance
  amplitude.add(sessionReplayPlugin({sampleRate: 1}));

  await amplitude.init('327787b275f9fbb8f2af76cc283aac30', undefined, {
    autocapture: true,
  }).promise;
}

if (typeof window !== "undefined") {
  initAmplitude();
}

export const Amplitude = () => null;
export default amplitude;
