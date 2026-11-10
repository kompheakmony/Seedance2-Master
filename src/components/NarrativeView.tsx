/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Copy,
  Loader2,
  Wand2,
  Cat,
  Activity,
  Download,
  Zap,
  Trash2,
  Eye,
  Sliders,
  ChevronDown,
  Camera,
  Map,
  Star,
  User,
  Crown,
  BookOpen,
  X,
  Layers,
  Volume2,
  Video,
  Info,
  ExternalLink,
  Check,
  Film,
} from "lucide-react";
import {
  VideoProductionMeta,
  ShotEntry,
  CharacterRef,
} from "../types";
import { formatSRTTime } from "../lib/utils";

interface NarrativeViewProps {
  fullDescription: string;
  setFullDescription: (desc: string) => void;
  productionMeta: VideoProductionMeta;
  setProductionMeta: (meta: VideoProductionMeta) => void;
  onCopyAll: (text: string) => void;
  onDownloadPrompt: () => void;
  productionPrompts: string[];
}

// Compact Viewfinder Mockup for Hollywood camera grid representation
const ViewfinderMockup: React.FC<{
  shot: ShotEntry;
  index: number;
}> = ({ shot, index }) => {
  return (
    <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-850 flex flex-col items-center justify-center text-center select-none shadow-inner p-4">
      {/* Viewfinder corner brackets */}
      <div className="absolute top-4 left-4 w-3.5 h-3.5 border-t-2 border-l-2 border-slate-600/80 pointer-events-none" />
      <div className="absolute top-4 right-4 w-3.5 h-3.5 border-t-2 border-r-2 border-slate-600/80 pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-3.5 h-3.5 border-b-2 border-l-2 border-slate-600/80 pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-3.5 h-3.5 border-b-2 border-r-2 border-slate-600/80 pointer-events-none" />

      {/* Center focus indicator */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center pointer-events-none opacity-40">
        <div className="w-8 h-px bg-slate-500" />
      </div>
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex flex-col justify-center pointer-events-none opacity-40">
        <div className="h-8 w-px bg-slate-500" />
      </div>

      {/* Cinematic rule-of-thirds helper lines */}
      <div className="absolute inset-y-0 left-1/3 w-px bg-slate-900/40 pointer-events-none" />
      <div className="absolute inset-y-0 right-1/3 w-px bg-slate-900/40 pointer-events-none" />
      <div className="absolute inset-x-0 top-1/3 h-px bg-slate-900/40 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-1/3 h-px bg-slate-900/40 pointer-events-none" />

      {/* Focal details / camera overlay HUD */}
      <div className="absolute top-3 left-6 text-[8px] font-mono font-bold text-slate-500 tracking-wider">
        CAM GRID [ACTIVE]
      </div>
      <div className="absolute top-3 right-6 text-[8px] font-mono font-bold text-slate-500 tracking-widest">
        SH_{String(index + 1).padStart(2, "0")} FPS_24
      </div>
      <div className="absolute bottom-3 left-6 text-[8px] font-mono text-slate-500 font-bold">
        CAM_
        {shot.framing
          ? shot.framing.substring(0, 12).toUpperCase().replace(/\s+/g, "_")
          : "WIDE_ANGLE"}
      </div>
      <div className="absolute bottom-3 right-6 text-[8px] font-mono font-bold text-slate-500 tracking-wide">
        F_8.0 35MM
      </div>

      <div className="flex flex-col items-center gap-2.5 p-4">
        <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
          <Camera className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
            Physical Frame Guide
          </h4>
          <p className="text-[8px] font-medium text-slate-500 max-w-[185px] leading-relaxed mx-auto">
            {shot.framing
              ? `Framing set to "${shot.framing}"`
              : "Director's composition aspect frame helper."}
          </p>
        </div>
      </div>
    </div>
  );
};

export const NarrativeView: React.FC<NarrativeViewProps> = ({
  fullDescription,
  setFullDescription,
  productionMeta,
  setProductionMeta,
  onCopyAll,
  onDownloadPrompt,
  productionPrompts,
}) => {
  const updateMeta = (field: keyof VideoProductionMeta, value: any) => {
    setProductionMeta({ ...productionMeta, [field]: value });
  };

  const updateShot = (index: number, field: keyof ShotEntry, value: any) => {
    const newTimeline = [...productionMeta.shotTimeline];
    newTimeline[index] = { ...newTimeline[index], [field]: value };
    setProductionMeta({ ...productionMeta, shotTimeline: newTimeline });
  };

  const addShot = () => {
    setProductionMeta({
      ...productionMeta,
      shotTimeline: [
        ...productionMeta.shotTimeline,
        {
          startTime: "00:00.00",
          endTime: "00:00.00",
          framing: "NEW SHOT",
          location: "",
          description: "",
          dialogue: "",
        },
      ],
    });
  };

  const removeShot = (index: number) => {
    const newTimeline = productionMeta.shotTimeline.filter(
      (_, i) => i !== index,
    );
    setProductionMeta({ ...productionMeta, shotTimeline: newTimeline });
  };

  const updateCharacterRef = (
    index: number,
    field: keyof CharacterRef,
    value: string,
  ) => {
    const newRefs = [...(productionMeta.characterRefs || [])];
    newRefs[index] = { ...newRefs[index], [field]: value };
    setProductionMeta({ ...productionMeta, characterRefs: newRefs });
  };

  const [copiedStates, setCopiedStates] = useState<{ [key: string]: string }>(
    {},
  );
  const [showSkillGuide, setShowSkillGuide] = useState(false);
  const [skillGuideTab, setSkillGuideTab] = useState<"V2V" | "T2V" | "CAMERA" | "ANTISLOP">("V2V");
  const [activeGlobalMode, setActiveGlobalMode] = useState<"V2V" | "T2V">(productionMeta.seedanceMode || "V2V");
  const [shotModeOverrides, setShotModeOverrides] = useState<{ [index: number]: "V2V" | "T2V" }>({});
  const [activeStudioTab, setActiveStudioTab] = useState<"timeline" | "characters" | "locations" | "slate">("timeline");

  const getWordCount = (text: string) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const uniqueLocations = Array.from(
    new Set(
      productionMeta.shotTimeline
        .map((shot) => shot.location)
        .filter((loc): loc is string => !!loc && loc.trim() !== ""),
    ),
  );

  const getShotReferences = (shot: ShotEntry) => {
    const refs: string[] = [];
    
    // Character references
    (productionMeta.characterRefs || []).forEach((char, charIdx) => {
      const tag = `@char${charIdx + 1}`;
      const name = char.name?.toLowerCase();
      const desc = (shot.description || "").toLowerCase();
      const dial = (shot.dialogue || "").toLowerCase();
      const seedance = (shot.seedancePrompt || "").toLowerCase();

      if (
        (name && (desc.includes(name) || dial.includes(name) || seedance.includes(name))) ||
        shot.description.includes(tag) ||
        shot.dialogue.includes(tag) ||
        (shot.seedancePrompt && shot.seedancePrompt.includes(tag))
      ) {
        refs.push(`${tag} (${char.name || 'Character ' + (charIdx + 1)})`);
      }
    });

    // Location reference
    if (shot.location) {
      const locIdx = uniqueLocations.indexOf(shot.location);
      if (locIdx !== -1) {
        refs.push(`@loc${locIdx + 1} (${shot.location})`);
      }
    } else {
      uniqueLocations.forEach((loc, locIdx) => {
        const tag = `@loc${locIdx + 1}`;
        const locName = loc.toLowerCase();
        const desc = (shot.description || "").toLowerCase();
        const seedance = (shot.seedancePrompt || "").toLowerCase();
        if (
          desc.includes(locName) ||
          seedance.includes(locName) ||
          shot.description.includes(tag) ||
          (shot.seedancePrompt && shot.seedancePrompt.includes(tag))
        ) {
          refs.push(`${tag} (${loc})`);
        }
      });
    }

    return Array.from(new Set(refs));
  };

  const handleCopyPrompt = (
    charId: string,
    type: string,
    promptText: string,
  ) => {
    navigator.clipboard.writeText(promptText);
    const key = `${charId}-${type}`;
    setCopiedStates((prev) => ({ ...prev, [key]: "Copied! ✓" }));
    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [key]: "" }));
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full relative"
    >
      {/* Seedance 2.0 Skill OS Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-indigo-600">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-black tracking-wider uppercase">
              Seedance 2.0 Skill OS
            </span>
          </div>

          {/* Mode Switcher Pill: V2V vs T2V */}
          <div className="inline-flex items-center bg-slate-200/80 p-0.5 rounded-xl text-[9px] font-black uppercase tracking-wider">
            <button
              type="button"
              onClick={() => {
                setActiveGlobalMode("V2V");
                updateMeta("seedanceMode", "V2V");
              }}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeGlobalMode === "V2V"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Video-to-Video: Motion & Camera Donor binding with reference assets"
            >
              <Video className="w-3 h-3" />
              <span>V2V (Ref-Transfer)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveGlobalMode("T2V");
                updateMeta("seedanceMode", "T2V");
              }}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeGlobalMode === "T2V"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Text-to-Video: Standalone 6-Step Cinematic Generation"
            >
              <Layers className="w-3 h-3" />
              <span>T2V (6-Step Text)</span>
            </button>
          </div>

          {/* Seedance Skill Guide Button */}
          <button
            type="button"
            onClick={() => setShowSkillGuide(true)}
            className="px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Open Emily2040 Seedance 2.0 Skill Guide (T2V, V2V, Camera Kinematics & Rules)"
          >
            <BookOpen className="w-3 h-3 text-indigo-500" />
            <span>Seedance 2.0 Skills Guide 📖</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onDownloadPrompt}
            title="Download Production Prompt"
            className="px-3 py-1.5 text-slate-600 hover:text-emerald-700 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl transition-all flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Export Script</span>
          </button>
          <button
            onClick={() => onCopyAll(productionPrompts[0] || "")}
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-xl border border-slate-200 transition-all cursor-pointer shadow-xs"
            title="Copy Master Prompt"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Studio Deck Tabs Bar */}
      <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-100/90 border-b border-slate-250 overflow-x-auto text-[11px] font-bold shrink-0">
        <button
          type="button"
          onClick={() => setActiveStudioTab("timeline")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeStudioTab === "timeline"
              ? "bg-white text-indigo-700 font-black shadow-xs border border-indigo-250"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <Film className="w-3.5 h-3.5 text-indigo-600" />
          <span>Shot Storyboard</span>
          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
            {productionMeta.shotTimeline.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveStudioTab("characters")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeStudioTab === "characters"
              ? "bg-white text-emerald-700 font-black shadow-xs border border-emerald-250"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <Cat className="w-3.5 h-3.5 text-emerald-600" />
          <span>Cast Lookdev (@char)</span>
          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
            {productionMeta.characterRefs?.length || 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveStudioTab("locations")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeStudioTab === "locations"
              ? "bg-white text-blue-700 font-black shadow-xs border border-blue-250"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <Map className="w-3.5 h-3.5 text-blue-600" />
          <span>Locations (@loc)</span>
          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
            {uniqueLocations.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveStudioTab("slate")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeStudioTab === "slate"
              ? "bg-white text-purple-700 font-black shadow-xs border border-purple-250"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-purple-600" />
          <span>Director's Slate & Style</span>
        </button>
      </div>

      <div className="p-6 overflow-y-auto space-y-8 flex-1 custom-scrollbar bg-slate-50/30">
        {(activeStudioTab === "timeline" || activeStudioTab === "slate") && productionPrompts.length > 1 && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
                Multiple Episodes Detected (Seedance 15s limit)
              </span>
            </div>
            <p className="text-[10px] font-medium text-amber-600/80 leading-relaxed">
              Your production duration exceeds the 15-second Seedance 2 limit.
              We've automatically split it into {productionPrompts.length}{" "}
              episodes for you.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {productionPrompts.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => onCopyAll(productionPrompts[idx])}
                  className="flex items-center justify-between gap-2 bg-white border border-amber-200 px-3 py-2 rounded-xl hover:border-amber-400 transition-all group"
                >
                  <span className="text-[10px] font-black text-amber-900">
                    EPISODE {idx + 1}
                  </span>
                  <Copy className="w-3 h-3 text-amber-400 group-hover:text-amber-600 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Director's Slate: Global Style Lock & Negative Prompt */}
        {activeStudioTab === "slate" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 rounded-2xl p-5 border border-white/5 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <span>Global Style Lock</span>
              </div>
              <textarea
                value={productionMeta.globalStyleLock}
                onChange={(e) => updateMeta("globalStyleLock", e.target.value)}
                className="w-full bg-transparent border-none text-white text-xs font-medium outline-none resize-none leading-relaxed h-20"
                placeholder="Define the visual aesthetic..."
              />
            </div>
            <div className="bg-slate-900 rounded-2xl p-5 border border-white/5 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>Negative Prompt (Anti-Slop Guard)</span>
              </div>
              <textarea
                value={productionMeta.negativePrompt}
                onChange={(e) => updateMeta("negativePrompt", e.target.value)}
                className="w-full bg-transparent border-none text-white text-xs font-medium outline-none resize-none leading-relaxed h-20"
                placeholder="Elements to avoid..."
              />
            </div>
          </div>
        )}

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-wrap justify-between items-center gap-3 bg-slate-50 -m-6 sm:-m-8 mb-6 p-6 sm:p-8 border-b border-slate-100">
            <div>
              <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1">
                {activeStudioTab === "timeline" && "Shot Storyboard & Continuity"}
                {activeStudioTab === "characters" && "Cast Lookdev & Character References (@char)"}
                {activeStudioTab === "locations" && "Locations & Scenery Lookdev (@loc)"}
                {activeStudioTab === "slate" && "Camera Kinematics & Full Screenplay"}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase">
                {activeStudioTab === "timeline" && `Seedance 2.0 Shot Progression (${productionMeta.shotTimeline.length} Shots)`}
                {activeStudioTab === "characters" && `Reference-Transfer Contract (${productionMeta.characterRefs?.length || 0} Actors)`}
                {activeStudioTab === "locations" && `Photorealistic Scenery Anchors (${uniqueLocations.length} Environments)`}
                {activeStudioTab === "slate" && "Global Cinema Controls & Master Script"}
              </p>
            </div>
            {activeStudioTab === "characters" && (
              <button
                type="button"
                onClick={() => {
                  const id = `char${(productionMeta.characterRefs?.length || 0) + 1}`;
                  updateMeta("characterRefs", [
                    ...(productionMeta.characterRefs || []),
                    { id, name: `Character ${id}`, description: "Photorealistic domestic tabby cat actor", isMain: false },
                  ]);
                }}
                className="text-[9px] font-black text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-250 transition-all uppercase tracking-wider cursor-pointer shadow-xs"
              >
                + Add Cast Member
              </button>
            )}
            {activeStudioTab === "timeline" && (
              <button
                type="button"
                onClick={addShot}
                className="text-[9px] font-black text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-250 transition-all uppercase tracking-wider cursor-pointer shadow-xs"
              >
                + Add Shot
              </button>
            )}
          </div>

          <div className="space-y-8">
            {activeStudioTab === "locations" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-indigo-500" />
                  </div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight">
                    Scene Setup & Lighting Lookdev
                  </label>
                </div>
                <textarea
                  value={productionMeta.sceneSetup}
                  onChange={(e) => updateMeta("sceneSetup", e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-4 py-4 text-xs font-medium text-slate-700 outline-none focus:border-indigo-400 transition-all min-h-[80px] focus:bg-white shadow-inner"
                  placeholder="Describe the environment architecture and lighting rig..."
                />
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const prompt = `[POSITIVE PROMPT]:
Hyperrealistic cinematic environment photo, professional cinematography, empty location scene setup. High-end lookdev scenery, realistic lighting, 35mm lens, depth of field, atmospheric, natural lighting, extremely detailed architecture and textures, 8k resolution. Location details: ${productionMeta.sceneSetup}. Style: ${productionMeta.globalStyleLock}. Completely empty with no characters, no people, no animals, no felines, pure scenery view.

[NEGATIVE PROMPT]:
felines, cats, animals, characters, people, humans, crowd, actors, creatures, living beings, monsters, blurry, low quality, ${productionMeta.negativePrompt}`;
                      handleCopyPrompt("scene-setup", "location", prompt);
                    }}
                    className={`py-1 px-2.5 rounded-lg text-[8px] font-black uppercase transition-all cursor-pointer flex items-center justify-center gap-1 border ${
                      copiedStates[`scene-setup-location`]
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100 hover:text-indigo-800"
                    }`}
                  >
                    <Map className="w-2.5 h-2.5 shrink-0" />
                    {copiedStates[`scene-setup-location`] || "Copy Location Lookdev Prompt 🗺️"}
                  </button>
                </div>
              </div>
            )}

            {activeStudioTab === "characters" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    <Cat className="w-3 h-3 text-emerald-500" />
                  </div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight">
                    Global character context (text-only fallback)
                  </label>
                </div>
                <textarea
                  value={productionMeta.characters}
                  onChange={(e) => updateMeta("characters", e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-4 py-4 text-xs font-medium text-slate-700 outline-none focus:border-indigo-400 transition-all min-h-[80px] focus:bg-white shadow-inner"
                  placeholder="Specify general feline traits for all characters if not using visual references..."
                />
              </div>
            )}

            {/* Character References for Prompt Tagging */}
            {activeStudioTab === "characters" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                    <Cat className="w-3 h-3 text-indigo-500" />
                  </div>
                  <label className="text-[10px] font-black text-indigo-500 uppercase tracking-tight">
                    Character Asset Tags (@char1, @char2...)
                  </label>
                </div>
                <button
                  onClick={() => {
                    const id = `char${(productionMeta.characterRefs?.length || 0) + 1}`;
                    updateMeta("characterRefs", [
                      ...(productionMeta.characterRefs || []),
                      { id, name: "New Character", description: "" },
                    ]);
                  }}
                  className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg hover:bg-indigo-100 transition-all uppercase tracking-widest"
                >
                  + Add Reference Tag
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(productionMeta.characterRefs || []).map((char, idx) => (
                  <div
                    key={char.id}
                    className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap pb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-md shrink-0 transition-all ${
                            char.isMain
                              ? "bg-amber-500 shadow-amber-200"
                              : "bg-indigo-600 shadow-indigo-100"
                          }`}
                        >
                          @char{idx + 1}
                        </div>
                        <input
                          value={char.name}
                          onChange={(e) =>
                            updateCharacterRef(idx, "name", e.target.value)
                          }
                          className="bg-transparent border-b border-transparent hover:border-slate-200 focus:border-indigo-400 text-xs font-black text-slate-900 outline-none w-28 px-1 py-0.5 transition-all"
                          placeholder="Character Name"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Role Quick-Switch Toggle Button */}
                        <button
                          type="button"
                          onClick={() => {
                            const willBeMain = !char.isMain;
                            const newRefs = (
                              productionMeta.characterRefs || []
                            ).map((c, i) => ({
                              ...c,
                              isMain: i === idx ? willBeMain : (willBeMain ? false : c.isMain),
                            }));
                            updateMeta("characterRefs", newRefs);
                          }}
                          className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 border cursor-pointer shadow-sm ${
                            char.isMain
                              ? "bg-amber-500 text-white border-amber-600 hover:bg-amber-600"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                          }`}
                          title={
                            char.isMain
                              ? "Click to switch role to Supporting Character"
                              : "Click to switch role to Main Protagonist"
                          }
                        >
                          {char.isMain ? (
                            <>
                              <Crown className="w-3 h-3 text-amber-200 fill-amber-200 shrink-0" />
                              <span>Main Protagonist</span>
                            </>
                          ) : (
                            <>
                              <User className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>Supporting</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const newRefs = productionMeta.characterRefs?.filter(
                              (c) => c.id !== char.id,
                            );
                            updateMeta("characterRefs", newRefs);
                          }}
                          className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                          title="Remove Character Tag"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={char.description}
                      onChange={(e) =>
                        updateCharacterRef(idx, "description", e.target.value)
                      }
                      className="w-full bg-white border border-slate-100 rounded-xl px-3 py-3 text-[10px] font-medium text-slate-500 outline-none focus:border-indigo-400 min-h-[60px] resize-none shadow-inner"
                      placeholder="Detailed character appearance for this tag..."
                    />
                    <div className="space-y-2 pt-2.5 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Modeling Image Prompts:</span>
                        <span className="text-slate-350">
                          @char{idx + 1} reference
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const prompt = `[POSITIVE PROMPT]:
3D character model sheet reference, full-body turnarounds of an anthropomorphic tabby feline named ${char.name}. The character must have the realistic scale, physical height, and proportions of a standard cat (avoiding human-sized proportions). Orthographic lookdev views showing three perspectives: front t-pose view, side profile view, and rear back view. Symmetrical casting on a solid neutral studio grey gradient background. Appearance: ${char.description}. Realistic contemporary clothing styling matching reference. Bright flat lighting, hyperrealistic fur fibers, individual agouti details, optimized for lookdev modeling reference, Unreal Engine 5 render, 8k resolution.

[NEGATIVE PROMPT]:
${productionMeta.negativePrompt}`;
                            handleCopyPrompt(char.id, "model", prompt);
                          }}
                          className={`flex-1 min-w-[75px] py-1 px-2 rounded-lg text-[8px] font-black uppercase text-center transition-all cursor-pointer flex items-center justify-center gap-1 border ${
                            copiedStates[`${char.id}-model`]
                              ? "bg-emerald-500 text-white border-emerald-500"
                              : "bg-indigo-50/50 text-indigo-700 border-indigo-100 hover:bg-indigo-100 hover:text-indigo-800"
                          }`}
                        >
                          <Sliders className="w-2.5 h-2.5 shrink-0" />
                          {copiedStates[`${char.id}-model`] || "Model Sheet 📐"}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const prompt = `[POSITIVE PROMPT]:
Cinematic lookdev portrait reference representation, high-fidelity 8k film photo of beautifully detailed anthropomorphic tabby feline named ${char.name}, possessing the realistic dimensions, scale, and head-to-body proportions of a standard cat. Shallow depth of field, focused tight close-up camera framing on face and shoulders. Appearance: ${char.description}. Realistic contemporary clothing style, cinematic vibrant backdrop. Volumetric split-lighting, flawless subsurface scattering representation on ears, individual realistic whiskers, extreme fine fur fiber render layers.

[NEGATIVE PROMPT]:
${productionMeta.negativePrompt}`;
                            handleCopyPrompt(char.id, "portrait", prompt);
                          }}
                          className={`flex-1 min-w-[75px] py-1 px-2 rounded-lg text-[8px] font-black uppercase text-center transition-all cursor-pointer flex items-center justify-center gap-1 border ${
                            copiedStates[`${char.id}-portrait`]
                              ? "bg-emerald-500 text-white border-emerald-500"
                              : "bg-emerald-50/50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/80 hover:text-emerald-800"
                          }`}
                        >
                          <Camera className="w-2.5 h-2.5 shrink-0" />
                          {copiedStates[`${char.id}-portrait`] || "Portrait 🎭"}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const prompt = `[POSITIVE PROMPT]:
Extreme macro lookup texture sheet, fabric lookdev card for anthropomorphic tabby feline ${char.name}. Showing high density detail of realistic contemporary clothing fabric seams, and microscopic layers of agouti tabby cat fur coat patterns. Flat studio lighting, isolated lookup chart, ultra sharp focus, 8k resolution.

[NEGATIVE PROMPT]:
${productionMeta.negativePrompt}`;
                            handleCopyPrompt(char.id, "texture", prompt);
                          }}
                          className={`flex-1 min-w-[75px] py-1 px-2 rounded-lg text-[8px] font-black uppercase text-center transition-all cursor-pointer flex items-center justify-center gap-1 border ${
                            copiedStates[`${char.id}-texture`]
                              ? "bg-emerald-500 text-white border-emerald-500"
                              : "bg-amber-50/50 text-amber-700 border-amber-100 hover:bg-amber-100/80 hover:text-amber-800"
                          }`}
                        >
                          <Sparkles className="w-2.5 h-2.5 shrink-0" />
                          {copiedStates[`${char.id}-texture`] || "Texture 🔍"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )}

            {/* Location References for Prompt Tagging */}
            {activeStudioTab === "locations" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <Map className="w-3 h-3 text-blue-500" />
                  </div>
                  <label className="text-[10px] font-black text-blue-500 uppercase tracking-tight">
                    Location Asset Tags (@loc1, @loc2...)
                  </label>
                </div>
              </div>

              {uniqueLocations.length === 0 ? (
                <div className="text-[11px] text-slate-400 italic bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  No locations defined in the shot timeline yet. Set shot locations to generate asset tags automatically.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {uniqueLocations.map((loc, idx) => (
                    <div
                      key={loc}
                      className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 space-y-3 relative group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 shadow-lg shadow-blue-200 flex items-center justify-center text-white font-black text-xs">
                          @loc{idx + 1}
                        </div>
                        <span className="text-xs font-black text-slate-900 truncate max-w-[180px]">
                          {loc}
                        </span>
                      </div>
                      
                      <div className="space-y-2 pt-2.5 border-t border-slate-100">
                        <div className="flex items-center justify-between text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                          <span>Modeling & Environment Prompts:</span>
                          <span className="text-slate-350">
                            @loc{idx + 1} reference
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const prompt = `[POSITIVE PROMPT]:
Hyperrealistic cinematic environment photo, professional cinematography, empty location scene setup in "${loc}". High-end lookdev scenery, realistic lighting, 35mm lens, depth of field, atmospheric, natural lighting, extremely detailed architecture and textures, 8k resolution. Location details: ${productionMeta.sceneSetup}. Style: ${productionMeta.globalStyleLock}. Completely empty with no characters, no people, no animals, no felines, pure scenery view.

[NEGATIVE PROMPT]:
felines, cats, animals, characters, people, humans, crowd, actors, creatures, living beings, monsters, blurry, low quality, ${productionMeta.negativePrompt}`;
                              handleCopyPrompt(`loc-${idx}`, "location-specific", prompt);
                            }}
                            className={`flex-1 py-1.5 px-2.5 rounded-lg text-[8px] font-black uppercase text-center transition-all cursor-pointer flex items-center justify-center gap-1 border ${
                              copiedStates[`loc-${idx}-location-specific`]
                                ? "bg-emerald-500 text-white border-emerald-500"
                                : "bg-blue-50/50 text-blue-700 border-blue-100 hover:bg-blue-100 hover:text-blue-800"
                            }`}
                          >
                            <Map className="w-2.5 h-2.5 shrink-0" />
                            {copiedStates[`loc-${idx}-location-specific`] || "Copy Lookdev Prompt 🗺️"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            )}

            {/* Shot Timeline & Continuity */}
            {activeStudioTab === "timeline" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <Activity className="w-3 h-3 text-blue-500" />
                  </div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight">
                    Shot Timeline & Continuity
                  </label>
                </div>
                <button
                  onClick={addShot}
                  className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg hover:bg-indigo-100 transition-all uppercase tracking-widest"
                >
                  + Add Shot
                </button>
              </div>

              <div className="space-y-4">
                {productionMeta.shotTimeline.map((shot, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && (
                      <div className="flex justify-center -my-2 relative z-10">
                        <div className="bg-white px-3 py-1 rounded-full border border-indigo-100 shadow-sm flex items-center gap-2">
                          <Zap className="w-2 h-2 text-indigo-400" />
                          <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">
                            Continuity Link
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="bg-slate-50/50 border border-slate-250 rounded-[2rem] p-5 relative group transition-all hover:border-indigo-300 hover:shadow-md hover:bg-white text-left">
                      {/* Remove active shot button */}
                      <button
                        onClick={() => removeShot(idx)}
                        title="Delete Segment Shot"
                        className="absolute top-4 right-4 p-2 text-slate-350 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all z-20 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Storyboard Viewfinder Screen Previewer */}
                        <div className="lg:col-span-5 h-full">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                            Cinematic Canvas Viewport
                          </label>
                          <ViewfinderMockup shot={shot} index={idx} />
                        </div>

                        {/* Shot Configuration Inputs */}
                        <div className="lg:col-span-7 space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">
                                In (Timestamp)
                              </label>
                              <input
                                type="text"
                                value={shot.startTime}
                                onChange={(e) =>
                                  updateShot(idx, "startTime", e.target.value)
                                }
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"
                                placeholder="00:00.00"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">
                                Out (Timestamp)
                              </label>
                              <input
                                type="text"
                                value={shot.endTime}
                                onChange={(e) =>
                                  updateShot(idx, "endTime", e.target.value)
                                }
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"
                                placeholder="00:00.00"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">
                                Framing Configuration & Focal
                              </label>
                              <input
                                type="text"
                                value={shot.framing}
                                onChange={(e) =>
                                  updateShot(idx, "framing", e.target.value)
                                }
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400 transition-all"
                                placeholder="Framing details (WS, MS, CU)..."
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">
                                Shot Location
                              </label>
                              <input
                                type="text"
                                value={shot.location || ""}
                                onChange={(e) =>
                                  updateShot(idx, "location", e.target.value)
                                }
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400 transition-all"
                                placeholder="Location (e.g., Museum Hall)..."
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">
                              Directorial Narrative Action
                            </label>
                            <textarea
                              value={shot.description}
                              onChange={(e) =>
                                updateShot(idx, "description", e.target.value)
                              }
                              rows={2}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-600 outline-none focus:border-indigo-400 transition-all resize-none font-sans"
                              placeholder="Perform character movement and lens motion directives..."
                            />
                            <span className="text-[7.5px] font-mono text-slate-400 block">
                              Pencil outline tags: @char1, @char2... replace Character Names, and @loc1, @loc2... replace Locations automatically.
                            </span>
                            {getShotReferences(shot).length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                <span className="text-[7.5px] font-black uppercase text-slate-400 self-center mr-1">Detected:</span>
                                {getShotReferences(shot).map(ref => (
                                  <span key={ref} className="bg-slate-100 text-[8px] font-bold text-slate-600 px-1.5 py-0.5 rounded-md border border-slate-200">
                                    {ref}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Camera Kinematics & Audio Intent Controls */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div className="space-y-1.5">
                              <label className="text-[8px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1">
                                <Camera className="w-3 h-3 text-indigo-500" />
                                Camera Kinematics (Seedance 2.0)
                              </label>
                              <input
                                type="text"
                                value={shot.cameraMovement || ""}
                                onChange={(e) => updateShot(idx, "cameraMovement", e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400 transition-all"
                                placeholder="e.g., Slow push-in, lateral tracking left..."
                              />
                              <div className="flex flex-wrap gap-1 pt-0.5">
                                {["Slow push-in", "Lateral tracking", "Low-angle pan", "360° arc", "Static lock"].map((preset) => (
                                  <button
                                    key={preset}
                                    type="button"
                                    onClick={() => {
                                      const current = shot.cameraMovement || "";
                                      updateShot(idx, "cameraMovement", current ? `${current}, ${preset}` : preset);
                                    }}
                                    className="text-[7.5px] font-bold text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-1.5 py-0.5 rounded border border-slate-200 transition-colors cursor-pointer"
                                  >
                                    + {preset}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[8px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1">
                                <Volume2 className="w-3 h-3 text-amber-500" />
                                Audio / Sound Intent (Seedance 2.0)
                              </label>
                              <input
                                type="text"
                                value={shot.audioCue || ""}
                                onChange={(e) => updateShot(idx, "audioCue", e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-amber-400 transition-all"
                                placeholder="e.g., Plucked cello strings, stealthy footsteps..."
                              />
                              <div className="flex flex-wrap gap-1 pt-0.5">
                                {["Footsteps echoing", "Laser hum", "Fabric swish", "Comedic gasp"].map((sound) => (
                                  <button
                                    key={sound}
                                    type="button"
                                    onClick={() => {
                                      const current = shot.audioCue || "";
                                      updateShot(idx, "audioCue", current ? `${current}, [Sound: ${sound}]` : `[Sound: ${sound}]`);
                                    }}
                                    className="text-[7.5px] font-bold text-slate-500 hover:text-amber-600 bg-slate-100 hover:bg-amber-50 px-1.5 py-0.5 rounded border border-slate-200 transition-colors cursor-pointer"
                                  >
                                    + [Sound: {sound}]
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[8px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              Lip-Synced Dialogue Adapter
                            </label>
                            <textarea
                              value={shot.dialogue}
                              onChange={(e) =>
                                updateShot(idx, "dialogue", e.target.value)
                              }
                              rows={1}
                              className="w-full bg-white border border-indigo-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-indigo-400 transition-all resize-none shadow-sm"
                              placeholder="Dialogue line designated for live mouth-tracking..."
                            />
                          </div>

                          {/* Seedance 2.0 Prompt Box (Supports V2V and T2V) */}
                          {(() => {
                            const shotMode = shotModeOverrides[idx] || activeGlobalMode;
                            const promptText = shotMode === "V2V" 
                              ? (shot.v2vPrompt ?? shot.seedancePrompt ?? "") 
                              : (shot.t2vPrompt ?? shot.seedancePrompt ?? "");
                            const wordCount = getWordCount(promptText);

                            const handleUpdatePrompt = (val: string) => {
                              if (shotMode === "V2V") {
                                updateShot(idx, "v2vPrompt", val);
                              } else {
                                updateShot(idx, "t2vPrompt", val);
                              }
                              updateShot(idx, "seedancePrompt", val);
                            };

                            const handleAppendTag = (tag: string) => {
                              const newVal = promptText ? `${promptText} ${tag}` : tag;
                              handleUpdatePrompt(newVal);
                            };

                            return (
                              <div className={`space-y-2.5 rounded-2xl p-3.5 border transition-all ${
                                shotMode === "V2V" 
                                  ? "bg-emerald-50/50 border-emerald-200/80" 
                                  : "bg-indigo-50/50 border-indigo-200/80"
                              }`}>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <label className={`text-[8.5px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                                      shotMode === "V2V" ? "text-emerald-700" : "text-indigo-700"
                                    }`}>
                                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                                      Seedance 2.0 {shotMode} Prompt
                                    </label>

                                    {/* Shot-level Mode Switcher Pill */}
                                    <div className="inline-flex bg-white/80 p-0.5 rounded-lg border border-slate-200 text-[8px] font-bold">
                                      <button
                                        type="button"
                                        onClick={() => setShotModeOverrides(prev => ({ ...prev, [idx]: "V2V" }))}
                                        className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                                          shotMode === "V2V" ? "bg-emerald-500 text-white" : "text-slate-500 hover:text-slate-800"
                                        }`}
                                      >
                                        V2V
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setShotModeOverrides(prev => ({ ...prev, [idx]: "T2V" }))}
                                        className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                                          shotMode === "T2V" ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-800"
                                        }`}
                                      >
                                        T2V
                                      </button>
                                    </div>

                                    {/* Word Budget Indicator Badge */}
                                    <span className={`px-2 py-0.5 rounded-full text-[7.5px] font-black uppercase tracking-wider border ${
                                      wordCount >= 60 && wordCount <= 100
                                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                        : wordCount < 60
                                        ? "bg-amber-100 text-amber-800 border-amber-300"
                                        : "bg-blue-100 text-blue-800 border-blue-300"
                                    }`}>
                                      {wordCount} words {wordCount >= 60 && wordCount <= 100 ? "· Optimal (60–100)" : wordCount < 60 ? "· Concise (<60)" : "· Detailed (>100)"}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    {/* Copy V2V Prompt */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const charRefsStr = (productionMeta.characterRefs || [])
                                          .map((c, i) => `@char${i + 1}: ${c.name} (${c.isMain ? 'Main' : 'Support'}) - ${c.description}`)
                                          .join('\n');
                                        const locRefsStr = uniqueLocations
                                          .map((l, i) => `@loc${i + 1}: ${l}`)
                                          .join('\n');
                                        
                                        const contractHeader = `[SEEDANCE 2.0 V2V REFERENCE-TRANSFER CONTRACT (Emily2040)]:\n@video1: Motion & Camera Trajectory Donor\n${charRefsStr}\n${locRefsStr}\n@audio1: Synchronized Audio Reference\n`;
                                        const fullPrompt = `${contractHeader}\n[SHOT V2V PROMPT]:\n${promptText}\n\n[NEGATIVE PROMPT (ANTI-SLOP)]:\n${productionMeta.negativePrompt}`;
                                        handleCopyPrompt(`shot-${idx}`, "v2v-prompt", fullPrompt);
                                      }}
                                      className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase transition-all flex items-center gap-1 border cursor-pointer ${
                                        copiedStates[`shot-${idx}-v2v-prompt`]
                                          ? "bg-emerald-500 text-white border-emerald-500"
                                          : "bg-emerald-100/90 text-emerald-800 border-emerald-200 hover:bg-emerald-200"
                                      }`}
                                      title="Copy V2V Prompt with @video1 and @char Reference Contract"
                                    >
                                      {copiedStates[`shot-${idx}-v2v-prompt`] || "Copy V2V 📋"}
                                    </button>

                                    {/* Copy T2V Prompt */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const fullPrompt = `[SEEDANCE 2.0 6-STEP T2V PROMPT]:\n${promptText}\n\n[NEGATIVE PROMPT (ANTI-SLOP)]:\n${productionMeta.negativePrompt}`;
                                        handleCopyPrompt(`shot-${idx}`, "t2v-prompt", fullPrompt);
                                      }}
                                      className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase transition-all flex items-center gap-1 border cursor-pointer ${
                                        copiedStates[`shot-${idx}-t2v-prompt`]
                                          ? "bg-indigo-600 text-white border-indigo-600"
                                          : "bg-indigo-100/90 text-indigo-800 border-indigo-200 hover:bg-indigo-200"
                                      }`}
                                      title="Copy Standalone 6-Step T2V Prompt"
                                    >
                                      {copiedStates[`shot-${idx}-t2v-prompt`] || "Copy T2V 📋"}
                                    </button>
                                  </div>
                                </div>

                                {/* Quick-Insert Reference Tags */}
                                <div className="flex flex-wrap items-center gap-1 pt-0.5">
                                  <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-tight mr-1">Insert Reference:</span>
                                  
                                  {shotMode === "V2V" && (
                                    <button
                                      type="button"
                                      onClick={() => handleAppendTag("@video1")}
                                      className="px-1.5 py-0.5 rounded-md bg-emerald-100/90 hover:bg-emerald-200 text-emerald-800 text-[8px] font-mono font-black border border-emerald-300 transition-colors cursor-pointer"
                                      title="Insert @video1 (Motion & Camera Donor tag)"
                                    >
                                      + @video1 (Motion Donor)
                                    </button>
                                  )}

                                  {(productionMeta.characterRefs || []).map((char, cIdx) => {
                                    const tag = `@char${cIdx + 1}`;
                                    return (
                                      <button
                                        key={tag}
                                        type="button"
                                        onClick={() => handleAppendTag(tag)}
                                        className="px-1.5 py-0.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[8px] font-mono font-bold border border-indigo-200/80 transition-colors cursor-pointer"
                                        title={`Insert ${tag} (${char.name})`}
                                      >
                                        + {tag} ({char.name})
                                      </button>
                                    );
                                  })}

                                  {uniqueLocations.map((loc, lIdx) => {
                                    const tag = `@loc${lIdx + 1}`;
                                    return (
                                      <button
                                        key={tag}
                                        type="button"
                                        onClick={() => handleAppendTag(tag)}
                                        className="px-1.5 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 text-[8px] font-mono font-bold border border-blue-200/80 transition-colors cursor-pointer"
                                        title={`Insert ${tag} (${loc})`}
                                      >
                                        + {tag} ({loc})
                                      </button>
                                    );
                                  })}

                                  {shotMode === "V2V" && (
                                    <button
                                      type="button"
                                      onClick={() => handleAppendTag("@audio1")}
                                      className="px-1.5 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 text-[8px] font-mono font-bold border border-amber-200 transition-colors cursor-pointer"
                                      title="Insert @audio1 (Audio clock tag)"
                                    >
                                      + @audio1 (Audio Clock)
                                    </button>
                                  )}
                                </div>

                                <textarea
                                  value={promptText}
                                  onChange={(e) => handleUpdatePrompt(e.target.value)}
                                  rows={4}
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-indigo-400 transition-all resize-none shadow-xs font-sans leading-relaxed"
                                  placeholder={
                                    shotMode === "V2V"
                                      ? "@video1 controls camera motion path and character timing. @char1 locks anthropomorphic ginger tabby character design. Scene Adaptation: Medium close-up of @char1 executing action matching @video1 in @loc1. [Camera kinematics]. [Lighting]. [Sound: cue]..."
                                      : "[Framing] of [Subject & Wardrobe] [Action & Physics] in [Environment]. [Camera Movement]. [Lighting & Ambiance]. [Sound: Audio Intent]..."
                                  }
                                />
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
            )}

            {/* Slate: Camera + Motion Control */}
            {activeStudioTab === "slate" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
                    <Wand2 className="w-3 h-3 text-amber-500" />
                  </div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight">
                    Camera Kinematics & Motion Control
                  </label>
                </div>
                <textarea
                  value={productionMeta.cameraMotionControl}
                  onChange={(e) =>
                    updateMeta("cameraMotionControl", e.target.value)
                  }
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-4 py-4 text-xs font-medium text-slate-700 outline-none focus:border-indigo-400 transition-all min-h-[80px] focus:bg-white shadow-inner"
                  placeholder="Specify jib, crane, dolly, or handheld motion parameters..."
                />
              </div>
            )}
          </div>
        </div>

        {activeStudioTab === "slate" && fullDescription && (
          <div className="bg-white p-8 rounded-3xl border border-indigo-100 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="w-16 h-16 text-indigo-600" />
            </div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2">
                <div className="w-8 h-px bg-indigo-200" />
                Full Scene Narrative
              </h3>
            </div>
            <textarea
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              className="w-full text-base leading-relaxed text-slate-800 italic font-serif bg-transparent border-none outline-none resize-none min-h-[150px] first-letter:text-4xl first-letter:font-bold first-letter:mr-1 first-letter:float-left first-letter:text-indigo-600 focus:bg-slate-50/50 p-2 rounded-xl transition-all"
              placeholder="Edit full scene narrative..."
            />
          </div>
        )}
      </div>

      {/* Emily2040 Seedance 2.0 Skill OS Guide Modal */}
      <AnimatePresence>
        {showSkillGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-200">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                        Seedance 2.0 Skill OS Guide
                      </h3>
                      <span className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                        Emily2040/seedance-2.0
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Multi-modal prompt architectures, reference transfer contracts, and cinematic rules.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSkillGuide(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Navigation Tabs */}
              <div className="flex items-center gap-1 p-2 bg-slate-100/80 border-b border-slate-200/80 text-[10px] font-black uppercase tracking-wider overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setSkillGuideTab("V2V")}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    skillGuideTab === "V2V"
                      ? "bg-white text-emerald-700 shadow-sm border border-emerald-200/60"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Video className="w-3.5 h-3.5 text-emerald-600" />
                  <span>V2V (Reference Contract)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSkillGuideTab("T2V")}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    skillGuideTab === "T2V"
                      ? "bg-white text-indigo-700 shadow-sm border border-indigo-200/60"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>T2V (6-Step Blueprint)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSkillGuideTab("CAMERA")}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    skillGuideTab === "CAMERA"
                      ? "bg-white text-amber-700 shadow-sm border border-amber-200/60"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Camera className="w-3.5 h-3.5 text-amber-600" />
                  <span>Camera Kinematics & Audio</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSkillGuideTab("ANTISLOP")}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    skillGuideTab === "ANTISLOP"
                      ? "bg-white text-red-700 shadow-sm border border-red-200/60"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5 text-red-600" />
                  <span>Anti-Slop Constraints</span>
                </button>
              </div>

              {/* Modal Content Body */}
              <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 leading-relaxed custom-scrollbar flex-1 bg-white">
                {skillGuideTab === "V2V" && (
                  <div className="space-y-4">
                    <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-800 font-black text-xs uppercase tracking-wider">
                        <Video className="w-4 h-4 text-emerald-600" />
                        The Seedance 2.0 Reference-Transfer Contract
                      </div>
                      <p className="text-emerald-900/90 text-[11px] leading-relaxed">
                        In Video-to-Video mode, Seedance 2.0 uses strict asset binding tags (<code className="bg-white/80 px-1 py-0.5 rounded text-emerald-800 font-mono">@video1</code>, <code className="bg-white/80 px-1 py-0.5 rounded text-emerald-800 font-mono">@char1</code>, <code className="bg-white/80 px-1 py-0.5 rounded text-emerald-800 font-mono">@loc1</code>). Each asset has a single explicit responsibility.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="border border-slate-200 rounded-2xl p-3.5 space-y-1.5 bg-slate-50/50">
                        <span className="font-mono font-black text-emerald-600 text-xs">@video1 (Motion Donor)</span>
                        <p className="text-[11px] text-slate-600">
                          Controls camera trajectory, shot duration, framing, and character movement timing. Never transfers human appearance.
                        </p>
                      </div>
                      <div className="border border-slate-200 rounded-2xl p-3.5 space-y-1.5 bg-slate-50/50">
                        <span className="font-mono font-black text-indigo-600 text-xs">@char1..@charN (Appearance Lock)</span>
                        <p className="text-[11px] text-slate-600">
                          Locks the anthropomorphic tabby character's fur coat, whisker morphology, and realistic costume texture.
                        </p>
                      </div>
                      <div className="border border-slate-200 rounded-2xl p-3.5 space-y-1.5 bg-slate-50/50">
                        <span className="font-mono font-black text-blue-600 text-xs">@loc1..@locN (Environment Anchor)</span>
                        <p className="text-[11px] text-slate-600">
                          Locks architectural geometries, room scale, and ambient lighting fixtures.
                        </p>
                      </div>
                      <div className="border border-slate-200 rounded-2xl p-3.5 space-y-1.5 bg-slate-50/50">
                        <span className="font-mono font-black text-amber-600 text-xs">@audio1 (Pacing Clock)</span>
                        <p className="text-[11px] text-slate-600">
                          Controls dialogue synchronization, acting rhythm, and edit cuts.
                        </p>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-2xl p-4 space-y-2 bg-slate-50/30">
                      <span className="font-black text-slate-900 text-xs uppercase tracking-wide block">
                        Golden Rule: "Focus on Change, Not Repetition"
                      </span>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Do not waste prompt tokens describing what is already visible in <code className="font-mono text-emerald-700">@video1</code>. Instead, detail only the <strong>delta changes</strong>: species substitution to tabby cat, fur physics, ear twitches, tail balance, dexterous paws handling props, and micro-expressions.
                      </p>
                    </div>

                    <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 font-mono text-[11px] space-y-2">
                      <div className="text-emerald-400 font-bold text-[10px] uppercase tracking-widest flex items-center justify-between">
                        <span>Standard V2V Template</span>
                        <button
                          type="button"
                          onClick={() => {
                            const template = `@video1 controls camera motion path, shot timing, and character trajectory. @char1 locks anthropomorphic ginger tabby character design and wardrobe. Scene Adaptation: [Shot Framing] of @char1 executing [specific action and physical transformation matching @video1] in @loc1. [Camera kinematics]. [Lighting & atmosphere]. [Sound: audible dialogue or ambient cue].`;
                            navigator.clipboard.writeText(template);
                          }}
                          className="text-[9px] text-emerald-300 hover:text-white cursor-pointer bg-white/10 px-2 py-0.5 rounded"
                        >
                          Copy Template 📋
                        </button>
                      </div>
                      <pre className="whitespace-pre-wrap leading-relaxed text-slate-300">
{`@video1 controls camera motion path, shot timing, and character trajectory.
@char1 locks anthropomorphic ginger tabby character design and wardrobe.
Scene Adaptation: [Shot Framing] of @char1 executing [specific action and transformation matching @video1] in @loc1.
[Camera kinematics]. [Lighting & atmosphere]. [Sound: audible dialogue or ambient cue].`}
                      </pre>
                    </div>
                  </div>
                )}

                {skillGuideTab === "T2V" && (
                  <div className="space-y-4">
                    <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-2 text-indigo-800 font-black text-xs uppercase tracking-wider">
                        <Layers className="w-4 h-4 text-indigo-600" />
                        The Core 6-Step T2V Prompt Formula
                      </div>
                      <p className="text-indigo-900/90 text-[11px] leading-relaxed">
                        For pure Text-to-Video generation without donor video assets, prompts must follow a strict chronological sequence and maintain a <strong>60–100 word token budget</strong>.
                      </p>
                    </div>

                    <div className="space-y-2">
                      {[
                        { step: "1. Shot Size / Framing", desc: "Wide establishing, Medium close-up, Over-the-shoulder, Extreme close-up." },
                        { step: "2. Subject & Wardrobe", desc: "Piseth, an anthropomorphic ginger tabby in an oversized khaki trench coat." },
                        { step: "3. Primary Action & Physics", desc: "Physical interactions, tiptoe slide, stumbling over coat hem, faceplanting onto floor." },
                        { step: "4. Environment & Spatial Anchor", desc: "Modern museum exhibition hall, ruby laser grid, polished reflective marble floor." },
                        { step: "5. Camera Movement Kinematics", desc: "Slow push-in, stable lateral tracking left, low-angle tilt down." },
                        { step: "6. Lighting & Audio Intent", desc: "Cool halogen spotlights with dramatic laser glow. [Sound: electronic laser hum, goofy thud]." },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                          <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                            {i + 1}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 text-xs block">{item.step}</span>
                            <span className="text-[11px] text-slate-600">{item.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border border-slate-200 rounded-2xl p-4 space-y-2 bg-slate-50/30">
                      <span className="font-black text-slate-900 text-xs uppercase tracking-wide block">
                        The First 20–30 Words Rule
                      </span>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Seedance 2.0 heavily weights opening tokens. Always lock in <strong>WHO is in the frame and WHAT physical action they perform</strong> in the opening sentence before adding background ambiance.
                      </p>
                    </div>

                    <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 font-mono text-[11px] space-y-2">
                      <div className="text-indigo-400 font-bold text-[10px] uppercase tracking-widest flex items-center justify-between">
                        <span>Standard T2V Template</span>
                        <button
                          type="button"
                          onClick={() => {
                            const template = `[Shot Framing] of [Main Character & Wardrobe] [Primary Action and Physical Interaction] in [Environment & Setting]. [Camera Movement Kinematics]. [Lighting & Atmosphere]. [Sound: Native Audio Cue and Dialogue].`;
                            navigator.clipboard.writeText(template);
                          }}
                          className="text-[9px] text-indigo-300 hover:text-white cursor-pointer bg-white/10 px-2 py-0.5 rounded"
                        >
                          Copy Template 📋
                        </button>
                      </div>
                      <pre className="whitespace-pre-wrap leading-relaxed text-slate-300">
{`[Shot Framing] of [Main Character & Wardrobe] [Primary Action and Physical Interaction] in [Environment & Setting]. [Camera Movement Kinematics]. [Lighting & Atmosphere]. [Sound: Native Audio Cue and Dialogue].`}
                      </pre>
                    </div>
                  </div>
                )}

                {skillGuideTab === "CAMERA" && (
                  <div className="space-y-4">
                    <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-2 text-amber-800 font-black text-xs uppercase tracking-wider">
                        <Camera className="w-4 h-4 text-amber-600" />
                        Camera Kinematics & Audio Intent (Seedance Vocab)
                      </div>
                      <p className="text-amber-900/90 text-[11px] leading-relaxed">
                        Seedance 2.0 parses mechanical camera terms and native multi-modal audio tags directly. Avoid vague buzzwords like "cinematic zoom"—use precise kinematics.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        { term: "Slow push-in", desc: "Gradual mechanical dolly forward towards subject's face/reaction." },
                        { term: "Stable lateral tracking", desc: "Camera travels alongside moving character matching footfalls." },
                        { term: "Low-angle pan", desc: "Ground-level camera panning upward to reveal character height." },
                        { term: "360-degree arc", desc: "Orbital rotation around characters during dialogue or standoffs." },
                        { term: "Static locked-off camera", desc: "Zero motion, pure character performance and staging." },
                        { term: "Overhead bird-eye tilt", desc: "High vantage looking down, tilting with character collapse or fall." },
                      ].map((item) => (
                        <div key={item.term} className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                          <span className="font-mono font-bold text-indigo-700 text-xs block">{item.term}</span>
                          <span className="text-[11px] text-slate-600">{item.desc}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border border-slate-200 rounded-2xl p-4 space-y-2 bg-slate-50/50">
                      <span className="font-black text-slate-900 text-xs uppercase tracking-wide flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-amber-600" />
                        Native Audio Generation Syntax
                      </span>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Seedance 2.0 supports direct audio synthesis. Format sound effects with brackets:
                        <br />
                        <code className="bg-white px-1.5 py-0.5 rounded text-amber-800 font-mono text-[10.5px] mt-1 inline-block border border-slate-200">
                          [Sound: footsteps echoing on marble, electronic laser hum, comical startled gasp]
                        </code>
                      </p>
                    </div>
                  </div>
                )}

                {skillGuideTab === "ANTISLOP" && (
                  <div className="space-y-4">
                    <div className="bg-red-50/70 border border-red-200 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-2 text-red-800 font-black text-xs uppercase tracking-wider">
                        <Sliders className="w-4 h-4 text-red-600" />
                        Negative Prompt & Anti-Slop Discipline
                      </div>
                      <p className="text-red-900/90 text-[11px] leading-relaxed">
                        To guarantee photorealistic live-action fur and eliminate common AI hallucinations, Seedance 2.0 benefits from strict negative prompt constraints.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-1">
                        <span className="font-bold text-slate-900 text-xs block">Omit Stylized Formats</span>
                        <p className="text-[11px] text-slate-600">
                          <code className="font-mono text-red-600">cartoon, anime, Pixar, 3D CGI plastic render, illustration, toy-like</code>
                        </p>
                      </div>

                      <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-1">
                        <span className="font-bold text-slate-900 text-xs block">Omit Anatomical Glitches</span>
                        <p className="text-[11px] text-slate-600">
                          <code className="font-mono text-red-600">mutated paws, deformed whiskers, extra limbs, human skin, human faces</code>
                        </p>
                      </div>

                      <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-1">
                        <span className="font-bold text-slate-900 text-xs block">Omit Visual Artifacts</span>
                        <p className="text-[11px] text-slate-600">
                          <code className="font-mono text-red-600">oversaturated wax texture, blurry low-resolution artifacts, chaotic jitter</code>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-medium">
                  Source: <strong className="text-slate-800">Emily2040/seedance-2.0</strong> (MIT License)
                </span>
                <button
                  type="button"
                  onClick={() => setShowSkillGuide(false)}
                  className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Close Guide
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
