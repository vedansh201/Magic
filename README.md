# Strange — An Origin Story

This version covers only the requested opening stretch: darkness → spark portal → surgeon folding directly into the video → quote over the video → left/right seals → top/bottom seals → floating orange glyphs.

## Codespaces

From the folder containing `package.json`:

```bash
npm ci
npm run dev -- --port 5173 --strictPort
```

Leave the server running and open port 5173 in the Codespaces Ports panel. If another Vite server is already running, stop it with Ctrl+C first. Production: `npm run build`; preview: `npm run preview`.

## Add the actual Strange images and butterfly scene

You supplied a surgeon still and `Untitled design.mp4`. The video exceeds this execution workspace's 32 MiB transfer limit, and the inline image is visible in chat but not available as a downloadable file here. Neither original asset is embedded in the update. You do **not** need more pictures for this chapter.

Copy the originals directly into your Codespace:

- `public/media/surgeon.jpg` (also accepts `surgeon.jpeg`, `surgeon.png`, or `surgeon.webp`)
- `public/media/Untitled design.mp4` (also accepts `awakening.mp4`)

The app checks file types and detects these names automatically. The image appears both inside the portal and in the surgeon chapter. Without the files, the portal shows procedural blue-gray depth and the story retains its explicit missing-media state. If an older browser-local selection overrides the files, open Scene Media and click Clear local media.

For a local preview, click **SCENE MEDIA** in the site header and select an image and video from your computer. The image becomes the surgeon chapter's full-screen backdrop and participates in the folding animation. The video plays when its section enters view, starting muted, and pauses when it leaves view. Native playback controls remain available. Browsers may require pressing Play after sound is enabled.

Files selected through Scene Media are stored in IndexedDB in your current browser. They are not uploaded or included in a deployment. Browser storage restrictions may limit them to the current visit. Clearing site data removes them.

To include media for everyone who visits your deployed site:

1. Place your chosen image at `public/media/surgeon.jpg` and clip at `public/media/awakening.mp4`.
2. These standard filenames are detected automatically. For other URLs, optionally edit `src/story/media.js`:

```js
export const defaultMedia = {
  image: '/media/surgeon.jpg',
  video: '/media/awakening.mp4',
};
```

Use an MP4 with H.264 video and AAC audio for broad compatibility, or a supported WebM. Keep imagery around 1600–2000 pixels wide and compress the clip for web delivery. Choose assets you have permission to use.

## Architecture

- `src/App.jsx`: sequence, controls, opening/replay, media state.
- `src/story/Opening.jsx`: lazy-loads the Three.js entrance; skips it for reduced motion and uses a Canvas fallback if WebGL fails.
- `src/story/portal/createPortal.js`: a perspective camera, physical ring geometry, 4,200 desktop / 1,800 mobile GPU-driven spark trails, ballistic gravity and floor contact, textured dark floor, walls and moving point lights. The entrance runs approximately 8.3 animation seconds, starting in black and moving the camera through the aperture.
- `src/story/portal/shaders.js`: animated multi-octave noise drives the fire, rim filaments, haze and heat distortion. HDR bloom is applied before final tone mapping. The selected photograph appears inside the opening.
- `src/story/portal/CanvasOpening.jsx`: lightweight non-WebGL fallback; this deliberately has simpler effects.
- `src/story/mediaPaths.js`: deployed-media filename discovery; checks HEAD content types without downloading the entire video.
- `src/story/Surgeon.jsx`: story layout and 12 CSS 3D panels. The photograph folds away directly over the video. Numbered chapter labels and the separate “man before the mystic” block have been removed.
- `src/story/FilmScene.jsx`: sticky video with the “Everything you know is only a fraction of what is” quote aligned toward the lower left. Further scroll closes panels from left/right, then top/bottom. The glyph section follows. Scroll backward to reverse the sequence. Video pauses while fully sealed or offscreen; native controls remain available. The viewport presentation crops the video with object-fit: cover; change that rule to contain if you prefer the entire frame with letterboxing.
- `src/story/GlyphField.jsx`: invented geometric symbols drawn live at different depths, with drifting motion and pointer displacement. No actual Chinese or Sanskrit text is used.
- `src/story/MysticCursor.jsx`: glowing central spark, trailing ring and hover/click response. Native cursor remains on touch devices and with reduced motion.
- `src/story/MediaSettings.jsx`: accessible modal, image/video import and browser-local persistence.
- `src/style.css`: complete styling for this version.
- `src/components/`: previous version's components, retained in the workspace for reference; the new story does not import them and Vite excludes them from the runtime bundle.

The entrance uses Three.js and its built-in postprocessing modules; no new dependencies were added. Three.js is dynamically loaded only for the animated opening. Fonts and media are local. No third-party network requests, accounts, API keys, or backend are required.

## Accessibility and performance

