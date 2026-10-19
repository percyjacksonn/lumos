
import json, subprocess, numpy as np, soundfile as sf
SR = 44100

MASTER_PEAK = 0.90

# name -> notes [freq, start(s), length(s), wave, volume, slideTo]
SOUNDS = {
 "click":   [[520, 0, .06, "triangle", .10]],
 "tap":     [[760, 0, .045, "sine", .09]],
 "card":    [[330, 0, .09, "triangle", .12, 560]],
 "primary": [[587, 0, .07, "triangle", .13], [880, .065, .10, "triangle", .13]],
 "soft":    [[440, 0, .07, "sine", .10], [554, .06, .08, "sine", .08]],
 "save":    [[988, 0, .07, "sine", .11], [1319, .06, .12, "sine", .11]],
 "unsave":  [[620, 0, .12, "sine", .10, 380]],
 "download":[[170, 0, .13, "sine", .16, 85], [784, .11, .09, "triangle", .10], [1047, .19, .16, "triangle", .10]],
 "login":   [[523, 0, .09, "triangle", .12], [659, .08, .09, "triangle", .12], [784, .16, .09, "triangle", .12], [1047, .24, .22, "triangle", .13]],
 "signup":  [[392, 0, .08, "triangle", .12], [494, .07, .08, "triangle", .12], [587, .14, .08, "triangle", .12], [784, .21, .09, "triangle", .12], [1175, .29, .26, "sine", .12]],
 "logout":  [[784, 0, .10, "triangle", .11], [523, .10, .18, "triangle", .11]],
 "error":   [[170, 0, .13, "square", .08], [135, .12, .17, "square", .08]],
 "unlock":  [[988, 0, .06, "square", .07], [1319, .06, .06, "square", .07], [1568, .12, .20, "triangle", .12]],
 "success": [[659, 0, .08, "triangle", .12], [784, .08, .08, "triangle", .12], [1047, .16, .08, "triangle", .12], [1319, .24, .25, "triangle", .13]],
 "approve": [[880, 0, .08, "sine", .13], [1319, .08, .22, "sine", .13]],
 "reject":  [[196, 0, .16, "triangle", .14, 120]],
 "toggle":  [[660, 0, .05, "sine", .10], [880, .05, .07, "sine", .10]],
 "ready":   [[880, 0, .07, "sine", .07], [1175, .07, .13, "sine", .07]],     # a preview / a long load has finished
 "notify":  [[1047, 0, .08, "sine", .08], [784, .09, .14, "sine", .08]],     # a gentle notice
}

def wave(kind, phase):
    if kind == "sine": return np.sin(phase)
    if kind == "triangle": return (2 / np.pi) * np.arcsin(np.sin(phase))
    if kind == "square":                                   # slightly softened square (no harsh aliasing)
        return np.tanh(6 * np.sin(phase)) * 0.9
    raise ValueError(kind)

def note(f, at, ln, kind, vol, to=None):
    n = int((ln + .03) * SR); t = np.arange(n) / SR
    fr = f * (to / f) ** (np.clip(t / ln, 0, 1)) if to else np.full(n, f, float)
    ph = 2 * np.pi * np.cumsum(fr) / SR
    a = 0.008
    env = np.where(t < a, 1e-4 * (vol / 1e-4) ** (t / a), vol * (1e-4 / vol) ** (np.clip((t - a) / max(ln - a, 1e-3), 0, 1)))
    return int(at * SR), wave(kind, ph) * env

def render(notes):
    total = max(at + ln for _, at, ln, *_ in notes) + .06
    buf = np.zeros(int(total * SR))
    for nn in notes:
        s, y = note(*nn); buf[s:s + len(y)] += y[: len(buf) - s]
    buf[-int(.02 * SR):] *= np.linspace(1, 0, int(.02 * SR))
    return buf

# 1) render every sound at its natural (relative) level - no per-sound limiting
GAP = int(.15 * SR); out = []; sprite = {}; pos = 0
for name, notes in SOUNDS.items():
    y = render(notes)
    sprite[name] = [round(pos / SR * 1000), round(len(y) / SR * 1000)]
    out += [y, np.zeros(GAP)]; pos += len(y) + GAP

# 2) ONE master gain: raise the whole sprite so its loudest sound hits MASTER_PEAK.
#    Every sound keeps its loudness relative to the others (error stays softer than download).
audio = np.concatenate(out)
audio *= MASTER_PEAK / max(abs(audio).max(), 1e-6)

sf.write("/tmp/lumos-ui.wav", audio.astype("float32"), SR, subtype="PCM_16")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "/tmp/lumos-ui.wav", "-ac", "1", "-b:a", "96k", "assets/lumos-ui.mp3"], check=True)
print("total seconds:", round(len(audio) / SR, 2)); print("SPRITE =", json.dumps(sprite))
