/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ShotEntry {
  startTime: string;
  endTime: string;
  framing: string;
  location?: string;
  description: string;
  dialogue: string;
  seedancePrompt?: string;
  t2vPrompt?: string;
  v2vPrompt?: string;
  cameraMovement?: string;
  audioCue?: string;
  imageUrl?: string; // Storyboard conceptual outline frame
  isGeneratingImage?: boolean; // Loading state for Image synthesis
  hasWebImageError?: boolean; // Flag to render fallback cinematic sketch
}

export interface CharacterRef {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  isGenerating?: boolean;
  isMain?: boolean;
}

export interface VideoProductionMeta {
  globalStyleLock: string;
  sceneSetup: string;
  characters: string;
  characterRefs?: CharacterRef[];
  shotTimeline: ShotEntry[];
  cameraMotionControl: string;
  negativePrompt: string;
  seedanceMode?: "T2V" | "V2V";
}
