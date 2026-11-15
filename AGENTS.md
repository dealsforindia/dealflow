# Workspace Agent Configuration

## Skills Installed
- **Cloudflare Security Audit Skill (`security-audit`)**: Located at `.agents/skills/security-audit/SKILL.md` (and mirrored in sub-projects: `dealflow`, `dealflow-edge`, `dealflow-remotion`, `rudranil-deals-web`, `dealbot_backend`, `tg-setup`).
  - Trigger words: `security audit`, `find vulnerabilities`, `pen-test`, `security review`.
  - Phases: Reconnaissance -> Coverage-Led Hunting -> Candidate Validation -> Structured Output (`findings.json`) -> Independent Record Verification -> Target-Neutral Reporting.
- **Impeccable Design Engine (`impeccable`)**: UI anti-pattern detection, design systems, and frontend critique.
- **AI Video Editor (`ai-video-editor`)**: Edit a talking-head video end to end for free (local Whisper + ffmpeg + headless Chromium; cuts silences/mistakes, adds motion graphics in 7 styles, renders final MP4, English/Hindi). Installed from `C:\Users\Neel\Downloads\ai-video-editor.zip` to `.claude\skills\ai-video-editor/`.

## Sub-Project Ecosystem
- **IndiaDealHunts Storefront (`indiadealhunts.me`)**: `rudranil-deals-web/`
- **FastAPI Backend Core**: `dealbot_backend/`
- **Cloudflare Edge Gateway**: `dealflow-edge/`
- **DealFlow Infrastructure & Diagnostics**: `dealflow/`
- **Admin Curation Deck**: `tg-setup/`
- **DealFlow Remotion Engine**: `dealflow-remotion/`

