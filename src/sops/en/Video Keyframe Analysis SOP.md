---
title: Video Keyframe Analysis SOP
type: note
permalink: obsidian-sop/05-aesthetic-collection/video-keyframe-analysis-sop
---

# Video Keyframe Analysis SOP

> Input: multiple keyframe screenshots from a segment of the video (filename prefix `keyframe-`).
> Output: a motion analysis note with two layers of content: design understanding plus implementation conventions.
> Purpose: can be used as a reference for adaptation (understanding the framework and feel), and can also be handed directly to an Agent to implement without back and forth.

---

## Output Format

```
# Motion Analysis - {Video Title} · Motion {N} · {start}s-{end}s

## Keyframe Description
(Describe in frame order: what elements are in the frame, what changes
 between frames. Describe objectively, do not explain the reason.)

## Motion Logic
(The design intent behind these changes: why it moves this way, what the
 rhythm is, what feeling it should give the viewer. Describe the "framework"
 clearly, not specific numbers, so the framework can be reused when the
 content changes.)

## Implementation Conventions
(The following are conventions that must be followed every time you build
 this type of HTML motion overlay. No need to ask again, no need to change
 them:)

- The background is always transparent, for overlaying on top of the real footage
- Adding the `?preview` URL parameter shows a dark gray background `#1a1a1a`, to make it easier to preview white elements; remove the parameter when rendering
- A fixed CONFIG block at the top of the file:
    DURATION = [video duration in ms]   ← controls the length of the rendered video
    FPS      = 30
    [other content parameters]          ← specific to this motion, listed below
- File saved in `Raw/Superpower/`

## My Thoughts
(leave blank)
```

---

## Filling Rules

- **Keyframe Description**: only describe "what you see," write frame by frame, highlight the changes between frames
- **Motion Logic**: answer "why it was done this way," focus on the design framework, do not hardcode specific values (values are content parameters and will change)
- **Implementation Conventions**: this section is exactly the same format every time, copy it over directly, do not modify it

---

## Handling Multiple Frames

- Describe in chronological order, do not skip frames
- When the difference between frames is small (continuous animation): focus on the overall sense of motion, do not list frame by frame
- When the difference between frames is large (there are cuts or transitions): focus on analyzing the rhythm and logic of the transitions
