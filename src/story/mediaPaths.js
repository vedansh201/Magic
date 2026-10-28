// These names match the surgeon image and the user's original uploaded clip.
// HEAD requests check MIME types, so Vite's HTML fallback is never mistaken for media.
export const mediaCandidates = {
  image: ['/media/surgeon.jpg', '/media/surgeon.jpeg', '/media/surgeon.png', '/media/surgeon.webp'],
  stone: ['/media/time-stone.png', '/media/time-stone.jpg', '/media/time-stone.jpeg', '/media/time-stone.webp'],
  video: ['/media/awakening.mp4', '/media/Untitled%20design.mp4'],
};

for (const key of Object.keys(mediaCandidates)) {
  mediaCandidates[key] = mediaCandidates[key].map(
    path => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`
  );
}
