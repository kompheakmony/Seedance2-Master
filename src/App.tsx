/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { 
  Upload, Video, Languages, Download, Loader2, 
  AlertCircle, Info, MessageSquare, 
  Eye, Activity, FileText, Clipboard, Copy, Sliders, Zap,
  Cat, Clapperboard, Trash2, Film
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { VideoProductionMeta, ShotEntry } from "./types";
import { formatSRTTime, fileToBase64, parseTimeToSeconds } from "./lib/utils";
import { PipelineTracker } from "./components/PipelineTracker";
import { NarrativeView } from "./components/NarrativeView";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [pipelineMode, setPipelineMode] = useState<"analysis" | "story">("analysis");
  const [storyText, setStoryText] = useState<string>(
    "A hilarious, clumsy orange tabby feline tries to sneakily swipe a golden relic from a high-tech modern museum, but keeps tripping over his own oversized trench coat. Suddenly, Sreymom, a sassy, hyperactive silver tabby security guard armed with a flashlight, drops from a vent and catches him red-handed! An extremely comical standoff and funny debate about who deserves the relic begins."
  );

  const [fullDescription, setFullDescription] = useState<string>(
    "A clumsy orange tabby feline in an oversized khaki trench coat attempts a stealthy heist inside a high-tech modern museum exhibit, only to faceplant beside a ruby laser grid before being confronted by a sassy silver tabby security officer dropping upside down from an overhead vent."
  );
  const [videoProductionMeta, setVideoProductionMeta] = useState<VideoProductionMeta>({
    globalStyleLock: "Expressive photorealistic comedy movie lookdev style, rich fur render layers with vibrant cinematic lighting, Pixar/DreamWorks aesthetic with highly expressive character acting.",
    sceneSetup: "A modern, highly detailed museum exhibit at night, comically decorated with funny artifacts. Giant realistic shadows are cast by security lights beaming dynamically through skylights, creating cheerful volumetric rays.",
    characters: "Main Character: Piseth, a clumsy, funny orange tabby feline with giant expressive green eyes. Supporting: Sreymom, a sassy, swift silver tabby security guard wearing a detailed uniform.",
    characterRefs: [
      {
        id: "piseth",
        name: "Piseth",
        description: "A clumsy orange tabby feline with the realistic height and proportions of a standard cat. His coat consists of thick, vibrant ginger fur with high-contrast amber swirl stripes, rendering individual strand fibers and funny fluffy cheeks. He has highly comical, expressive forest-green eyes, silly twitching whiskers, and wears a comical oversized trench coat with detailed realistic fabric textures.",
        isMain: true
      },
      {
        id: "sreymom",
        name: "Sreymom",
        description: "A sassy, hyperactive silver tabby security guard with the realistic height and proportions of a standard cat. She has dense ash-grey stripes over a soft silver coat, featuring giant warning-yellow eyes that widen comically when shocked. She wears an elegant, realistic security uniform with visible fabric fibers and a shiny badge.",
        isMain: false
      }
    ],
    shotTimeline: [
      {
        startTime: "00:00.00",
        endTime: "00:03.00",
        framing: "WIDE ESTABLISHING",
        location: "Museum Main Hall",
        cameraMovement: "Slow high-angle push-in",
        audioCue: "Echoing distant footfalls, mysterious plucked cello rhythm",
        description: "Vast realistic museum interior, while a cheeky mouse steals a piece of cheese from an exhibit under bright security lights.",
        dialogue: "None - Playful suspenseful music and echoing footsteps",
        t2vPrompt: "Wide establishing shot of a modern museum hall with marble floors and vaulted skylights. A lone mouse scurries past a glass display case under sweeping blue security searchlights. The camera executes a slow high-angle push-in over the gleaming floor. Soft ambient moonlight mixed with cool halogen spotlights. [Sound: distant muffled footsteps and delicate plucked cello pizzicato].",
        v2vPrompt: "@video1 controls camera trajectory and timing. @loc1 locks the modern museum hall. Scene Adaptation: Wide establishing shot of the central exhibit. Slow high-angle push-in camera trajectory matching @video1. Sweeping blue security searchlights over polished marble. [Sound: ambient room tone and plucked cello].",
        seedancePrompt: "@video1 controls camera trajectory and timing. @loc1 locks the modern museum hall. Scene Adaptation: Wide establishing shot of the central exhibit. Slow high-angle push-in camera trajectory matching @video1. Sweeping blue security searchlights over polished marble. [Sound: ambient room tone and plucked cello]."
      },
      {
        startTime: "00:03.00",
        endTime: "00:06.50",
        framing: "MEDIUM CLOSE-UP",
        location: "Museum Exhibit Laser Grid",
        cameraMovement: "Stable lateral tracking left with comedic low whip-pan",
        audioCue: "Humming laser grid, comical fabric rip, goofy startled gasp",
        description: "Piseth the orange tabby cat tries to sneakily slide past a laser grid, but trips on his oversized trench coat and faceplants onto the polished floor with a goofy gasp.",
        dialogue: "This artifact is mine... Ooof!",
        t2vPrompt: "Medium close-up shot of Piseth, an anthropomorphic ginger tabby in an oversized khaki trench coat, attempting a stylish tiptoe slide beside a ruby laser grid. His hind foot catches the heavy hem, causing him to comic-book faceplant onto the reflective floor with twitching whiskers and flailing paws. Lateral tracking camera tilts down sharply. Dramatic crimson laser beams casting high-contrast shadows. [Sound: electronic laser hum, rapid fabric swish, sudden goofy faceplant thud].",
        v2vPrompt: "@video1 controls the stumble choreography and camera tracking trajectory. @char1 locks the anthropomorphic ginger tabby character design and oversized trench coat. Scene Adaptation: Medium close-up of @char1 tripping over his trench coat hem while sneaking past the laser grid in @loc1, sliding clumsily onto the polished floor. Lateral tracking camera tilts down with the fall. Crimson laser glow reflecting in amber fur. [Sound: comedic gasp and floor thud].",
        seedancePrompt: "@video1 controls the stumble choreography and camera tracking trajectory. @char1 locks the anthropomorphic ginger tabby character design and oversized trench coat. Scene Adaptation: Medium close-up of @char1 tripping over his trench coat hem while sneaking past the laser grid in @loc1, sliding clumsily onto the polished floor. Lateral tracking camera tilts down with the fall. Crimson laser glow reflecting in amber fur. [Sound: comedic gasp and floor thud]."
      },
      {
        startTime: "00:06.50",
        endTime: "00:10.00",
        framing: "OVER-THE-SHOULDER",
        location: "Museum Exhibit Hall (Vent)",
        cameraMovement: "Rapid vertical tilt down and push-in",
        audioCue: "Metallic vent pop, swift whoosh, sharp flashlight click",
        description: "Sreymom the silver tabby drops upside down from an air vent, landing gracefully right in front of him, resting her hands on a flashlight with a smug grin.",
        dialogue: "Stop right there! You don't belong here.",
        t2vPrompt: "Over-the-shoulder shot looking past Piseth's rumpled coat collar as Sreymom, a sleek silver tabby security officer, drops fluidly from a ceiling duct, landing on agile digitigrade paws directly in front of him. She snaps on a heavy steel flashlight with a confident feline smirk. Camera rapidly tilts down and pushes in to a tight two-shot. Harsh white flashlight beam piercing through dark atmospheric haze. [Sound: sharp metallic vent clang, fluid athletic landing, loud flashlight click].",
        v2vPrompt: "@video1 controls actor drop timing and camera descent trajectory. @char2 locks the silver tabby security officer. @char1 locks the rumpled ginger tabby on the floor. Scene Adaptation: Over-the-shoulder framing as @char2 drops gracefully from the vent in @loc1, aiming her flashlight directly into the frame with a smug expression. Rapid vertical tilt camera trajectory. Piercing volumetric flashlight beam. [Sound: metal vent clang and click].",
        seedancePrompt: "@video1 controls actor drop timing and camera descent trajectory. @char2 locks the silver tabby security officer. @char1 locks the rumpled ginger tabby on the floor. Scene Adaptation: Over-the-shoulder framing as @char2 drops gracefully from the vent in @loc1, aiming her flashlight directly into the frame with a smug expression. Rapid vertical tilt camera trajectory. Piercing volumetric flashlight beam. [Sound: metal vent clang and click]."
      }
    ],
    cameraMotionControl: "Slow comedic panning matching silly footsteps, snappy zoom-ins to amplify humorous reaction shots, and playful dolly tracking.",
    negativePrompt: "low quality, blurry, human faces, smooth texture, dark gritty realistic violence, traditional regional clothing, ancient temples",
    seedanceMode: "V2V"
  });
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [pipelineStep, setPipelineStep] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const getProductionPrompts = (): string[] => {
    const characterRefs = videoProductionMeta.characterRefs || [];
    const MAX_EPISODE_DURATION = 15;
    
    // 1. Group shots into episodes of max 15 seconds
    const episodes: ShotEntry[][] = [];
    let currentEpisode: ShotEntry[] = [];
    let epStartTime = 0;

    videoProductionMeta.shotTimeline.forEach((shot, idx) => {
      const shotStart = parseTimeToSeconds(shot.startTime);
      const shotEnd = parseTimeToSeconds(shot.endTime);

      if (idx === 0) {
        epStartTime = shotStart;
        currentEpisode.push(shot);
      } else {
        // If adding this shot's end time would exceed 15s from episode start
        if (shotEnd - epStartTime > MAX_EPISODE_DURATION && currentEpisode.length > 0) {
          episodes.push(currentEpisode);
          currentEpisode = [shot];
          epStartTime = shotStart;
        } else {
          currentEpisode.push(shot);
        }
      }
    });
    if (currentEpisode.length > 0) episodes.push(currentEpisode);

    // Generate unique locations list
    const uniqueLocations = Array.from(new Set(
      videoProductionMeta.shotTimeline
        .map(shot => shot.location)
        .filter((loc): loc is string => !!loc && loc.trim() !== "")
    ));

    const locationDefinitions = uniqueLocations
      .map((loc, idx) => `@loc${idx + 1}: ${loc} - 3D concept art style environment reference.`)
      .join('\n');

    // 2. Base components (reusable across episodes)
    const assetDefinitions = characterRefs
      .map((char, idx) => `@char${idx + 1}: ${char.name} ${char.isMain ? "(PRIMARY PROTAGONIST)" : ""} - ${char.description}`)
      .join('\n');

    const replaceNamesWithTags = (text: string) => {
      let processed = text || "";
      characterRefs.forEach((char, idx) => {
        if (!char.name) return;
        const escapedName = char.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedName}\\b`, 'gi');
        processed = processed.replace(regex, `@char${idx + 1}`);
      });

      uniqueLocations.forEach((loc, idx) => {
        if (!loc) return;
        const escapedLoc = loc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedLoc}\\b`, 'gi');
        processed = processed.replace(regex, `@loc${idx + 1}`);
      });

      return processed;
    };

    const processedGlobalStyle = replaceNamesWithTags(videoProductionMeta.globalStyleLock);
    const processedScene = replaceNamesWithTags(videoProductionMeta.sceneSetup || fullDescription);
    const processedCamera = replaceNamesWithTags(videoProductionMeta.cameraMotionControl);

    // 3. Generate individual prompts
    return episodes.map((epShots, epIdx) => {
      // Find the absolute index of the first shot in this episode
      const firstShotOfEpisode = epShots[0];
      const absoluteFirstIndex = videoProductionMeta.shotTimeline.findIndex(s => s === firstShotOfEpisode);

      const processedTimeline = epShots.map((shot, idxInEp) => {
        const absoluteIndex = absoluteFirstIndex + idxInEp;
        const prevShot = absoluteIndex > 0 ? videoProductionMeta.shotTimeline[absoluteIndex - 1] : null;
        
        let continuityNote = "";
        if (prevShot) {
          continuityNote = `[CONTINUITY]: Transitions from SHOT ${String(absoluteIndex).padStart(2, '0')} (${prevShot.framing}). Maintain character spatial placement and lighting consistency from the previous state.`;
        }

        return {
          ...shot,
          description: replaceNamesWithTags(shot.description),
          dialogue: replaceNamesWithTags(shot.dialogue),
          seedancePrompt: replaceNamesWithTags(shot.seedancePrompt || ""),
          continuity: replaceNamesWithTags(continuityNote)
        };
      });

      const isMultiEpisode = episodes.length > 1;
      const episodeHeader = isMultiEpisode ? `### EPISODE ${epIdx + 1} OF ${episodes.length} ###\n` : '';

      return `
${episodeHeader}### SEEDANCE 2.0 PRODUCTION PROTOCOL ###
[OBJECTIVE]: Recreate the provided cinematic sequence using high-fidelity anthropomorphic feline assets while maintaining perfect lip-sync and emotional resonance.

[CHARACTER ASSET DEFINITIONS]:
${assetDefinitions}

[LOCATION ASSET DEFINITIONS]:
${locationDefinitions || "None defined"}

[GLOBAL STYLE LOCK]: ${processedGlobalStyle}
- Unified visual language: Consistent color grading, texture density, and atmospheric scattering.
${isMultiEpisode ? `- MAIN STYLE LOCK & CONTINUITY: This is Episode ${epIdx + 1} of ${episodes.length}. Style properties including color presets, lens chromaticity, render engine configs, details density, and color lookup tables (LUT) must remain absolute and identical to Episode 1.` : ''}

[SCENE SETUP & LIGHTING]: ${processedScene}
- Environment geometry and volumetric lighting parameters.
${isMultiEpisode ? `- GLOBAL SCENE REUSE: This is Episode ${epIdx + 1} of ${episodes.length}. Reuse the exact same physical environment layout, props arrangement, room architecture, and material definitions as Episode 1.\n- VOLUMETRIC LIGHTING CONTINUITY: The direct illumination levels, solar/moon trajectory angles, shadow hardness/softness, volumetric steam/fog dispersion, and light color temperature (Kelvin scale) must perfectly match Episode 1 with zero visual drift.` : ''}

[CHARACTER RIGGING & ASSETS]:
The characters in this production are defined as @char1, @char2, etc. above. 
${characterRefs.some(c => c.isMain) ? `The character designated as MAIN is the primary protagonist and must be the focus of cinematic rendering consistency.` : ''}
Use these references to maintain absolute visual consistency across all shots.
REQUIRED: Individual fur strand rendering, expressive ocular dynamics, and physically accurate character meshes derived from the definitions.

[LOCATION REFERENCES]:
The locations in this production are defined as @loc1, @loc2, etc. above. Use these reference images to maintain perfect environment layout and lighting consistency across shots.

[SHOT TIMELINE]:
${processedTimeline.map((shot, idx) => {
  const absoluteIndex = absoluteFirstIndex + idx + 1;
  const locIndex = shot.location ? uniqueLocations.indexOf(shot.location) : -1;
  const locationTag = locIndex !== -1 ? `@loc${locIndex + 1}` : (shot.location || '');

  // Detect character tags in description, dialogue, or seedancePrompt
  const charTags = characterRefs
    .map((c, i) => `@char${i + 1}`)
    .filter((tag, i) => {
      const charName = characterRefs[i]?.name?.toLowerCase();
      return (
        shot.description.includes(tag) ||
        shot.dialogue.includes(tag) ||
        shot.seedancePrompt.includes(tag) ||
        (charName && (
          shot.description.toLowerCase().includes(charName) ||
          shot.dialogue.toLowerCase().includes(charName) ||
          shot.seedancePrompt.toLowerCase().includes(charName)
        ))
      );
    });

  const refTags = [...charTags, ...(locationTag ? [locationTag] : [])];
  const refLine = refTags.length > 0 ? `Reference Images: ${refTags.join(', ')}` : '';

  return `SHOT ${String(absoluteIndex).padStart(2, '0')} [${shot.startTime} - ${shot.endTime}] | ${shot.framing}${locationTag ? ` | Location: ${locationTag}` : ''}
${refLine ? `${refLine}\n` : ''}${shot.continuity ? `${shot.continuity}\n` : ''}Description: ${shot.description}
${shot.dialogue ? `Dialogue: ${shot.dialogue}\n` : ''}${shot.seedancePrompt ? `Seedance Prompt: ${shot.seedancePrompt}` : ''}`.trimEnd();
}).join('\n---\n')}
- Temporal coherence between shots.
- MANDATORY: Fluid physical transitions and spatial anchors between consecutive camera positions.

[CAMERA + MOTION CONTROL]: ${processedCamera}
- Lens specifications (focal length, depth of field) and camera motion paths.

[NEGATIVE PROMPT]: ${videoProductionMeta.negativePrompt}
- Strict filtering of artifacts, jitter, and non-cinematic elements.

[CRITICAL DIRECTIVE]: Perform deep-layer analysis of the phonemes in the audio track to drive the character's facial mesh. MOUTH MOVEMENTS MUST BE PHYSICALLY ACCURATE TO THE DIALOGUE.
      `.trim();
    });
  };

  const downloadPrompt = () => {
    const prompts = getProductionPrompts();
    prompts.forEach((prompt, idx) => {
      const blob = new Blob([prompt], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `seedance_prompt_ep${idx + 1}_${new Date().getTime()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      
      // Cleanup previous URL if it exists
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
      
      setFile(selectedFile);
      setVideoUrl(URL.createObjectURL(selectedFile));
      setError(null);
      setStatus("");
    }
  };



  const processVideo = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setPipelineStep(1);
    setStatus("1/3: Analyzing audio-visual references...");

    try {
      const base64Video = await fileToBase64(file);

      setPipelineStep(2);
      setStatus("2/3: Formulating character lookdev & scene setup...");

      const response = await fetch("/api/process-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoData: base64Video,
          videoType: file.type,
        }),
      });

      if (!response.ok) {
        let errMsg = "Pipeline failed on server side.";
        try {
          const errData = await response.json();
          errMsg = errData.error || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }

      const result = await response.json();
      
      const isNewSchema = !!result.shots;
      const parsedFullDescription = result.sceneSummary || result.fullSceneDescription || "";
      
      setFullDescription(parsedFullDescription);
      
      if (isNewSchema) {
        setVideoProductionMeta({
          globalStyleLock: videoProductionMeta.globalStyleLock,
          sceneSetup: videoProductionMeta.sceneSetup,
          characters: "Extracted from video reference.",
          characterRefs: (result.characters || []).map((c: any, i: number) => ({
            id: c.id || `char${i + 1}`,
            name: c.id || `Character ${i + 1}`,
            description: `${c.role ? `[Role: ${c.role}] ` : ''}${c.description || ''}`,
            isMain: c.id?.toLowerCase().includes('main') || c.role?.toLowerCase().includes('main') || i === 0
          })),
          shotTimeline: (result.shots || []).map((s: any) => ({
            startTime: s.start || "00:00.00",
            endTime: s.end || "00:00.00",
            framing: s.framing || "MATCH ORIGINAL",
            location: s.location || "",
            cameraMovement: s.cameraMovement || "Match original camera trajectory",
            audioCue: s.audioCue || "",
            description: s.description || "",
            dialogue: s.dialogue || "",
            v2vPrompt: s.v2vPrompt || s.seedancePrompt || "",
            t2vPrompt: s.t2vPrompt || "",
            seedancePrompt: s.seedancePrompt || s.v2vPrompt || ""
          })),
          cameraMotionControl: "Match original video motion kinematics.",
          negativePrompt: result.negativePrompt || videoProductionMeta.negativePrompt,
          seedanceMode: "V2V"
        });
      } else {
        const parsedMeta = result.productionMeta || {};
        if (parsedMeta.globalStyleLock) {
          setVideoProductionMeta({
            globalStyleLock: parsedMeta.globalStyleLock || videoProductionMeta.globalStyleLock,
            sceneSetup: parsedMeta.sceneSetup || "",
            characters: parsedMeta.characters || "",
            characterRefs: parsedMeta.characterRefs || [],
            shotTimeline: (parsedMeta.shotTimeline || videoProductionMeta.shotTimeline).map((s: any) => ({
              ...s,
              v2vPrompt: s.v2vPrompt || s.seedancePrompt || "",
              t2vPrompt: s.t2vPrompt || "",
              seedancePrompt: s.seedancePrompt || s.v2vPrompt || ""
            })),
            cameraMotionControl: parsedMeta.cameraMotionControl || videoProductionMeta.cameraMotionControl,
            negativePrompt: parsedMeta.negativePrompt || videoProductionMeta.negativePrompt,
            seedanceMode: "V2V"
          });
        }
      }
      
      setPipelineStep(3);
      setStatus("Production blueprint successfully generated!");
      
      setTimeout(() => {
        setPipelineStep(0);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Pipeline failed during video analysis.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateStory = async () => {
    if (!storyText.trim()) return;
    setLoading(true);
    setError(null);
    setPipelineStep(1);
    setStatus("1/3: Analyzing story structure & theme...");

    try {
      setPipelineStep(2);
      setStatus("2/3: Mapping character refs & storyboard timeline...");

      const response = await fetch("/api/generate-from-story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          story: storyText,
        }),
      });

      if (!response.ok) {
        let errMsg = "Story generation failed on server side.";
        try {
          const errData = await response.json();
          errMsg = errData.error || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }

      const result = await response.json();
      const parsedFullDescription = result.fullSceneDescription || "";
      const parsedMeta = result.productionMeta || {};

      setFullDescription(parsedFullDescription);
      
      if (parsedMeta.globalStyleLock) {
        setVideoProductionMeta({
          globalStyleLock: parsedMeta.globalStyleLock || videoProductionMeta.globalStyleLock,
          sceneSetup: parsedMeta.sceneSetup || "",
          characters: parsedMeta.characters || "",
          characterRefs: parsedMeta.characterRefs || [],
          shotTimeline: (parsedMeta.shotTimeline || videoProductionMeta.shotTimeline).map((s: any) => ({
            ...s,
            t2vPrompt: s.t2vPrompt || s.seedancePrompt || "",
            v2vPrompt: s.v2vPrompt || "",
            seedancePrompt: s.seedancePrompt || s.t2vPrompt || ""
          })),
          cameraMotionControl: parsedMeta.cameraMotionControl || videoProductionMeta.cameraMotionControl,
          negativePrompt: parsedMeta.negativePrompt || videoProductionMeta.negativePrompt,
          seedanceMode: "T2V"
        });
      }
      
      setPipelineStep(3);
      setStatus("Creative slate generated successfully. Review timeline below.");
      
      setTimeout(() => {
        setPipelineStep(0);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Pipeline failed during script generation.");
    } finally {
      setLoading(false);
    }
  };

  const downloadFullScript = () => {
    let script = "DIRECTOR'S PRODUCTION BLUEPRINT\n";
    script += "===============================\n\n";

    script += `FULL SCENE NARRATIVE:\n${fullDescription || "N/A"}\n\n`;
    script += `GLOBAL STYLE LOCK:\n${videoProductionMeta.globalStyleLock}\n\n`;
    script += `SCENE SETUP & LIGHTING:\n${videoProductionMeta.sceneSetup}\n\n`;
    script += `CHARACTERS OVERVIEW:\n${videoProductionMeta.characters}\n\n`;

    script += "CHARACTER DETAILS:\n";
    videoProductionMeta.characterRefs.forEach((char) => {
      script += `- ${char.name} (${char.isMain ? "Main" : "Support"}): ${char.description}\n`;
    });
    script += "\n";

    script += `SEEDANCE 2.0 ARCHITECTURAL MODE: ${videoProductionMeta.seedanceMode || "V2V"}\n\n`;

    script += "SHOT STORYBOARD TIMELINE (SEEDANCE 2.0 SKILL OS):\n";
    videoProductionMeta.shotTimeline.forEach((shot, i) => {
      script += `SHOT ${String(i + 1).padStart(2, "0")} [${shot.startTime} - ${shot.endTime}]\n`;
      script += `  FRAMING: ${shot.framing}\n`;
      if (shot.location) script += `  LOCATION: ${shot.location}\n`;
      if (shot.cameraMovement) script += `  CAMERA KINEMATICS: ${shot.cameraMovement}\n`;
      if (shot.audioCue) script += `  AUDIO / SOUND INTENT: ${shot.audioCue}\n`;
      script += `  ACTION: ${shot.description}\n`;
      if (shot.dialogue) script += `  DIALOGUE: ${shot.dialogue}\n`;
      if (shot.v2vPrompt) script += `  SEEDANCE 2.0 V2V PROMPT: ${shot.v2vPrompt}\n`;
      if (shot.t2vPrompt) script += `  SEEDANCE 2.0 T2V PROMPT: ${shot.t2vPrompt}\n`;
      else if (shot.seedancePrompt) script += `  SEEDANCE PROMPT: ${shot.seedancePrompt}\n`;
      script += `--------------------------------------------------\n\n`;
    });

    script += `CAMERA MOTION CONTROL:\n${videoProductionMeta.cameraMotionControl}\n`;
    script += `NEGATIVE PROMPT (ANTI-SLOP):\n${videoProductionMeta.negativePrompt}\n`;

    const blob = new Blob([script], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "seedance2-production-blueprint.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyScriptToClipboard = () => {
    let script = "SEEDANCE 2.0 PRODUCTION BLUEPRINT (EMILY2040 SKILL OS)\n";
    script += "=======================================================\n\n";

    script += `FULL SCENE NARRATIVE:\n${fullDescription || "N/A"}\n\n`;
    script += `GLOBAL STYLE LOCK:\n${videoProductionMeta.globalStyleLock}\n\n`;
    script += `SCENE SETUP & LIGHTING:\n${videoProductionMeta.sceneSetup}\n\n`;
    script += `CHARACTERS OVERVIEW:\n${videoProductionMeta.characters}\n\n`;

    script += "CHARACTER DETAILS:\n";
    videoProductionMeta.characterRefs.forEach((char) => {
      script += `- ${char.name} (${char.isMain ? "Main" : "Support"}): ${char.description}\n`;
    });
    script += "\n";

    script += "SHOT STORYBOARD TIMELINE (SEEDANCE 2.0):\n";
    videoProductionMeta.shotTimeline.forEach((shot, i) => {
      script += `SHOT ${String(i + 1).padStart(2, "0")} [${shot.startTime} - ${shot.endTime}]\n`;
      script += `  FRAMING: ${shot.framing}\n`;
      if (shot.location) script += `  LOCATION: ${shot.location}\n`;
      if (shot.cameraMovement) script += `  CAMERA: ${shot.cameraMovement}\n`;
      if (shot.audioCue) script += `  SOUND: ${shot.audioCue}\n`;
      script += `  ACTION: ${shot.description}\n`;
      if (shot.dialogue) script += `  DIALOGUE: ${shot.dialogue}\n`;
      if (shot.v2vPrompt) script += `  V2V PROMPT: ${shot.v2vPrompt}\n`;
      if (shot.t2vPrompt) script += `  T2V PROMPT: ${shot.t2vPrompt}\n`;
      script += `--------------------------------------------------\n`;
    });

    navigator.clipboard.writeText(script);
    setStatus("Copied to clipboard!");
    setTimeout(() => setStatus(""), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans selection:bg-indigo-100">
      {/* Header */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="bg-slate-900 p-2.5 rounded-xl text-white shadow-md shadow-slate-900/10">
              <Clapperboard className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none">
                  Seedance Studio
                </h1>
                <span className="text-[9px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200/60">
                  Skill OS 2.0
                </span>
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mt-0.5">
                AI Cinema Direction & Storyboard Deck
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {loading && (
              <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 transition-all">
                <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Processing Engine</span>
              </div>
            )}
            <button
              type="button"
              onClick={copyScriptToClipboard}
              className="px-3 py-1.5 text-slate-600 hover:text-indigo-700 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl transition-all flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider shadow-xs cursor-pointer"
              title="Copy Complete Screenplay & Production Blueprint"
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Copy Blueprint</span>
            </button>
            <button
              type="button"
              onClick={downloadFullScript}
              className="px-3 py-1.5 text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider shadow-xs cursor-pointer"
              title="Download Full Blueprint File"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Export Blueprint</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Video & Controls */}
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
            {/* Mode Switcher */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white flex-wrap gap-2">
              <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-slate-700">
                <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                <span>Production Mode</span>
              </h2>
              
              <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/80 shrink-0">
                <button
                  type="button"
                  onClick={() => setPipelineMode("analysis")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    pipelineMode === "analysis"
                      ? "bg-white text-indigo-700 shadow-xs font-black"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  V2V (Video Donor)
                </button>
                <button
                  type="button"
                  onClick={() => setPipelineMode("story")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    pipelineMode === "story"
                      ? "bg-white text-indigo-700 shadow-xs font-black"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  T2V (Scene Premise)
                </button>
              </div>
            </div>

            {pipelineMode === "analysis" ? (
              <>
                <div className="p-5 pb-0">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Direct Preview</label>
                    {file && <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-mono italic max-w-[150px] truncate">{file.name}</span>}
                  </div>
                  <div className="aspect-video bg-slate-950 relative group flex items-center justify-center rounded-2xl overflow-hidden shadow-inner border border-slate-200">
                    {videoUrl ? (
                      <video 
                        key={videoUrl}
                        ref={videoRef}
                        src={videoUrl} 
                        controls 
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-700">
                        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-3 border border-white/5">
                          <Video className="w-6 h-6 opacity-20 text-white" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-35">Waiting for Signal</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  <div className="w-full">
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-indigo-400 hover:bg-slate-50/50 transition-all cursor-pointer relative group">
                      <input 
                        type="file" 
                        accept="video/*" 
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <Video className="w-6 h-6 text-indigo-600" />
                      </div>
                      <p className="text-xs font-black text-slate-700 uppercase tracking-widest">Import Reference Video (@video1)</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">Extracts motion donor, camera framing, and shot timecodes</p>
                    </div>
                  </div>

                  {file && (
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0 border border-slate-200">
                          <Video className="w-4 h-4 text-indigo-500" />
                        </div>
                        <span className="text-xs font-bold text-slate-600 truncate">{file.name}</span>
                      </div>
                      <button onClick={() => { setFile(null); setVideoUrl(null); }} className="text-slate-300 hover:text-red-500 transition-colors p-1 cursor-pointer">
                        <AlertCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="space-y-3">
                    <button
                      onClick={processVideo}
                      disabled={!file || loading}
                      className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-[0.15em] text-xs flex items-center justify-center gap-3 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 transition-all shadow-md shadow-slate-900/10 active:scale-[0.98] cursor-pointer"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4 text-emerald-400" />}
                      {loading ? "Extracting Motion & Timing..." : "Analyze & Generate V2V Slate"}
                    </button>
                  </div>

                  <PipelineTracker status={status} loading={loading} pipelineStep={pipelineStep} />

                  {error && (
                    <div className="mt-4 p-5 bg-red-50 rounded-2xl border border-red-100 flex gap-4">
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                      <p className="text-xs text-red-800 font-bold leading-relaxed">{error}</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-8 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                      Scene Premise (T2V Deconstruction)
                    </label>
                    <span className="text-[9px] bg-indigo-50 font-bold text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200/60 font-mono">
                      6-Step T2V Engine
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    Input any dramatic premise. The Seedance 2.0 engine deconstructs it into the 6-step prompt standard ([Framing] → [Subject] → [Action] → [Environment] → [Camera Kinematics] → [Lighting & Audio]).
                  </p>
                  
                  {/* Interactive Seedance 2.0 Presets Row */}
                  <div className="flex flex-col gap-2 pt-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                      Production Presets:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setStoryText("A clumsy orange tabby feline in an oversized khaki trench coat attempts a stealthy heist inside a high-tech modern museum exhibit, only to faceplant beside a ruby laser grid before being confronted by a sassy silver tabby security officer dropping upside down from an overhead vent.")}
                        className="p-2.5 text-left text-[10px] font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-2xs flex items-center gap-2 cursor-pointer group"
                      >
                        <span className="text-sm shrink-0 group-hover:scale-110 transition-transform">🏛️</span>
                        <div className="leading-snug min-w-0">
                          <p className="font-black text-indigo-700 truncate">Museum Heist</p>
                          <p className="text-[8px] text-slate-400 mt-0.5 font-normal truncate">Laser grid faceplant</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setStoryText("An agile ginger tabby feline courier wearing a neon-glowing tactical harness sprints across rain-soaked rooftops in a dense cyberpunk metropolis at midnight. Three hovering surveillance drones sweep red searchlights across steam vents as he leaps across a 20-foot alleyway chasm.")}
                        className="p-2.5 text-left text-[10px] font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-2xs flex items-center gap-2 cursor-pointer group"
                      >
                        <span className="text-sm shrink-0 group-hover:scale-110 transition-transform">🏙️</span>
                        <div className="leading-snug min-w-0">
                          <p className="font-black text-indigo-700 truncate">Cyberpunk Sprint</p>
                          <p className="text-[8px] text-slate-400 mt-0.5 font-normal truncate">Neon rooftop chase</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setStoryText("On the wind-blasted roof of a high-speed magnetic bullet train speeding through snow-capped alpine peaks, a rugged brown tabby operative in tactical snow goggles confronts a masked rogue agent guarding an encrypted metallic data drive during an icy blizzard sunset.")}
                        className="p-2.5 text-left text-[10px] font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-2xs flex items-center gap-2 cursor-pointer group"
                      >
                        <span className="text-sm shrink-0 group-hover:scale-110 transition-transform">🚄</span>
                        <div className="leading-snug min-w-0">
                          <p className="font-black text-indigo-700 truncate">Train Standoff</p>
                          <p className="text-[8px] text-slate-400 mt-0.5 font-normal truncate">Blizzard rooftop clash</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={4}
                    value={storyText}
                    onChange={(e) => setStoryText(e.target.value)}
                    placeholder="Describe your scene in detail..."
                    className="w-full mt-2 p-3.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none resize-none transition-all leading-relaxed shadow-inner"
                  />
                </div>

                <div className="bg-indigo-50/70 border border-indigo-100 p-3.5 rounded-xl flex gap-2.5 text-indigo-800">
                  <Zap className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] sm:text-[11px] font-medium leading-normal">
                    Automatically extracts photorealistic feline lookdev, generates @char & @loc asset tags, token-budgeted shot prompts (60-100 words), and camera kinematics.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleGenerateStory}
                    disabled={!storyText.trim() || loading}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-[0.15em] text-xs flex items-center justify-center gap-3 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 transition-all shadow-md shadow-slate-900/10 active:scale-[0.98] cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clapperboard className="w-4 h-4 text-emerald-400" />}
                    {loading ? "Deconstructing 6-Step Prompts..." : "Deconstruct & Generate T2V Slate"}
                  </button>
                </div>

                <PipelineTracker status={status} loading={loading} pipelineStep={pipelineStep} />

                {error && (
                  <div className="mt-4 p-5 bg-red-50 rounded-2xl border border-red-100 flex gap-4">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <p className="text-xs text-red-800 font-bold leading-relaxed">{error}</p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Activity Summary Info */}
          {fullDescription && (
            <section className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-200">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                <Sliders className="w-3 h-3 text-indigo-400" />
                Session Summary
              </h3>
              <div className="space-y-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-bold capitalize">Storyboard Shots</span>
                  <span className="font-mono bg-slate-100 px-3 py-1 rounded-lg text-indigo-600 font-black">{videoProductionMeta.shotTimeline.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-bold capitalize">Ensemble Cast</span>
                  <span className="font-mono bg-slate-100 px-3 py-1 rounded-lg text-indigo-600 font-black">{videoProductionMeta.characterRefs.length} Tabby Roles</span>
                </div>
                <div className="grid grid-cols-1 gap-3 pt-2">
                  <button 
                    onClick={downloadFullScript}
                    className="w-full flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 py-4 rounded-2xl hover:bg-emerald-100 transition-all border border-emerald-100/50 hover:scale-[1.01] duration-200"
                  >
                    <FileText className="w-4 h-4" />
                    Download Production Blueprint
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Narrative & Shot Timeline Workspace */}
        <div className="lg:col-span-7 space-y-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 text-slate-500">
              <Film className="w-4 h-4 text-indigo-600" />
              <span>Seedance 2.0 Studio Workspace</span>
            </h2>
          </div>

          <div className="space-y-6 max-h-[calc(100vh-220px)] overflow-y-auto pr-2 custom-scrollbar">
            {!fullDescription && !loading && (
              <div className="bg-white rounded-[3rem] border border-slate-200 border-dashed p-24 text-center">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-100 shadow-inner">
                  <Activity className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="text-xl font-display font-bold text-slate-900 mb-2">No Signal Detected</h3>
                <p className="text-slate-400 text-sm font-medium max-w-[280px] mx-auto leading-relaxed">
                  Import a reference video or draft a story premise to generate a production blueprint.
                </p>
              </div>
            )}

            {fullDescription && (
              <NarrativeView 
                fullDescription={fullDescription}
                setFullDescription={setFullDescription}
                productionMeta={videoProductionMeta}
                setProductionMeta={setVideoProductionMeta}
                onDownloadPrompt={downloadPrompt}
                onCopyAll={(text) => {
                   navigator.clipboard.writeText(text);
                   setStatus("Prompt copied to clipboard!");
                   setTimeout(() => setStatus(""), 3000);
                }}
                productionPrompts={getProductionPrompts()}
              />
            )}
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #CBD5E1;
        }
        .custom-scrollbar-dark::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-track {
          background: #1a1b1e;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
}
