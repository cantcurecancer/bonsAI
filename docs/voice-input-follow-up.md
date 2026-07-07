# Voice input (local STT) — maintainer follow-up

Operational guide for **Whisper voice Ask** on Steam Deck. User setup: [troubleshooting.md](troubleshooting.md) § Voice input. QA: [testing.md](testing.md) Tier 2 — Voice input.

## What shipped (2026-07-07)

### Reliability fixes

| Issue | Cause | Fix |
|-------|--------|-----|
| Mic on, no text | Prebuilt `whisper-cli` from floating `:main` podman image → **SIGILL** on Deck Zen 2 during decode | **CPU-safe compile** on install (`GGML_NATIVE=OFF`, AVX512 off) + inference smoke test + `.bonsai_cpu_safe` marker |
| Mic on, no text | Gaming Mode mic RMS ~150–250 vs **350** decode gate | `VOICE_RMS_THRESHOLD = 120`; filler rejection stays at **875 RMS** |
| Regression during fix | `_pcm_rms` accidentally removed | Restored |

### Tier 1 latency tuning (low risk)

Constants in [`voice_transcription_service.py`](../py_modules/backend/services/voice_transcription_service.py) and [`useVoiceTranscription.ts`](../src/hooks/useVoiceTranscription.ts):

| Constant | Was | Now | Effect |
|----------|-----|-----|--------|
| `TRANSCRIBE_INTERVAL_S` | 0.7 | **0.4** | Decode passes more often while recording |
| `WINDOW_SECONDS` | 5 | **3** | Smaller rolling window → earlier first interim text |
| `WHISPER_MIN_DECODE_PCM_BYTES` | 0.5 s | **0.25 s** | First pass starts sooner |
| `WHISPER_THREADS` | 2 | **4** | Faster encode on Deck APU |
| `VOICE_TRANSCRIPTION_POLL_MS` | 300 | **150** | UI picks up transcript sooner |

**Tradeoff:** More CPU/battery while the mic is active; may contend with heavy games.

### Pinned podman image

Install uses a **digest-pinned** whisper.cpp image (not `:main`):

```text
ghcr.io/ggml-org/whisper.cpp@sha256:c0b535add76d7ff7613c70f32a7a4c794985f94238501e1b5b3b7f0eb56e9685
```

Defined as `WHISPER_CPP_IMAGE` in `voice_transcription_service.py`. Source still compiles inside that image with Deck-safe CMake flags.

#### Bumping the digest (maintainers)

1. On a Deck (or Linux box with podman): `podman pull ghcr.io/ggml-org/whisper.cpp:main` (or a release tag).
2. `podman inspect … --format '{{.Digest}}'` → update `WHISPER_CPP_IMAGE` in code.
3. Delete `~/homebrew/settings/bonsAI/voice_bin/` (or use **Install voice engine**) and reinstall.
4. Confirm: `whisper-cli` inference smoke passes; mic → interim text in QAM (**VOICE-02**).
5. Do **not** revert to copying prebuilt binaries from the image without a Deck CPU-safe compile.

---

## If voice breaks again — triage checklist

1. **Permissions** → Voice input (microphone) on.
2. **Settings → Voice input** → engine + model ready; if not, **Install voice engine**.
3. **Symptom: red mic, no text**
   - Capture OK but no whisper: check plugin logs; run inference manually (see troubleshooting).
   - **SIGILL / illegal instruction** → stale or wrong `voice_bin`; reinstall with pinned digest + CPU-safe build.
   - **Low RMS / no passes** → speak closer/louder; check `VOICE_RMS_THRESHOLD` in code.
4. **Symptom: install fails** → podman missing, compile timeout, or digest pull failure.
5. **Upstream churn** → Did someone change `WHISPER_CPP_IMAGE` back to `:main` or re-enable `_extract_whisper_from_container` without compile?

Architecture hotspot: [`voice_transcription_service.py`](../py_modules/backend/services/voice_transcription_service.py) (`VoiceTranscriptionSession`, `install_whisper_cli`, `_build_whisper_cli_in_container`).

---

## Tier 2 — lower latency (planned; higher effort)

Pick up here if Tier 1 tuning is not enough. Stars = roadmap GTA scale.

### ★★ Session-scoped whisper daemon (recommended next)

| | |
|--|--|
| **Goal** | Keep one `whisper-cli` (or thin wrapper) alive per mic session; model loads once. |
| **Latency win** | ~0.5–1.5 s per update (no per-pass process spawn + model load). |
| **Maintenance** | Medium — lifecycle, crash recovery, plugin unload while recording. |
| **Break risk** | Medium — subprocess/protocol bugs; needs **VOICE-06** on-Deck QA. |
| **Files** | `voice_transcription_service.py`, `main.py`, possibly new `voice_whisper_daemon.py`. |

### ★ Pin digest + CI prebuild (stability, not speed)

Build CPU-safe `voice_bin` in CI on x86_64; ship in release zip or lazy download. Skips ~60 s compile on Deck at install.

### ★★★ GPU / Vulkan whisper on Deck

**Not recommended** — driver/gamescope variance; high break risk; FOSS transparency cost.

### Anti-patterns (do not repeat)

- Floating `ghcr.io/ggml-org/whisper.cpp:main` + **copy prebuilt** binary to host without Deck smoke test.
- Readiness check = `whisper-cli -h` only (must run inference smoke).
- Cloud STT for default path (privacy / offline promise).

---

## Current pipeline (reference)

```text
pw-record → PCM ring buffer
  → every TRANSCRIBE_INTERVAL_S, if RMS ≥ VOICE_RMS_THRESHOLD:
       subprocess whisper-cli on WINDOW_SECONDS of audio  # Tier 2: reuse one process
  → poll get_voice_transcription_status every VOICE_TRANSCRIPTION_POLL_MS
  → unified Ask input
```

Decode still runs on **CPU** with `tiny.en` by default; ~1–2 s encode per pass on Deck is normal after Tier 1.

---

## Roadmap

Tracked as **Planned** → [Voice STT session daemon](roadmap.md) (near-term). After Tier 2 ships: move summary to [archive/roadmap-completed.md](archive/roadmap-completed.md).
