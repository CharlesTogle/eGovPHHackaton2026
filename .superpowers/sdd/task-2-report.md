Status: DONE

Files changed:
- src/components/TranslateWidget.tsx
- src/components/CitizenHelpChat.tsx

Summary of edits:
- Updated `TranslateWidget` to track an explicit resident-facing status label from `res.source` and to show `Live eGov AI`, `Fallback`, or `Unavailable` honestly.
- Prevented unavailable translation responses from rendering as successful translated text by clearing `translatedText` when `source === "unavailable"`.
- Replaced the previous generic error rendering with the explicit unavailable-state message from the task brief.
- Updated `CitizenHelpChat` to track `lastSource` from `askAiAssistant()` and use it for the header status badge so fallback responses are not labeled as live eGov AI.
- Added the three HANDA-specific prompt chips that prefill the chat input.
- Updated per-message AI source labels to match `source` values instead of only `is_live_api`.

Verification command(s):
- `npm run build`

Verification output/result:
- Result: PASS
- Output:
```text
> egov-hackaton@0.0.0 build
> tsc -b && vite build

vite v8.1.5 building client environment for production...
transforming...✓ 89 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.74 kB │ gzip:   0.43 kB
dist/assets/index-DAgDGE8V.css   49.67 kB │ gzip:  10.14 kB
dist/assets/index-BHEZIZrM.js   593.83 kB │ gzip: 158.61 kB

[plugin builtin:vite-reporter]
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rolldownOptions.output.codeSplitting to improve chunking: https://rolldown.rs/reference/OutputOptions.codeSplitting
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.

✓ built in 317ms
```

Self-review notes:
- Kept changes frontend-only and limited to the two requested components.
- Did not edit `src/App.tsx`.
- Ensured unavailable translation responses no longer show fake bracketed or fallback text as a successful translation.
- Ensured Gemini/local fallback chat responses do not display as live eGov AI.
- Matched the task brief labels and prompt chip copy verbatim.

Concerns:
- None blocking. The build passed; the only output beyond success was Vite's existing chunk-size warning.
