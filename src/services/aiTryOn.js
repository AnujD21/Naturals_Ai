import axios from 'axios';

/**
 * Replicate API token — get yours free at replicate.com
 * Set VITE_REPLICATE_TOKEN in .env or paste directly here.
 */
const REPLICATE_TOKEN = import.meta.env.VITE_REPLICATE_TOKEN || '';

/**
 * Pollinations.ai — zero-config free fallback, no key needed.
 * Used when no Replicate token is set.
 */
function pollinationsUrl(styleLabel, colorLabel) {
  const prompt = [
    'professional beauty editorial portrait of a woman',
    `${styleLabel} hairstyle`,
    `${colorLabel} hair color`,
    'photorealistic hyperdetailed hair strands',
    'luxury salon studio lighting soft bokeh',
    'sharp focus high resolution glossy magazine',
  ].join(', ');
  const seed = Math.floor(Math.random() * 999999);
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=680&seed=${seed}&nologo=true&model=flux&nofeed=true`;
}

/**
 * Load an image URL via native Image() — works cross-origin without fetch/blob.
 * Returns the URL on success, throws on timeout or error.
 */
function loadImage(url, timeoutMs = 90000) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const t = setTimeout(() => reject(new Error('Image load timed out')), timeoutMs);
    img.onload  = () => { clearTimeout(t); resolve(url); };
    img.onerror = () => { clearTimeout(t); reject(new Error('Image failed to load')); };
    img.src = url;
  });
}

/**
 * Poll a Replicate prediction until it succeeds or fails.
 */
async function pollPrediction(predictionId, token, maxWaitMs = 120000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    await new Promise(r => setTimeout(r, 2500));
    const { data } = await axios.get(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      { headers: { Authorization: `Token ${token}` } }
    );
    if (data.status === 'succeeded') return data.output?.[0] ?? data.output;
    if (data.status === 'failed' || data.status === 'canceled') {
      throw new Error(data.error || 'Replicate prediction failed');
    }
  }
  throw new Error('Replicate prediction timed out');
}

/**
 * Convert a data-URL (base64) to a public URL via Replicate file upload,
 * or just return a hosted URL unchanged.
 */
async function resolveImageUrl(imageDataOrUrl, token) {
  if (!imageDataOrUrl.startsWith('data:')) return imageDataOrUrl;

  // Upload the base64 image as a file to Replicate
  const [header, b64] = imageDataOrUrl.split(',');
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const byteString = atob(b64);
  const bytes = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) bytes[i] = byteString.charCodeAt(i);
  const blob = new Blob([bytes], { type: mime });

  const formData = new FormData();
  formData.append('content', blob, 'upload.jpg');

  const { data } = await axios.post(
    'https://api.replicate.com/v1/files',
    formData,
    {
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return data.urls?.get ?? data.url;
}

/**
 * Main entry point called by StylePreview.
 *
 * Strategy:
 *  1. If REPLICATE_TOKEN is set → use Replicate image-to-image (SDXL)
 *  2. Otherwise              → use Pollinations free generation
 *
 * Returns: string image URL
 */
export async function generateHairstylePreview(uploadedImageUrl, styleLabel, colorLabel) {
  const prompt = `Change hairstyle to ${styleLabel} with ${colorLabel} hair color while preserving the same face. Realistic salon hairstyle preview. Professional beauty editorial, sharp focus, photorealistic.`;
  const negativePrompt = 'different person, changed identity, cartoon, anime, blurry, deformed, watermark, text';

  // ── Path 1: Replicate ─────────────────────────────────
  if (REPLICATE_TOKEN) {
    try {
      const imageUrl = await resolveImageUrl(uploadedImageUrl, REPLICATE_TOKEN);

      // Use SDXL img2img via Replicate
      const { data: prediction } = await axios.post(
        'https://api.replicate.com/v1/predictions',
        {
          version: 'da77bc59ee60423279fd632efb4795ab731d9e3ca9705ef3341091fb989b7eaf', // stability-ai/sdxl
          input: {
            image:           imageUrl,
            prompt,
            negative_prompt: negativePrompt,
            prompt_strength: 0.6,
            num_inference_steps: 30,
            guidance_scale:  7.5,
            scheduler:       'K_EULER',
          },
        },
        { headers: { Authorization: `Token ${REPLICATE_TOKEN}`, 'Content-Type': 'application/json' } }
      );

      const outputUrl = await pollPrediction(prediction.id, REPLICATE_TOKEN);
      return await loadImage(outputUrl);
    } catch (err) {
      console.warn('Replicate failed, falling back to Pollinations:', err.message);
      // Fall through to Pollinations
    }
  }

  // ── Path 2: Pollinations (free, no key) ───────────────
  const url = pollinationsUrl(styleLabel, colorLabel);
  return await loadImage(url, 90000);
}
