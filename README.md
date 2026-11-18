# Meridian — The Descent

A single-page marketing website that begins as a polished, generic B2B SaaS platform landing page and gradually unravels as you scroll down — shifting through subtle corporate uncanny valley, liminal office decay, interactive flashlight margin secrets, basement surveillance footage, and a full horror-movie climax.

## Running Locally

Because the site uses ES modules (`<script type="module">`) and the Web Audio API, serve the directory with any local static server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Experience Highlights

- **7 Choreographed Acts**: Continuous scroll-driven transitions across color temperature, typography, layout tilt, vignette depth, analog film grain, and dynamic browser tab title + favicon mutation.
- **Procedural Horror Soundscape** (`js/audio.js`): Pure Web Audio API synthesis (fluorescent hum → binaural infrasound drone → dissonant bowed strings → accelerating heartbeat → silence-drop climax impact). Click the audio toggle in the navbar (or click anywhere on the page) to enable sound.
- **Diegetic Live Chat Widget** (`js/chat-widget.js`): Starts as a friendly SaaS support bubble and gradually turns hostile — hijacking your keystrokes in the deeper acts.
- **Flashlight Margin Secrets**: In Acts V–VI, moving your mouse illuminates scratched warnings hidden in the dark margins.
- **Backtrack Corruption Memory**: After descending past Act V (or triggering the Act VII climax), try scrolling back up to the top of the page.
