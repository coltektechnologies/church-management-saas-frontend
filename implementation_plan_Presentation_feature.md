# Announcement Presentation System

## Context

Church members submit announcements to be projected on a screen during services. The media/admin person manages these announcements and needs to:

1. **Select** which announcements to present
2. **Configure** how they look and are organized
3. **Present** them fullscreen on a projector

---

## UX Flow — 3 Steps

### Step 1: Select Announcements

On the existing admin announcements page, a **"Present Mode"** toggle button appears in the toolbar area.

When activated:

- Checkboxes appear on each announcement card
- A **sticky bottom action bar** slides up showing: selected count, "Select All", "Clear", and a **"Configure Presentation →"** button
- User picks the announcements they want to project (or selects all)

```
┌─────────────────────────────────────────────┐
│  ☑ Sunday Worship    ☑ Prayer Meeting       │
│  ☐ Youth Camp        ☑ Birthday Wishes      │
│  ☑ Funeral Notice    ☐ Health Screening     │
├─────────────────────────────────────────────┤
│  3 selected  │ Select All │ Configure →     │
└─────────────────────────────────────────────┘
```

### Step 2: Configure Presentation (Modal)

A setup modal opens with 4 configuration sections:

| Setting              | Options                                                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Display Template** | Classic, Bold Gradient, Minimal Dark, Warm & Inviting, Royal Purple, Celebration, Urgent/Alert, Nature — each shown as a small thumbnail preview |
| **Transition Style** | Horizontal slide, Vertical slide, Fade crossfade                                                                                                 |
| **Grouping / Order** | None (show in order), By Category, By Priority, By Date                                                                                          |
| **Auto-play**        | Off, 10s, 15s, 20s, 30s                                                                                                                          |

A **live mini-preview** (16:9 thumbnail) at the top of the modal updates in real-time as the user changes settings, showing how the first selected announcement will look.

When grouping is active (e.g., "By Category"), a **category header slide** appears before each group:

```
┌─────────────────────────┐
│      ⛪ EVENTS &        │
│       PROGRAMS          │
│    ─────────────        │
│  3 announcements        │
└─────────────────────────┘
```

At the bottom of the modal:

- **"Save Preset"** — save the configuration + selected announcements for later
- **"Preview"** — open a preview panel within the modal (smaller view)
- **"Launch Presentation ▶"** — open fullscreen in a new browser tab

### Step 3: Fullscreen Presentation

A dedicated route (`/admin/announcements/present`) opens in a new tab, designed for the projector screen:

- Displays one announcement at a time using the selected display template
- If grouped by category, a **header banner** at the top shows the current group (e.g., "📢 Events & Programs")
- Transitions between slides using the selected transition style
- Auto-play cycles through announcements automatically if enabled

**Presenter controls** (auto-hide after 3s, reappear on mouse move):

- `← →` navigation arrows
- Slide counter ("3 / 12")
- Play/Pause toggle for auto-play
- Template quick-switch dropdown
- `Esc` to exit, `F` to toggle fullscreen

---

## Saved Presets

> [!TIP]
> This is a great idea for church workflows. The media person prepares announcements on Saturday, saves as "Sunday March 10 Service", then just loads and presents on Sunday morning.

- Stored in localStorage (mock phase), later in backend
- Each preset saves: selected announcement IDs, display template, transition, grouping, auto-play settings, a user-given name, and creation date
- Accessible from a **"Load Preset"** button next to "Present Mode" on the admin page
- Preview of a preset shows a summary card (name, date, count, template thumbnail)

---

## Proposed Changes

### New Files

#### [NEW] [displayTemplates.ts](file:///d:/PROJECTS/COLTEK/church-management-saas-frontend/services/displayTemplates.ts)

Defines `DisplayTemplate` interface and 8 visual style configs with: background styles, text colors, fonts, accent colors, decorative element descriptions.

#### [NEW] [presentationPresets.ts](file:///d:/PROJECTS/COLTEK/church-management-saas-frontend/services/presentationPresets.ts)

Defines the `PresentationPreset` interface and localStorage CRUD helpers for saving/loading presets.

#### [NEW] [AnnouncementSlide.tsx](file:///d:/PROJECTS/COLTEK/church-management-saas-frontend/components/announcements/AnnouncementSlide.tsx)

Pure render component: takes `announcement + displayTemplate + showGroupHeader + groupName` and renders a fully styled slide. Used by both the modal preview and the presentation page.

#### [NEW] [PresentationSetupModal.tsx](file:///d:/PROJECTS/COLTEK/church-management-saas-frontend/components/announcements/PresentationSetupModal.tsx)

The Step 2 config modal with template picker, transition style, grouping order, auto-play settings, live mini-preview, and save/launch buttons.

#### [NEW] [SelectionActionBar.tsx](file:///d:/PROJECTS/COLTEK/church-management-saas-frontend/components/announcements/SelectionActionBar.tsx)

Sticky bottom bar shown during Present Mode: selected count, select all, clear, configure button.

#### [NEW] [PresetsDrawer.tsx](file:///d:/PROJECTS/COLTEK/church-management-saas-frontend/components/announcements/PresetsDrawer.tsx)

Slide-over drawer listing saved presets with load/delete actions.

#### [NEW] [page.tsx](file:///d:/PROJECTS/COLTEK/church-management-saas-frontend/app/admin/announcements/present/page.tsx)

Fullscreen presentation page with slide rendering, keyboard controls, auto-play, grouped headers, and presenter toolbar.

---

### Modified Files

#### [MODIFY] [page.tsx](file:///d:/PROJECTS/COLTEK/church-management-saas-frontend/app/admin/announcements/page.tsx)

- Add "Present Mode" toggle button in toolbar
- Add checkbox selection state (Set of selected IDs)
- Render `<SelectionActionBar>` when in present mode
- Render `<PresentationSetupModal>` and `<PresetsDrawer>`
- Wire the `onView` card handler to open a quick single-announcement preview

#### [MODIFY] [AnnouncementCard.tsx](file:///d:/PROJECTS/COLTEK/church-management-saas-frontend/components/announcements/AnnouncementCard.tsx)

- Accept `selectable` and `selected` boolean props + `onToggleSelect` callback
- When `selectable=true`, show a checkbox overlay on the card

#### [MODIFY] [AnnouncementsGrid.tsx](file:///d:/PROJECTS/COLTEK/church-management-saas-frontend/components/announcements/AnnouncementsGrid.tsx)

- Pass `selectable`, `selectedIds`, and `onToggleSelect` down to cards

#### [MODIFY] [FloatingActions.tsx](file:///d:/PROJECTS/COLTEK/church-management-saas-frontend/components/announcements/FloatingActions.tsx)

- Hide floating buttons when in "Present Mode" (selection bar takes focus)

---

## Verification Plan

### Browser Testing

1. Toggle "Present Mode" → checkboxes appear on cards
2. Select announcements → sticky bar shows correct count
3. Click "Configure Presentation" → setup modal opens with live preview
4. Change display template → mini-preview updates in real-time
5. Change grouping to "By Category" → preview shows category header
6. Click "Launch Presentation" → fullscreen page opens in new tab
7. Keyboard navigate (← →) through slides
8. Save a preset → verify it appears in the Presets drawer
9. Load a saved preset → verify settings are restored
10. Test all 3 transition styles (horizontal, vertical, fade)
