import { computed, onBeforeUnmount, ref, watch } from "vue";

const CAMERA_CONSTRAINTS: MediaStreamConstraints["video"] = {
  facingMode: { ideal: "user" },
  width: { ideal: 1280 },
  height: { ideal: 1280 },
};

async function waitForMetadata(video: HTMLVideoElement): Promise<void> {
  if (video.readyState >= 1) return;
  await new Promise<void>((resolve) => {
    video.onloadedmetadata = () => resolve();
  });
}

async function initialiseVideo(video: HTMLVideoElement): Promise<void> {
  video.playsInline = true;
  video.muted = true;
  await waitForMetadata(video);
  await video.play().catch(() => { });
  await new Promise((resolve) => setTimeout(resolve, 180));
  await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
}

function drawFrame(video: HTMLVideoElement, stream?: MediaStream): string {
  const track = stream?.getVideoTracks()?.[0];
  const settings = track?.getSettings?.() ?? {};

  // Limite la taille max à 800px pour éviter les payload trop lourds
  const MAX_SIZE = 800;
  let width = video.videoWidth || settings.width || 640;
  let height = video.videoHeight || settings.height || 480;

  if (width > height) {
    if (width > MAX_SIZE) {
      height *= MAX_SIZE / width;
      width = MAX_SIZE;
    }
  } else {
    if (height > MAX_SIZE) {
      width *= MAX_SIZE / height;
      height = MAX_SIZE;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Impossible de récupérer le contexte du canvas.");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(video, 0, 0, width, height);

  // Compression JPEG à 0.7 pour réduire la taille (vs PNG par défaut)
  return canvas.toDataURL("image/jpeg", 0.7);
}

async function captureWithNewStream(): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("Camera non disponible côté serveur.");
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    video: CAMERA_CONSTRAINTS,
  });

  const video = document.createElement("video");
  video.srcObject = stream;

  await initialiseVideo(video);

  const dataUrl = drawFrame(video, stream);

  stream.getTracks().forEach((track) => track.stop());
  video.srcObject = null;

  return dataUrl;
}

export function useCamera() {
  const previewStream = ref<MediaStream | null>(null);
  const videoEl = ref<HTMLVideoElement | null>(null);

  const isPreviewing = computed(() => Boolean(previewStream.value));

  async function startPreview() {
    if (previewStream.value) return;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: CAMERA_CONSTRAINTS,
    });
    previewStream.value = stream;
  }

  function stopPreview() {
    if (previewStream.value) {
      previewStream.value.getTracks().forEach((track) => track.stop());
    }
    if (videoEl.value) {
      videoEl.value.pause();
      videoEl.value.srcObject = null;
    }
    previewStream.value = null;
  }

  async function capture(): Promise<string> {
    if (previewStream.value && videoEl.value) {
      const video = videoEl.value;
      await initialiseVideo(video);
      const dataUrl = drawFrame(video, previewStream.value);
      stopPreview();
      return dataUrl;
    }
    return captureWithNewStream();
  }

  watch(
    [previewStream, videoEl],
    async ([stream, video]) => {
      if (!video) return;
      if (stream) {
        video.srcObject = stream;
        await initialiseVideo(video).catch(() => { });
      } else {
        video.pause();
        video.srcObject = null;
      }
    },
    { flush: "post" }
  );

  onBeforeUnmount(() => {
    stopPreview();
  });

  return {
    videoEl,
    isPreviewing,
    startPreview,
    stopPreview,
    capture,
  };
}
