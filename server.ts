import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

function cleanAndParseJson(str: string): any {
  let cleaned = str.trim();

  // Strip potential leading/trailing Markdown code blocks
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, "");
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.replace(/```$/, "");
  }
  cleaned = cleaned.trim();

  // Try parsing directly first
  try {
    return JSON.parse(cleaned);
  } catch (initialErr) {
    console.warn("[JSON Parser] Direct parse failed, attempting sanitization...", initialErr);
  }

  // Sanitization: Replace literal unescaped control newlines/returns inside string values with "\n"
  let insideString = false;
  let sanitized = "";
  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (char === '"' && (i === 0 || cleaned[i - 1] !== '\\')) {
      insideString = !insideString;
      sanitized += char;
    } else if (insideString && (char === '\n' || char === '\r')) {
      if (char === '\n') {
        sanitized += "\\n";
      }
    } else {
      sanitized += char;
    }
  }

  // Try parsing sanitized version
  try {
    return JSON.parse(sanitized);
  } catch (sanitizedErr: any) {
    console.error("[JSON Parser] Sanitized parse failed too:", sanitizedErr);
    throw new SyntaxError(`Failed to parse Gemini response as JSON. Original error: ${sanitizedErr.message}`);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: "150mb" }));
  app.use(express.urlencoded({ extended: true, limit: "150mb" }));

  // API endpoints FIRST
  app.post("/api/process-video", async (req, res, next) => {
    try {
      const { videoData, videoType } = req.body;
      if (!videoData || !videoType) {
        return res.status(400).json({ error: "Missing videoData or videoType parameter." });
      }

      console.log(`[Processor] Processing video with type: ${videoType} (${Math.round(videoData.length / 1024 / 1024)} MB base64 size)`);

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: videoType,
                  data: videoData,
                },
              },
              {
                text: `You are an expert film director and cinematic prompt engineer trained on the Seedance 2.0 Skill OS (Emily2040/seedance-2.0 architecture).

Analyze the attached reference video shot-by-shot and generate everything needed to recreate it in Seedance 2 using the V2V (Video-to-Video) and T2V (Text-to-Video) skill contracts.

## PRIMARY TRANSFORMATION RULE
Recreate the original video as faithfully as possible.
The ONLY transformation allowed is:
Replace every human with one consistent anthropomorphic domestic tabby/calico cat.
Everything else (lighting, spatial layout, camera trajectory, timing, acting beat) must remain identical.
Do not redesign scenes or add unrelated creative ideas. If something is ambiguous, mark [UNVERIFIED].

## SEEDANCE 2.0 V2V SKILL ARCHITECTURE (Emily2040 Reference-Transfer Contract)
1. Asset Tag Binding:
   - @video1: Motion & Camera Donor. Controls camera trajectory, timing, acting rhythm, and choreography without transferring human appearance.
   - @char1, @char2, etc.: Character Appearance Locks. Locks the anthropomorphic feline morphology, coat patterns, facial whiskers, and wardrobe.
   - @loc1, @loc2, etc.: Environment / Location Locks.
   - @audio1: Audio/dialogue clock reference.
2. Rule of "Focus on Change, Not Repetition":
   - Do NOT waste prompt tokens re-describing static visual elements already present in @video1.
   - Detail the physical transformation: species conversion to domestic tabby cat, realistic fur physics, twitching ears, tail balance swishes, paws handling props, and expressive micro-gestures.
3. V2V Prompt Formula (60–100 words):
   "@video1 controls camera trajectory, shot timing, and action pacing. @char1 locks anthropomorphic [color] tabby character design and wardrobe. Scene Adaptation: [Shot Framing] of @char1 executing [specific action and transformation matching @video1] in @loc1. [Camera movement kinematics]. [Lighting and atmosphere]. [Sound: audible dialogue or ambient sound effect]."

## SEEDANCE 2.0 T2V SKILL ARCHITECTURE (Emily2040 6-Step Formula)
For standalone text generation without the source video:
- 6-Step Structure: [Shot Framing] + [Main Subject & Wardrobe] + [Primary Action & Physics] + [Environment & Spatial Anchor] + [Camera Movement] + [Lighting & Ambiance] + [Audio / Sound Intent]
- First 20–30 Words Rule: Lead immediately with who is in frame and what physical action they perform.
- Camera Kinematics: Use clean mechanical vocabulary (e.g., "slow push-in", "stable lateral tracking left", "low-angle pan", "static locked-off camera", "360-degree arc").
- Word Budget: 60–100 words per shot.

## Character Rules
Each recurring human becomes ONE recurring cat:
- Main Character: Ginger tabby (thick vibrant ginger fur, amber swirl stripes, expressive green eyes, realistic trench coat or outfit).
- Supporting Characters: Grey tabby, Brown tabby, Silver tabby, or Calico.
- Photorealistic live-action aesthetic: natural fur fibers, digitigrade legs, upright posture, dexterous paws, feline facial anatomy. NEVER cartoon, anime, Pixar, or plastic 3D CGI toy.

---

Return ONLY one valid JSON object:
{
  "sceneSummary": "Comprehensive summary of scene action, mood, and cinematic pacing.",
  "characters": [
    {
      "id": "char1",
      "role": "Main Protagonist",
      "description": "Exhaustive lookdev appearance of the feline, coat pattern, eye color, clothing textures, and personality."
    }
  ],
  "shots": [
    {
      "start": "00:00.00",
      "end": "00:03.50",
      "framing": "MEDIUM CLOSE-UP",
      "location": "Location name",
      "cameraMovement": "Slow push-in / stable lateral tracking",
      "audioCue": "Faint footsteps, soft purr, comedic gasp",
      "description": "Visual breakdown of the shot matching @video1 with human-to-cat replacement.",
      "dialogue": "Spoken dialogue if audible, or 'None'",
      "v2vPrompt": "Production-ready Seedance 2.0 V2V prompt enforcing @video1 motion donor and @char1 appearance lock.",
      "t2vPrompt": "Standalone 6-step Seedance 2.0 T2V prompt (Framing + Subject + Action + Environment + Camera + Lighting + Sound).",
      "seedancePrompt": "Primary Seedance 2 prompt (matches v2vPrompt for video remake workflow)"
    }
  ],
  "negativePrompt": "cartoon, anime, Pixar, 3D CGI plastic render, illustration, toy-like, human skin, human faces, mutated paws, deformed whiskers, extra limbs, oversaturated wax texture, blurry low-resolution artifacts"
}`,
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are a precise JSON generator. Output valid JSON only. Do NOT use unescaped double quotes inside JSON string values; use single quotes or escape them with backslashes (\\\") if needed. Do NOT write raw literal newlines within string properties; use \\n instead. Ensure the JSON is perfectly formatted, closed, and valid.",
          temperature: 0.1,
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response text received from the Gemini model.");
      }

      const parsedResult = cleanAndParseJson(responseText);
      res.json(parsedResult);
    } catch (err: any) {
      console.error("[Processor] Failed to analyze video:", err);
      next(err);
    }
  });

  app.post("/api/generate-from-story", async (req, res, next) => {
    try {
      const { story } = req.body;
      if (!story) {
        return res.status(400).json({ error: "Missing story parameter." });
      }

      console.log(`[Story Generator] Generating cinematic production script from story premise: "${story.substring(0, 100)}..."`);

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [
          {
            parts: [
              {
                text: `You are an elite film director, cinematographer, and Seedance 2.0 prompt architect implementing the Emily2040 Seedance 2.0 Skill OS.

Transform the user's premise into a structured cinematic production blueprint with anthropomorphic tabby feline characters.

Story Premise:
"${story}"

## SEEDANCE 2.0 T2V (Text-to-Video) SKILL SPECIFICATIONS:
1. Core 6-Step Prompt Formula for each shot:
   [Shot Size / Framing] + [Subject & Wardrobe] + [Action / Physical Interaction] + [Environment & Location] + [Camera Movement Kinematics] + [Lighting & Ambiance] + [Audio / Sound Intent]
2. First 20–30 Words Rule: Immediately establish the character, wardrobe, and primary physical action beat in opening tokens.
3. Token Budget: 60–100 words per shot prompt.
4. Camera Kinematics: Use explicit camera direction (e.g., "slow push-in", "stable lateral tracking right", "low-angle arc shot", "static locked-off shot", "gentle pedestal down").
5. Audio Design: Include native sound design and dialogue cues [Sound: ...].
6. V2V Compatibility: Provide both a standalone T2V prompt and a reference-bound V2V prompt utilizing @char1, @char2, and @loc1 tags.

## CREATIVE CONSTRAINTS:
1. Anthropomorphic domestic tabby cats with realistic proportions, rich strand-rendered fur, whiskers, digitigrade legs, and expressive acting. Main character is an orange tabby; supporting are grey/silver/calico tabbies.
2. Whimsical comedy tone with physical comedy and charming micro-expressions.
3. Photorealistic live-action cinematography (35mm lens, depth of field, natural atmospheric volumetric light).

Return EXCLUSIVELY a valid JSON object matching this structure:
{
  "fullSceneDescription": "Exhaustive narrative describing scene flow, comedy moments, and character dynamics.",
  "productionMeta": {
    "globalStyleLock": "Vibrant and expressive photorealistic comedy movie lookdev style with warm volumetric lighting, rich fur textures, and high contrast colors.",
    "sceneSetup": "Concise, highly optimized background environment and lighting prompt suitable for image generation, matching the story's setting.",
    "characters": "General summary of the humorous tabby ensemble featuring realistic casual/modern garments matching the story.",
    "characterRefs": [
      {
        "id": "char1",
        "name": "Piseth",
        "description": "Exhaustive lookdev appearance. Vibrant orange tabby with distinct golden-red striped fur, comical expressive eyes, twitching whiskers, and realistic garments.",
        "isMain": true
      }
    ],
    "shotTimeline": [
      {
        "startTime": "00:00.00",
        "endTime": "00:03.50",
        "framing": "WIDE ESTABLISHING",
        "location": "Museum Main Hall",
        "cameraMovement": "Slow comedic push-in",
        "audioCue": "Sneaky plucked cello strings and soft paw clicks on polished floor",
        "description": "Piseth the orange tabby tips his oversized trench coat collar up while sneaking past a giant glass relic vitrine.",
        "dialogue": "None - Sneaky suspenseful music",
        "t2vPrompt": "Wide establishing shot of Piseth, an anthropomorphic ginger tabby in an oversized khaki trench coat, sneaking across the polished marble floor of @loc1. The camera executes a slow comedic push-in as he tips his collar up. High-ceilinged museum architecture illuminated by dramatic moonbeams and amber spot beams. [Sound: playful plucked cello strings and soft paw steps echoing on marble].",
        "v2vPrompt": "@char1 locks the ginger tabby protagonist in oversized trench coat. @loc1 locks the high-ceilinged museum hall. Scene Adaptation: Wide establishing shot of @char1 sneaking past the central glass vitrine. Slow comedic push-in camera trajectory. Dramatic moonbeams reflecting off marble. [Sound: soft paw clicks and curious orchestral strings].",
        "seedancePrompt": "Wide establishing shot of @char1, an anthropomorphic ginger tabby in an oversized khaki trench coat, sneaking across @loc1. The camera executes a slow comedic push-in as he tips his collar up. High-ceilinged museum hall illuminated by dramatic moonbeams and amber spot beams. [Sound: playful plucked cello strings and soft paw steps echoing on marble]."
      }
    ],
    "cameraMotionControl": "Comedic slow push-ins, snappy zooms for shock reactions, smooth lateral dolly tracking.",
    "negativePrompt": "cartoon, anime, Pixar, 3D CGI plastic render, illustration, toy-like, human skin, human faces, mutated paws, deformed whiskers, extra limbs, oversaturated wax texture, blurry low-resolution artifacts"
  }
}`,
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are a precise JSON generator. Output valid JSON only. Do NOT use unescaped double quotes inside JSON string values; use single quotes or escape them with backslashes (\\\") if needed. Do NOT write raw literal newlines within string properties; use \\n instead. Ensure the JSON is perfectly formatted, closed, and valid.",
          temperature: 0.1,
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response text received from the Gemini model.");
      }

      const parsedResult = cleanAndParseJson(responseText);
      res.json(parsedResult);
    } catch (err: any) {
      console.error("[Story Generator] Failed to generate script from story:", err);
      next(err);
    }
  });



  // Global error handler registered at the end of routing pool to ensure accurate propagation of errors
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Global error handler caught:", err);
    res.status(err.status || 500).json({
      error: err.message || "Internal Server Error",
      details: process.env.NODE_ENV !== "production" ? err.stack : undefined
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
