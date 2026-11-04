# Exam center: bamboo and exam catalog

## Configuration

`src/config/exam_blueprint.json` is the server-side source for level question counts, duration, skills, maximum score and target. Values are the product configuration supplied by the project owner, not an external claim about official exams. The frontend receives these values through the authenticated exam-center API. Paper rows and introductions show their actual stored configuration, so a private practice paper does not inherit an official paper's duration or score threshold.

A paper-specific Admin publication or existing assignment duration takes precedence for that paper. Blueprint duration is the fallback. Target thresholds only apply when the paper's score scale matches the blueprint. Existing attempt snapshots keep their original settings.

For HSK 7–9, `maxScore` and `targetScore` are intentionally null. `classificationBands` accepts explicit `{minScore,maxScore,label}` ranges when the product owner supplies them. Empty ranges produce “Chờ phân loại” after grading, never an invented pass/fail result. Each new official attempt snapshots these rules.

Recommendations use the most recently graded attempt's skill deficits and available approved papers. New papers take priority; no recommendation is fabricated when the bank has no suitable paper. Trend charts retain separate HSK levels and score scales.

## Background asset

Asset: `public/theme/exam-bamboo-depth.png`.
Generated with the built-in image generation tool using the supplied bamboo image as a style reference. The background contains no baked-in text. All page headings, statistics and buttons are HTML.

Final prompt:

> Create a web background asset, wide landscape 16:9. Match the attached reference's sculptural bamboo: large jade-green cylindrical bamboo stalks with raised joints, one sharply focused thick stalk around 62% width, pale ivory bamboo on right, distant horizontal and bent green bamboo blurred by depth of field. Fine analog paper grain, softly lit, elegant Chinese contemporary ink atmosphere. Off-white ivory background. Keep left 45% mostly empty light ivory for HTML headings. Right half contains bamboo going beyond upper and lower frame. A few very small ochre leaves. No words, no typography, no lettering, no logo, no watermarks, no UI, no borders. This is only a decorative background, not a screenshot.

CSS adds a light overlay for readable content and increases its opacity on mobile.