Motion follows the system setting and can be toggled in the header. Reduced motion skips the opening, removes the 3D folding and sealing panels, stops glyph drift, restores the native cursor and avoids video autoplay. Sound starts off. Mobile uses fewer sparks and glyphs. Pixel ratio is capped at 1.5 on desktop and 1.15 on mobile. Sustained slow frames lower rendering resolution automatically; a narrower viewport moves the initial camera back to keep the full ring visible. The portal loop is destroyed when the intro finishes; offscreen glyphs skip drawing. Controls support keyboard focus; the media dialog supports Escape and restores focus through the native dialog behavior.

## Validation

Production build and Chromium desktop/mobile checks cover shader compilation, portal completion, replay and cleanup, project-image discovery, image import and persistence, the narrative interactions, reduced motion, WebGL failure and horizontal overflow. Additional desktop/mobile checks cover the quote overlay, sequential side/top-bottom closures, backward scrolling, covered-video pause/resume, and label removal. Video import/playback uses a generated test clip. The supplied movie file could not be transferred and its codec/content have not been inspected. Physical iOS/Android and Safari should still be tested with the final media. The Three.js chunk is about 125 KB gzip and Vite reports a small uncompressed chunk-size advisory.

## Updating from the first edition

For the latest layout change, use `refine_story.py` from the chat handoff. It updates the story components, stylesheet and this guide; the previously installed portal and uploaded media remain in place. Copy its entire contents into a file with that name in your Codespace, then run it from your project root. It backs up differing files to a timestamped folder outside the project before writing the updated source. It does not run Git, install packages, delete old components or change your media files. Stop the running Vite server before applying it, then run `npm run dev -- --port 5173 --strictPort` again.

## Hackatime

Configure your own Hackatime VS Code integration using its official setup. This project does not simulate activity or send coding heartbeats. Only your actual qualifying editor activity is recorded by that integration. Keep API keys private.

Independent fan tribute; unaffiliated with Marvel or Disney. Doctor Strange and related names belong to their respective owners. No commits or pushes are made by the handoff script.

## Time Stone update

Ten paired closures alternate horizontally and vertically, progressively darkening to pure black. The next pinned scene starts with orange glyphs sweeping right to left and drifting. Scrolling into that scene freezes their independent drift; scroll position then rotates the field in perspective and changes its color to green. Scrolling back restores the orange phase. Reduced motion disables the shutters and globe rotation, retaining a static color transition.

Apply `time_stone_update.py` using Copy file contents, save it in your project root, stop Vite, and run `python3 time_stone_update.py` followed by `npm run dev -- --port 5173 --strictPort`. Existing media and portal code are preserved.

## Image-matched Time Stone reveal

Apply `stone_reveal_update.py`. The native video seek/fullscreen bar is removed; a small Play/Pause control appears on hover or keyboard focus and remains available on touch devices.

The final glyph rotation accelerates, then a single white-light transition reveals the Strange photograph. Further scroll reveals a Three.js gemstone at the photographed stone position, moves it to the center and fades the photo behind it. Desktop text appears on either side; mobile text appears above and below. Reverse scrolling reverses the reveal. Reduced motion omits the white flash.

In **Scene Media**, select the original under **Strange holding the Time Stone**. It is decoded and encoded as PNG before use, without resizing or generative alteration. Click **SAVE TIME-STONE.PNG** to download the converted copy. To ship it to all visitors, copy that PNG to `public/media/time-stone.png`. JPG/JPEG/WebP under the same stem are also detected and converted in the browser.

The original picture was supplied inline in chat without downloadable bytes, so no converted copy is bundled here. The source anchor is calibrated visually to the shown 590 × 350 composition (stone center around x=61, y=100). Position and dimensions scale with the contained photograph. The exact visual match still needs checking with the original image loaded; the background photograph retains its original resolution. The photo darkens as the stone lifts; this is not an inpainted background.

Browser checks with a synthetic image cover PNG download, white transition, anchor positioning, centered enlargement, text reveal, reverse scroll and reduced motion at desktop/mobile widths. The synthetic test asset is not included in the website.

## Scroll-controlled 3D gemstone

Apply `gem_3d_update.py` from the project root. The centered stone is a procedural oval-cut Three.js mesh with separate facet normals, physical transmission, environment reflections, directional lighting and a subtle inner core. It replaces the magnified photograph crop; the original photograph remains unchanged.

After the stone reaches the center and both text blocks appear, two additional viewport heights of scrolling rotate only the gemstone through two turns. Text and stone position remain pinned. Scrolling back reverses rotation. There is no idle spinning. Reduced motion uses a fixed orientation, and devices without WebGL receive a static SVG fallback. Rendering runs on demand, with pixel ratio capped at two and resources disposed on unmount.

Verified at 1440px and 390px widths: WebGL rendering, scroll and reverse rotation, stationary text and position, reduced motion, no horizontal overflow and no browser runtime errors. Media tests use a synthetic photo because the original uploaded photo is unavailable in this workspace.
