import { play, setEnabled, setVolume, type SoundName } from "cuelume";
let enabled = true;
export function initializeSound() {
  try {
    enabled = localStorage.getItem("registry:sound") !== "off";
  } catch {
    enabled = true;
  }
  setVolume(0.25);
  setEnabled(enabled);
  return enabled;
}
export function toggleSound() {
  enabled = !enabled;
  setEnabled(enabled);
  try {
    localStorage.setItem("registry:sound", enabled ? "on" : "off");
  } catch {
    /* Session preference remains usable. */
  }
  if (enabled) play("toggle");
  return enabled;
}
export function cue(name: SoundName) {
  play(name);
}
