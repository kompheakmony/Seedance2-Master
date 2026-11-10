/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VoiceProfile {
  id: string;
  name: string;
  gender: 'male' | 'female';
  description: string;
  isPrebuilt: boolean;
}

export const PREBUILT_VOICES: VoiceProfile[] = [
  { id: 'km-KH-PisethNeural', name: 'Piseth (Edge)', gender: 'male', description: 'General Khmer AI voice (Male) via Microsoft Edge.', isPrebuilt: true },
  { id: 'km-KH-SreymomNeural', name: 'Sreymon (Edge)', gender: 'female', description: 'General Khmer AI voice (Female) via Microsoft Edge.', isPrebuilt: true },
  { id: 'Charon', name: 'Charon', gender: 'male', description: 'Deep, resonant authority for heroic leads.', isPrebuilt: true },
  { id: 'Kore', name: 'Kore', gender: 'female', description: 'Warm, empathetic, and clear narrative voice.', isPrebuilt: true },
  { id: 'Puck', name: 'Puck', gender: 'male', description: 'Quick, youthful, and energetic performance.', isPrebuilt: true },
  { id: 'Aoede', name: 'Aoede', gender: 'female', description: 'Lyrical, smooth, and perfectly balanced.', isPrebuilt: true },
  { id: 'Fenrir', name: 'Fenrir', gender: 'male', description: 'Gritty, textured, and rough-hewn character.', isPrebuilt: true },
  { id: 'Hestia', name: 'Hestia', gender: 'female', description: 'Matriarchal, steady, and comforting tone.', isPrebuilt: true }
];
