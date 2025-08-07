# Design Peer Review Helper - Moody's IRP

A Figma plugin that streamlines design peer review preparation with automated validation, collaborative checklists, and integrated peer review functionality.

## 🚀 Quick Start

1. **Install**: Plugins > Development > Import plugin from manifest > Select `manifest.json`
2. **Run**: Open the plugin from your Plugins menu
3. **Use**: Complete checklist, review validation, and get peer sign-off

## ✅ Features

### 📋 Manual Checks Tab
- 5 verification items with expandable help text
- Real-time collaboration with user avatars and timestamps
- Feature-specific progress tracking

### 🔍 Auto Checks Tab
- **Frame Names**: 15+ chars, descriptive, no duplicates
- **Overview Board**: Must exist on current page
- **Sections**: All top-level frames must be wrapped
- Click problematic frames to select them in Figma

### 👥 Peer Review Tab
- Protected peer review sign-off ("This feature has been peer reviewed")
- Comment system with user avatars and deletion controls
- Only reviewer can uncheck their own review


## 🔧 Technical Details

- **Data Storage**: Feature-specific, shared across users
- **Permissions**: User-based controls for peer review and comments
- **Validation**: Automated checks with clickable navigation to issues
- **Network Access**: Supports Figma profile picture loading

Perfect for design teams who value quality, collaboration, and efficiency! 🎨✨