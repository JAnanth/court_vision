# CourtVision MVP - 10-Day Hackathon Development Specification

## Project Overview

**Name**: CourtVision  
**Purpose**: AI-powered basketball video analysis tool that provides coaches and players with automated shot tracking, player movement analysis, and AI-generated insights  
**Hackathon**: Alameda Hacks (January 1-11, 2026)  
**Core Innovation**: Real-time computer vision analysis combined with LLM-generated tactical insights

## Executive Summary for Claude Code

You are building an MVP of CourtVision - a sports analytics platform that uses computer vision and AI to analyze basketball game footage. The goal is to create a **functional, visually polished demo** that showcases the potential of automated sports video analysis while being realistic for a 10-day hackathon timeline.

**What makes this special**: Unlike traditional sports analytics tools that require manual data entry or expensive hardware, CourtVision automatically extracts meaningful insights from standard video recordings using modern CV and AI techniques.

## MVP Scope (What We're Building)

### Core Features (Must-Have)

1. **Video Upload & Management**
   - Simple web interface for uploading basketball game videos
   - Support MP4 format, 720p-1080p resolution
   - Display upload progress and video preview

2. **Automated Computer Vision Analysis**
   - Player detection and tracking (using YOLOv8 + ByteTrack)
   - Basketball detection and tracking
   - Shot detection (identify when shots are taken)
   - Shot outcome classification (make vs miss)
   - Court/hoop detection for spatial context

3. **Visual Analysis Dashboard**
   - Shot chart showing where shots were taken on the court
   - Player movement heatmaps
   - Basic statistics: shooting percentage, shots by location, player activity
   - Annotated video output with bounding boxes and tracking IDs

4. **AI-Generated Insights**
   - Integration with Claude API to generate natural language insights
   - Analysis of shooting patterns, defensive positioning, player efficiency
   - Actionable recommendations for coaches/players

5. **Simple, Clean UI**
   - Landing page explaining the value proposition
   - Upload flow
   - Processing status indicator
   - Results dashboard with visualizations

### Explicitly Out of Scope (For This MVP)

- Real-time video processing (batch processing only)
- Custom model training
- User accounts/authentication (single-user demo)
- Advanced tactical analysis (play recognition, defensive schemes)
- Mobile app
- Play-by-play commentary
- Multiple sport support

## Technical Architecture

### Tech Stack

#### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS
- **Key Libraries**:
  - React Dropzone (file upload)
  - Recharts (data visualization)
  - Video.js (video player)
  - Axios (API calls)

#### Backend
- **Framework**: Python FastAPI
- **ML/CV Libraries**:
  - Ultralytics YOLOv8 (object detection)
  - ByteTrack (multi-object tracking)
  - OpenCV (video processing, court detection)
  - NumPy (numerical operations)
- **AI Integration**: Anthropic Claude API
- **File Storage**: Local filesystem (for MVP, S3 for production)
- **Task Queue**: Python threading or asyncio (simple async processing)

#### Infrastructure (Simple/Local)
- Run everything locally for demo purposes
- Use CUDA GPU if available, otherwise CPU (with clear processing time expectations)
- Basic progress tracking with websockets or polling

## Detailed Component Specifications

### 1. Video Upload Component

**Purpose**: Allow users to upload basketball game footage

**Requirements**:
- Drag-and-drop interface
- File validation (MP4 only, max 500MB for demo)
- Upload progress bar
- Preview uploaded video
- Start processing button

**Implementation Notes**:
- Use `react-dropzone` for clean upload UX
- Validate file type and size on frontend and backend
- Store uploaded videos in `/uploads` directory
- Generate unique IDs for each upload

### 2. Computer Vision Pipeline

**Purpose**: Extract meaningful data from video using ML models

**Pipeline Flow**:
```
Video Input → Frame Extraction → Object Detection → Object Tracking → Shot Analysis → Court Mapping → Results
```

**Component 2a: Frame Extraction**
- Extract frames at 10 FPS (process every 3rd frame at 30fps source)
- Reason: Balance between processing speed and accuracy
- Use OpenCV VideoCapture

**Component 2b: Object Detection (YOLOv8)**
- Use pre-trained YOLOv8n model (fastest variant)
- Detect classes: person (players), sports ball (basketball)
- Confidence threshold: 0.5 for persons, 0.3 for ball (lower for ball due to occlusion)
- Output: bounding boxes, class IDs, confidence scores per frame

**Component 2c: Object Tracking (ByteTrack)**
- Assign persistent IDs to detected players across frames
- Track ball movement
- Handle occlusions and re-identification
- Output: tracking IDs, trajectories

**Component 2d: Court Detection**
- Use classical CV (Hough Line Transform) to detect court boundaries
- Detect hoop location (look for circular/rectangular structure at standard height)
- Create homography mapping (camera view → 2D court representation)
- Fallback: Manual annotation if auto-detection fails (stretch goal)

**Component 2e: Shot Detection & Classification**
- **Shot Detection Logic**:
  1. Track ball trajectory over time
  2. Detect upward parabolic motion toward hoop
  3. Identify release point (transition from player possession to flight)
  4. Flag as potential shot
- **Make/Miss Classification**:
  1. Track ball position relative to hoop
  2. If ball passes through hoop region: MAKE
  3. If ball trajectory peaks before hoop or misses hoop: MISS
  4. If uncertain: mark as "unknown" with confidence score
- **Spatial Context**:
  - Map shot locations to court coordinates
  - Categorize by zone (paint, mid-range, three-point)

**Component 2f: Statistics Generation**
- Aggregate data across all frames:
  - Total shots attempted
  - Makes and misses
  - Shooting percentage overall and by zone
  - Player movement patterns (heatmaps)
  - Most active areas of the court

### 3. AI Insights Generation

**Purpose**: Generate human-readable analysis using Claude API

**Integration**:
- Use Anthropic Claude API (Sonnet 4.5)
- Send structured data from CV pipeline as context
- Request natural language insights

**Prompt Template**:
```
You are a basketball analyst reviewing game footage data. Based on the following statistics, provide insights and recommendations for improvement:

Game Statistics:
- Total Shots: {total_shots}
- Makes: {makes}
- Misses: {misses}
- Shooting Percentage: {percentage}%

Shot Distribution:
- Paint: {paint_shots} attempts, {paint_percentage}% accuracy
- Mid-range: {midrange_shots} attempts, {midrange_percentage}% accuracy
- Three-point: {three_shots} attempts, {three_percentage}% accuracy

Player Movement:
- Most active zones: {active_zones}
- Average distance covered: {distance}

Provide:
1. Key strengths identified in this performance
2. Areas for improvement
3. Specific, actionable recommendations for the player/team
4. Tactical insights about shot selection and positioning

Keep analysis professional, constructive, and focused on actionable insights.
```

**Output Format**:
- Structured sections (Strengths, Improvements, Recommendations)
- 3-5 bullet points per section
- Concise, coach-appropriate language

### 4. Visualization Dashboard

**Purpose**: Display analysis results in an intuitive, visually appealing format

**Required Visualizations**:

**A. Shot Chart**
- 2D basketball court representation
- Dots showing shot locations (color-coded: green = make, red = miss)
- Zone overlays (paint, mid-range, three-point line)
- Implementation: HTML Canvas or SVG with React

**B. Shooting Statistics Panel**
- Overall shooting percentage (large, prominent number)
- Breakdown by zone (bar chart)
- Comparison to typical percentages (show if above/below average)
- Implementation: Recharts bar/pie charts

**C. Heatmap**
- Player movement density over court
- Color gradient (blue = low activity, red = high activity)
- Implementation: Canvas-based heatmap or library like heatmap.js

**D. Timeline View**
- Shot events over game time
- Markers for makes/misses
- Scrubbing functionality to jump to specific shots
- Implementation: Custom timeline component

**E. Annotated Video**
- Original video with overlays:
  - Bounding boxes around players (colored by tracking ID)
  - Ball tracking trail
  - Shot indicators (when shots occur)
  - Make/miss labels
- Implementation: Canvas overlay on Video.js player

### 5. User Interface Flow

**Page 1: Landing Page**
```
┌─────────────────────────────────────┐
│         CourtVision Logo            │
│                                     │
│   AI-Powered Basketball Analysis    │
│                                     │
│  [Upload Your Game Footage] Button  │
│                                     │
│   How It Works:                     │
│   1. Upload video                   │
│   2. AI analyzes gameplay           │
│   3. Get insights in minutes        │
│                                     │
│   [See Demo Video]                  │
└─────────────────────────────────────┘
```

**Page 2: Upload Page**
```
┌─────────────────────────────────────┐
│  ← Back                             │
│                                     │
│  Upload Your Basketball Footage     │
│                                     │
│  ┌───────────────────────────────┐ │
│  │                               │ │
│  │   Drag & Drop Video Here      │ │
│  │   or Click to Browse          │ │
│  │   (MP4, max 500MB)            │ │
│  │                               │ │
│  └───────────────────────────────┘ │
│                                     │
│  [Selected: game_footage.mp4]       │
│  [Progress: ████████░░ 80%]         │
│                                     │
│  [Start Analysis] Button            │
└─────────────────────────────────────┘
```

**Page 3: Processing Page**
```
┌─────────────────────────────────────┐
│  Analyzing Your Video...            │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  ████████████░░░░░░░░░░░  60% │ │
│  └───────────────────────────────┘ │
│                                     │
│  Current Step: Detecting Players    │
│                                     │
│  ✓ Video uploaded                   │
│  ✓ Extracting frames                │
│  → Detecting players & ball         │
│  ○ Tracking movement                │
│  ○ Analyzing shots                  │
│  ○ Generating insights              │
│                                     │
│  Estimated time: 3 minutes          │
└─────────────────────────────────────┘
```

**Page 4: Results Dashboard**
```
┌──────────────────────────────────────────────┐
│ CourtVision Results                  [Export]│
├──────────────────────────────────────────────┤
│                                              │
│ ┌──────────────┐  ┌────────────────────┐    │
│ │   SHOOTING   │  │   AI INSIGHTS      │    │
│ │     45%      │  │                    │    │
│ │   Overall    │  │  Key Strengths:    │    │
│ │              │  │  • Strong paint... │    │
│ │  Paint: 60%  │  │  • Consistent...   │    │
│ │  Mid: 40%    │  │                    │    │
│ │  3PT: 35%    │  │  Recommendations:  │    │
│ └──────────────┘  │  • Focus on...     │    │
│                   │  • Work on...      │    │
│                   └────────────────────┘    │
│                                              │
│ ┌──────────────────────────────────────────┐│
│ │          SHOT CHART                      ││
│ │  [Basketball court with shot markers]    ││
│ └──────────────────────────────────────────┘│
│                                              │
│ ┌──────────────────────────────────────────┐│
│ │       PLAYER MOVEMENT HEATMAP            ││
│ │  [Court heatmap visualization]           ││
│ └──────────────────────────────────────────┘│
│                                              │
│ ┌──────────────────────────────────────────┐│
│ │       ANNOTATED VIDEO PLAYBACK           ││
│ │  [Video player with CV overlays]         ││
│ └──────────────────────────────────────────┘│
│                                              │
└──────────────────────────────────────────────┘
```

## Visual Design Specification

### Design Philosophy

**Goal**: Create a modern, professional sports analytics platform that feels premium and trustworthy while remaining accessible and easy to use. The design should be impressive in demo videos and screenshots.

**Inspiration**: Combine the clean data visualization of Tableau/Power BI with the modern aesthetics of Linear/Notion and the sports-focused energy of ESPN/The Athletic.

**Key Principles**:
1. **Data-First**: Visualizations are the hero, UI chrome is minimal
2. **Progressive Disclosure**: Show simple by default, reveal complexity on interaction
3. **High Contrast**: Ensure readability in demo videos and presentations
4. **Motion & Delight**: Subtle animations make the app feel alive and professional
5. **Sports Energy**: Use basketball-themed accents without being cartoonish

### Color Palette

**Primary Colors** (Basketball-themed):
- **Court Orange**: `#FF6B2C` - Primary brand color, CTAs, highlights
- **Deep Navy**: `#1A1F2E` - Headers, primary text, dark backgrounds
- **Court Wood**: `#D4A574` - Subtle accents, secondary backgrounds

**Semantic Colors** (Data visualization):
- **Success Green**: `#10B981` - Makes, positive metrics, success states
- **Error Red**: `#EF4444` - Misses, warnings, error states  
- **Info Blue**: `#3B82F6` - Information, links, neutral highlights
- **Warning Amber**: `#F59E0B` - Cautions, uncertain classifications

**Neutrals** (UI framework):
- **Gray 50**: `#F9FAFB` - Page backgrounds
- **Gray 100**: `#F3F4F6` - Card backgrounds, subtle dividers
- **Gray 200**: `#E5E7EB` - Borders, dividers
- **Gray 400**: `#9CA3AF` - Placeholder text, disabled states
- **Gray 600**: `#4B5563` - Secondary text
- **Gray 800**: `#1F2937` - Primary text
- **Gray 900**: `#111827` - Headings, emphasis

**Usage Guidelines**:
- Use Court Orange sparingly for maximum impact (CTAs, active states, key metrics)
- Deep Navy for headers and navigation to ground the design
- Success Green and Error Red ONLY for makes/misses - strong semantic association
- Gray 50 for page backgrounds to create visual hierarchy with white cards

### Typography

**Font Stack**: 
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Type Scale**:
- **Display (64px/72px)**: Hero numbers (shooting percentage on results page)
- **Heading 1 (36px/44px)**: Page titles (Semi-bold, tracking: -0.02em)
- **Heading 2 (24px/32px)**: Section headers (Semi-bold)
- **Heading 3 (20px/28px)**: Card titles (Medium)
- **Body Large (18px/28px)**: Important body text, CTAs
- **Body (16px/24px)**: Default body text (Regular)
- **Body Small (14px/20px)**: Secondary text, captions (Regular)
- **Label (12px/16px)**: Labels, metadata (Medium, uppercase, tracking: 0.05em)

**Font Weights**:
- Regular (400): Body text
- Medium (500): Labels, button text
- Semi-bold (600): Headings, emphasis
- Bold (700): Display numbers only

**Examples**:
```css
/* Hero Metric */
.hero-metric {
  font-size: 64px;
  font-weight: 700;
  line-height: 72px;
  letter-spacing: -0.02em;
  color: #1A1F2E;
}

/* Section Header */
.section-header {
  font-size: 24px;
  font-weight: 600;
  line-height: 32px;
  color: #111827;
}

/* Body Text */
.body-text {
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  color: #4B5563;
}

/* Label */
.label {
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #6B7280;
}
```

### Component Design System

#### Buttons

**Primary Button** (Main CTAs):
```css
.btn-primary {
  background: linear-gradient(135deg, #FF6B2C 0%, #FF8F5C 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  border: none;
  box-shadow: 0 4px 12px rgba(255, 107, 44, 0.3);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 44, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(255, 107, 44, 0.3);
}
```

**Secondary Button**:
```css
.btn-secondary {
  background: white;
  color: #1A1F2E;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  border: 2px solid #E5E7EB;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  border-color: #FF6B2C;
  color: #FF6B2C;
}
```

**Icon Buttons** (Small actions):
```css
.btn-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #E5E7EB;
  color: #6B7280;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
  color: #111827;
}
```

#### Cards

**Standard Card** (Containers for content sections):
```css
.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 
              0 1px 2px rgba(0, 0, 0, 0.06);
  border: 1px solid #F3F4F6;
  transition: box-shadow 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07), 
              0 2px 4px rgba(0, 0, 0, 0.05);
}
```

**Stat Card** (For displaying key metrics):
```css
.stat-card {
  background: linear-gradient(135deg, #1A1F2E 0%, #2D3748 100%);
  border-radius: 16px;
  padding: 32px;
  color: white;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255, 107, 44, 0.2) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(30%, -30%);
}
```

**Insight Card** (For AI-generated content):
```css
.insight-card {
  background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%);
  border-radius: 12px;
  padding: 24px;
  border-left: 4px solid #3B82F6;
  position: relative;
}

.insight-card::before {
  content: '💡';
  position: absolute;
  top: 24px;
  right: 24px;
  font-size: 24px;
  opacity: 0.3;
}
```

#### Progress & Loading States

**Progress Bar**:
```css
.progress-container {
  width: 100%;
  height: 8px;
  background: #E5E7EB;
  border-radius: 9999px;
  overflow: hidden;
  position: relative;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #FF6B2C 0%, #FF8F5C 100%);
  border-radius: 9999px;
  transition: width 0.3s ease;
  position: relative;
  overflow: hidden;
}

.progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

**Loading Spinner** (Processing state):
```css
.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #E5E7EB;
  border-top-color: #FF6B2C;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

**Step Indicator** (Processing steps):
```css
.step {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
}

.step-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.step-icon.complete {
  background: #10B981;
  color: white;
}

.step-icon.active {
  background: #FF6B2C;
  color: white;
  animation: pulse 2s ease-in-out infinite;
}

.step-icon.pending {
  background: #E5E7EB;
  color: #9CA3AF;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

### Page-by-Page Design Specifications

#### Landing Page (Hero Section)

**Layout**:
- Full viewport height
- Centered content with max-width 1200px
- Gradient background from Deep Navy to subtle gray

**Design Details**:
```css
.hero-section {
  min-height: 100vh;
  background: linear-gradient(180deg, #1A1F2E 0%, #2D3748 50%, #374151 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* Animated basketball court lines in background */
.hero-section::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: url('data:image/svg+xml,...'); /* Court line pattern */
  opacity: 0.05;
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}
```

**Logo Design**:
- Basketball icon integrated with "CourtVision" text
- White text with subtle orange accent on "Vision"
- Size: 48px height for logo, 32px for text

**Headline**:
```html
<h1 class="hero-headline">
  Transform Game Footage into
  <span class="gradient-text">Actionable Insights</span>
</h1>

<style>
.hero-headline {
  font-size: 56px;
  font-weight: 700;
  line-height: 1.2;
  color: white;
  margin-bottom: 24px;
  text-align: center;
}

.gradient-text {
  background: linear-gradient(135deg, #FF6B2C 0%, #FFB02C 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
```

**Subheadline**:
```html
<p class="hero-subheadline">
  AI-powered basketball analysis that gives coaches and players 
  professional-level insights in minutes, not hours.
</p>

<style>
.hero-subheadline {
  font-size: 20px;
  line-height: 32px;
  color: #D1D5DB;
  max-width: 600px;
  margin: 0 auto 48px;
  text-align: center;
}
</style>
```

**CTA Button** (Upload Your Game Footage):
- Large, prominent button: 56px height
- Glowing effect on hover
- Icon: Upload arrow or basketball icon

```css
.hero-cta {
  background: linear-gradient(135deg, #FF6B2C 0%, #FF8F5C 100%);
  color: white;
  padding: 16px 48px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 12px;
  border: none;
  box-shadow: 0 8px 32px rgba(255, 107, 44, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.hero-cta:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(255, 107, 44, 0.5);
}

.hero-cta:active {
  transform: translateY(-2px);
}
```

**Feature Cards** (How It Works):
- Three cards in a row below CTA
- Glass morphism effect (semi-transparent with blur)
- Icon + Title + Description

```css
.feature-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  transition: all 0.3s ease;
}

.feature-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-8px);
}

.feature-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #FF6B2C 0%, #FFB02C 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 32px;
}
```

#### Upload Page

**Layout**:
- Centered vertically and horizontally
- Max-width 800px
- Clean, focused interface

**Header**:
```html
<header class="upload-header">
  <button class="back-button">
    <svg><!-- Back arrow --></svg>
    Back
  </button>
  <h1>Upload Your Basketball Footage</h1>
  <p>Supported formats: MP4 • Max size: 500MB</p>
</header>

<style>
.upload-header h1 {
  font-size: 36px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
}

.upload-header p {
  font-size: 14px;
  color: #6B7280;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6B7280;
  background: none;
  border: none;
  padding: 8px 0;
  margin-bottom: 32px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.back-button:hover {
  color: #111827;
}
</style>
```

**Upload Dropzone**:
```css
.upload-dropzone {
  width: 100%;
  min-height: 400px;
  border: 2px dashed #D1D5DB;
  border-radius: 16px;
  background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 48px;
  position: relative;
}

.upload-dropzone:hover {
  border-color: #FF6B2C;
  background: linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%);
}

.upload-dropzone.active {
  border-color: #10B981;
  background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);
  border-style: solid;
}

.upload-icon {
  width: 96px;
  height: 96px;
  background: linear-gradient(135deg, #FF6B2C 0%, #FFB02C 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(255, 107, 44, 0.3);
}

.upload-icon svg {
  width: 48px;
  height: 48px;
  color: white;
}

.upload-text-primary {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
}

.upload-text-secondary {
  font-size: 16px;
  color: #6B7280;
}
```

**File Preview** (After selection):
```css
.file-preview {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid #E5E7EB;
  margin-top: 24px;
}

.file-preview-icon {
  width: 48px;
  height: 48px;
  background: #F3F4F6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6B7280;
}

.file-preview-info {
  flex: 1;
}

.file-preview-name {
  font-size: 16px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 4px;
}

.file-preview-size {
  font-size: 14px;
  color: #6B7280;
}

.file-preview-remove {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #FEE2E2;
  color: #EF4444;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-preview-remove:hover {
  background: #FCA5A5;
  color: white;
}
```

**Upload Progress Bar** (During upload):
```css
.upload-progress {
  width: 100%;
  margin-top: 24px;
}

.upload-progress-bar-container {
  width: 100%;
  height: 12px;
  background: #E5E7EB;
  border-radius: 9999px;
  overflow: hidden;
  position: relative;
}

.upload-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #10B981 0%, #34D399 100%);
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.upload-progress-text {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 14px;
  color: #6B7280;
}
```

**Start Analysis Button**:
```css
.start-analysis-button {
  width: 100%;
  background: linear-gradient(135deg, #FF6B2C 0%, #FF8F5C 100%);
  color: white;
  padding: 16px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 12px;
  border: none;
  margin-top: 24px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(255, 107, 44, 0.3);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.start-analysis-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(255, 107, 44, 0.4);
}

.start-analysis-button:disabled {
  background: #9CA3AF;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
```

#### Processing Page

**Layout**:
- Centered content, max-width 600px
- Generous whitespace
- Animated elements to show activity

**Processing Animation** (Central focus):
```css
.processing-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px;
}

.processing-animation {
  width: 200px;
  height: 200px;
  position: relative;
  margin-bottom: 48px;
}

/* Animated basketball */
.basketball-bounce {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #FF6B2C 0%, #D65A1C 100%);
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: bounce 1.5s ease-in-out infinite;
  box-shadow: 0 8px 32px rgba(255, 107, 44, 0.4);
}

@keyframes bounce {
  0%, 100% { transform: translate(-50%, -50%) translateY(0); }
  50% { transform: translate(-50%, -50%) translateY(-40px); }
}

/* Orbiting rings */
.processing-ring {
  position: absolute;
  border: 2px solid #E5E7EB;
  border-radius: 50%;
  animation: rotate 3s linear infinite;
}

.processing-ring:nth-child(1) {
  width: 120px;
  height: 120px;
  top: 40px;
  left: 40px;
  border-top-color: #FF6B2C;
}

.processing-ring:nth-child(2) {
  width: 160px;
  height: 160px;
  top: 20px;
  left: 20px;
  border-top-color: #3B82F6;
  animation-duration: 4s;
}

@keyframes rotate {
  to { transform: rotate(360deg); }
}
```

**Progress Indicator**:
```css
.progress-percentage {
  font-size: 48px;
  font-weight: 700;
  color: #FF6B2C;
  margin-bottom: 16px;
  font-variant-numeric: tabular-nums;
}

.progress-bar-large {
  width: 100%;
  height: 16px;
  background: #E5E7EB;
  border-radius: 9999px;
  overflow: hidden;
  margin-bottom: 32px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-fill-large {
  height: 100%;
  background: linear-gradient(90deg, #FF6B2C 0%, #FFB02C 100%);
  border-radius: 9999px;
  transition: width 0.5s ease;
  position: relative;
  overflow: hidden;
}

.progress-fill-large::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  animation: shimmer 1.5s infinite;
}
```

**Step List**:
```css
.step-list {
  width: 100%;
  max-width: 400px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.step-item.complete {
  background: #F0FDF4;
}

.step-item.active {
  background: #FFF7ED;
  animation: pulse-bg 2s ease-in-out infinite;
}

.step-item.pending {
  opacity: 0.5;
}

@keyframes pulse-bg {
  0%, 100% { background: #FFF7ED; }
  50% { background: #FFEDD5; }
}

.step-status-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-status-icon.complete {
  background: #10B981;
  color: white;
}

.step-status-icon.active {
  background: #FF6B2C;
  color: white;
  position: relative;
}

.step-status-icon.active::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid #FF6B2C;
  animation: ping 1.5s ease-out infinite;
}

@keyframes ping {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.step-status-icon.pending {
  background: #E5E7EB;
  color: #9CA3AF;
}

.step-label {
  font-size: 16px;
  font-weight: 500;
  color: #111827;
}
```

**Estimated Time**:
```css
.estimated-time {
  text-align: center;
  margin-top: 32px;
  padding: 16px;
  background: #F9FAFB;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
}

.estimated-time-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6B7280;
  margin-bottom: 4px;
}

.estimated-time-value {
  font-size: 24px;
  font-weight: 600;
  color: #FF6B2C;
  font-variant-numeric: tabular-nums;
}
```

#### Results Dashboard

**Layout**:
- Full-width layout with sidebar navigation
- Grid-based dashboard with responsive cards
- Sticky header with export/share actions

**Dashboard Header**:
```css
.dashboard-header {
  background: white;
  border-bottom: 1px solid #E5E7EB;
  padding: 24px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.dashboard-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.dashboard-title h1 {
  font-size: 28px;
  font-weight: 600;
  color: #111827;
}

.dashboard-title .video-name {
  font-size: 14px;
  color: #6B7280;
  background: #F3F4F6;
  padding: 4px 12px;
  border-radius: 6px;
}

.dashboard-actions {
  display: flex;
  gap: 12px;
}
```

**Hero Stats Section** (Top of dashboard):
```css
.hero-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.hero-stat-card {
  background: linear-gradient(135deg, #1A1F2E 0%, #2D3748 100%);
  border-radius: 16px;
  padding: 32px;
  color: white;
  position: relative;
  overflow: hidden;
}

.hero-stat-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 107, 44, 0.15) 0%, transparent 60%);
  animation: float 6s ease-in-out infinite;
}

.hero-stat-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
}

.hero-stat-value {
  font-size: 56px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 12px;
  background: linear-gradient(135deg, white 0%, rgba(255, 255, 255, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-stat-sublabel {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

/* Make/Miss indicator */
.hero-stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  font-size: 14px;
  font-weight: 500;
}

.hero-stat-trend.positive {
  color: #10B981;
}

.hero-stat-trend.negative {
  color: #EF4444;
}
```

**Dashboard Grid Layout**:
```css
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
  padding: 32px;
}

/* Shot Chart - Large prominence */
.shot-chart-container {
  grid-column: span 7;
  grid-row: span 2;
}

/* AI Insights - Right column */
.insights-container {
  grid-column: span 5;
  grid-row: span 2;
}

/* Statistics Breakdown */
.stats-breakdown {
  grid-column: span 7;
}

/* Heatmap */
.heatmap-container {
  grid-column: span 5;
}

/* Video Player - Full width */
.video-container {
  grid-column: span 12;
}
```

**Shot Chart Card**:
```css
.shot-chart-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #F3F4F6;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.shot-chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.shot-chart-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.shot-chart-controls {
  display: flex;
  gap: 8px;
}

.shot-chart-toggle {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #E5E7EB;
  background: white;
  color: #6B7280;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.shot-chart-toggle.active {
  background: #FF6B2C;
  color: white;
  border-color: #FF6B2C;
}

.shot-chart-canvas-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%);
  border-radius: 12px;
  padding: 24px;
}

.shot-chart-legend {
  display: flex;
  gap: 24px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #E5E7EB;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6B7280;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.legend-dot.make {
  background: #10B981;
}

.legend-dot.miss {
  background: #EF4444;
}
```

**AI Insights Card**:
```css
.insights-card {
  background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%);
  border-radius: 16px;
  padding: 32px;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  border: 1px solid #BAE6FD;
}

.insights-card::before {
  content: '✨';
  position: absolute;
  top: 24px;
  right: 24px;
  font-size: 32px;
  opacity: 0.2;
}

.insights-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.insights-header-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.insights-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.insights-content {
  flex: 1;
  overflow-y: auto;
}

.insight-section {
  margin-bottom: 24px;
}

.insight-section:last-child {
  margin-bottom: 0;
}

.insight-section-title {
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #1E40AF;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.insight-section-title::before {
  content: '';
  width: 4px;
  height: 16px;
  background: #3B82F6;
  border-radius: 2px;
}

.insight-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.insight-list li {
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  margin-bottom: 8px;
  font-size: 15px;
  line-height: 1.6;
  color: #374151;
  border-left: 3px solid #3B82F6;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.insight-list li:last-child {
  margin-bottom: 0;
}
```

**Statistics Breakdown Card**:
```css
.stats-breakdown-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #F3F4F6;
}

.stats-breakdown-header {
  margin-bottom: 24px;
}

.stats-breakdown-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

.stats-breakdown-header p {
  font-size: 14px;
  color: #6B7280;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: #F9FAFB;
  border-radius: 12px;
  border: 1px solid #F3F4F6;
  transition: all 0.2s ease;
}

.stat-item:hover {
  background: white;
  border-color: #E5E7EB;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.stat-zone-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6B7280;
  margin-bottom: 8px;
}

.stat-zone-value {
  font-size: 36px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-zone-value.paint {
  color: #FF6B2C;
}

.stat-zone-value.midrange {
  color: #3B82F6;
}

.stat-zone-value.three {
  color: #10B981;
}

.stat-zone-attempts {
  font-size: 13px;
  color: #6B7280;
}
```

**Heatmap Card**:
```css
.heatmap-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #F3F4F6;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.heatmap-header {
  margin-bottom: 24px;
}

.heatmap-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

.heatmap-header p {
  font-size: 14px;
  color: #6B7280;
}

.heatmap-canvas-wrapper {
  flex: 1;
  background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.heatmap-legend {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #E5E7EB;
}

.heatmap-legend-label {
  font-size: 12px;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.heatmap-legend-gradient {
  flex: 1;
  height: 24px;
  background: linear-gradient(90deg, 
    #3B82F6 0%,
    #10B981 33%,
    #F59E0B 66%,
    #EF4444 100%
  );
  border-radius: 6px;
  margin: 0 16px;
}

.heatmap-legend-values {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #6B7280;
}
```

**Video Player Card**:
```css
.video-player-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #F3F4F6;
}

.video-player-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.video-player-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.video-player-controls {
  display: flex;
  gap: 8px;
}

.video-toggle-button {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
  background: white;
  color: #6B7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.video-toggle-button:hover {
  border-color: #D1D5DB;
  color: #111827;
}

.video-toggle-button.active {
  background: #FF6B2C;
  color: white;
  border-color: #FF6B2C;
}

.video-player-wrapper {
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  aspect-ratio: 16 / 9;
}

/* Custom video controls styling */
.video-js {
  width: 100%;
  height: 100%;
}

.video-js .vjs-control-bar {
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
}

.video-js .vjs-play-progress {
  background-color: #FF6B2C;
}

.video-js .vjs-volume-level {
  background-color: #FF6B2C;
}
```

### Animations & Transitions

**Page Transitions**:
```css
/* Fade in animation for page loads */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-enter {
  animation: fadeIn 0.4s ease-out;
}

/* Card stagger animation */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-stagger {
  animation: slideInUp 0.5s ease-out;
  animation-fill-mode: both;
}

.card-stagger:nth-child(1) { animation-delay: 0.1s; }
.card-stagger:nth-child(2) { animation-delay: 0.2s; }
.card-stagger:nth-child(3) { animation-delay: 0.3s; }
.card-stagger:nth-child(4) { animation-delay: 0.4s; }
```

**Hover Effects**:
```css
/* Lift on hover */
.hover-lift {
  transition: all 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

/* Glow effect */
.hover-glow {
  position: relative;
  transition: all 0.3s ease;
}

.hover-glow::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  background: linear-gradient(135deg, #FF6B2C, #FFB02C);
  opacity: 0;
  z-index: -1;
  transition: opacity 0.3s ease;
  filter: blur(8px);
}

.hover-glow:hover::after {
  opacity: 0.5;
}
```

**Number Count-Up Animation**:
```javascript
// Animate numbers counting up when stats appear
function animateValue(element, start, end, duration) {
  const range = end - start;
  const increment = range / (duration / 16);
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= end) {
      current = end;
      clearInterval(timer);
    }
    element.textContent = Math.round(current) + '%';
  }, 16);
}
```

### Responsive Design

**Breakpoints**:
```css
/* Mobile */
@media (max-width: 640px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .shot-chart-container,
  .insights-container,
  .stats-breakdown,
  .heatmap-container,
  .video-container {
    grid-column: span 1;
  }
  
  .hero-stats {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(6, 1fr);
  }
  
  .shot-chart-container {
    grid-column: span 6;
  }
  
  .insights-container {
    grid-column: span 6;
  }
}
```

### Accessibility

**Focus States**:
```css
/* Visible focus indicators */
*:focus-visible {
  outline: 2px solid #FF6B2C;
  outline-offset: 2px;
}

/* Button focus */
button:focus-visible {
  outline: 2px solid #FF6B2C;
  outline-offset: 2px;
}

/* Skip to content link */
.skip-to-content {
  position: absolute;
  top: -40px;
  left: 0;
  background: #FF6B2C;
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  border-radius: 4px;
}

.skip-to-content:focus {
  top: 0;
}
```

**ARIA Labels** (Required for all interactive elements):
```html
<!-- Example -->
<button 
  aria-label="Upload basketball game video"
  class="hero-cta"
>
  <svg aria-hidden="true"><!-- icon --></svg>
  Upload Your Game Footage
</button>
```

### Demo Video Optimization

**Screen Recording Best Practices**:
1. **Resolution**: Record at 1920x1080 minimum
2. **Frame Rate**: 60 FPS for smooth animations
3. **Cursor**: Use a large, visible cursor (or hide it for clean look)
4. **Timing**: Let animations complete before moving to next action
5. **Transitions**: Use 0.5s fade between major sections

**Key Frames to Capture**:
- Landing page hero section (3 seconds)
- Upload dropzone interaction (2 seconds)
- File selection and preview (2 seconds)
- Processing page with animated progress (5 seconds, fast-forward to 80%)
- Results dashboard reveal with stagger animation (3 seconds)
- Zoom into shot chart (3 seconds)
- Scroll through AI insights (3 seconds)
- Play annotated video clip (5 seconds)
- Export/share final result (2 seconds)

## Implementation Priorities (10-Day Timeline)

### Day 1-2: Project Setup & Basic Infrastructure
**Goal**: Working development environment with basic UI
- Initialize React + Vite project
- Set up TailwindCSS
- Create basic page structure (Landing, Upload, Processing, Results)
- Initialize FastAPI backend
- Set up video upload endpoint
- Basic file storage

**Deliverable**: Can upload a video and see it stored on backend

### Day 3-4: Core CV Pipeline (Detection)
**Goal**: Detect players and ball in video
- Integrate YOLOv8
- Implement frame extraction from video
- Run detection on frames
- Store detection results (JSON format)
- Display detection count in UI

**Deliverable**: Upload video → See "Detected 5 players, 1 ball" message

### Day 5-6: Tracking & Shot Analysis
**Goal**: Track objects across frames and identify shots
- Integrate ByteTrack for multi-object tracking
- Implement shot detection logic (trajectory analysis)
- Implement make/miss classification
- Store tracking and shot data
- Basic progress updates to frontend

**Deliverable**: Upload video → Processing page shows progress → See shot statistics

### Day 7: Visualization & Dashboard
**Goal**: Display results in polished dashboard
- Build shot chart component
- Build statistics panels
- Build heatmap visualization
- Create results page layout
- Export results to JSON

**Deliverable**: Complete results dashboard with all visualizations

### Day 8: AI Insights Integration
**Goal**: Generate natural language analysis
- Integrate Claude API
- Create prompt template
- Parse statistics into prompt format
- Display AI insights on dashboard
- Handle API errors gracefully

**Deliverable**: Dashboard shows AI-generated insights alongside stats

### Day 9: Video Annotation & Polish
**Goal**: Annotated video playback and UI refinement
- Overlay bounding boxes on video
- Add shot markers and labels
- Video player with annotations
- UI polish (colors, spacing, responsive design)
- Add loading states and error messages

**Deliverable**: Polished, demo-ready interface with annotated video

### Day 10: Testing, Bug Fixes & Demo Preparation
**Goal**: Production-ready demo
- End-to-end testing with multiple videos
- Fix critical bugs
- Optimize processing speed
- Record demo video (2-4 minutes)
- Prepare submission materials (outline, codebase)

**Deliverable**: Working demo + demo video + submission package

## Technical Details & Best Practices

### Video Processing Optimization

**Frame Sampling Strategy**:
- Don't process every frame (too slow)
- Process every 3rd frame (10 FPS effective rate from 30 FPS source)
- Interpolate tracking between processed frames if needed

**Model Selection**:
- Use YOLOv8n (nano) for speed
- Pre-trained on COCO dataset (already detects persons and sports balls)
- Download weights on first run: `yolov8n.pt`

**GPU Usage**:
- Detect if CUDA available: `torch.cuda.is_available()`
- Run on GPU if available (5-10x speedup)
- Fallback to CPU with warning about processing time

### Shot Detection Algorithm

**Pseudo-code**:
```python
def detect_shot(ball_trajectory, hoop_location, threshold=30):
    """
    Detect if a sequence of ball positions constitutes a shot attempt
    
    Args:
        ball_trajectory: List of (x, y) ball positions over time
        hoop_location: (x, y) position of basketball hoop
        threshold: Distance threshold for "near hoop"
    
    Returns:
        (is_shot, outcome) where outcome is "make", "miss", or "unknown"
    """
    
    # Check if trajectory is upward parabolic
    if not is_parabolic_upward(ball_trajectory):
        return False, None
    
    # Check if trajectory heads toward hoop
    trajectory_direction = get_direction(ball_trajectory)
    hoop_direction = get_direction_to_point(ball_trajectory[0], hoop_location)
    
    if angle_difference(trajectory_direction, hoop_direction) > 45:
        return False, None  # Not shooting toward hoop
    
    # Detected as shot attempt
    # Now classify outcome
    
    # Check if ball passes through hoop region
    closest_distance = min([distance(pos, hoop_location) for pos in ball_trajectory])
    
    if closest_distance < threshold:
        # Ball got close to hoop
        # Check if it passed through (y-coordinate drops after reaching hoop)
        hoop_index = get_closest_point_index(ball_trajectory, hoop_location)
        
        if hoop_index < len(ball_trajectory) - 1:
            # Check if ball dropped after reaching hoop
            if ball_trajectory[hoop_index + 1][1] > ball_trajectory[hoop_index][1]:
                return True, "make"
        
        return True, "miss"
    
    return True, "miss"
```

### Court Detection (Simplified Approach)

For MVP, use simplified court detection:

1. **Option A: Manual Calibration** (Recommended for MVP)
   - After video upload, show first frame
   - Ask user to click 4 corners of the court
   - Compute homography transformation
   - Store calibration for this video

2. **Option B: Automatic Detection** (Stretch Goal)
   - Use Hough Line Transform to detect court lines
   - Find intersection points
   - Identify court boundaries
   - Validate against expected basketball court proportions

For hackathon demo, Option A is faster to implement and more reliable.

### Data Flow Architecture

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│          │     │          │     │          │     │          │
│  Upload  │────▶│ Process  │────▶│ Analyze  │────▶│ Display  │
│  Video   │     │   CV     │     │   AI     │     │ Results  │
│          │     │          │     │          │     │          │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                 │                │                │
     ▼                 ▼                ▼                ▼
  uploads/         frames/          stats/           results/
  video.mp4     frame_0001.jpg    shots.json      dashboard.json
                detection.json   insights.txt
```

**File Structure**:
```
/data
  /{video_id}
    /original
      video.mp4
    /frames
      frame_0001.jpg
      frame_0002.jpg
      ...
    /detections
      detections.json  # Frame-by-frame detection results
    /tracking
      tracks.json      # Object tracking data
    /analysis
      shots.json       # Shot events and outcomes
      statistics.json  # Aggregated statistics
      insights.txt     # AI-generated insights
    /output
      annotated_video.mp4
      shot_chart.png
      heatmap.png
```

### API Endpoints

**Backend FastAPI Endpoints**:

```python
# Upload video
POST /api/upload
Body: multipart/form-data (video file)
Response: {"video_id": "abc123", "filename": "game.mp4"}

# Start processing
POST /api/process/{video_id}
Response: {"job_id": "xyz789", "status": "queued"}

# Check processing status
GET /api/status/{job_id}
Response: {
  "status": "processing",  # queued, processing, completed, failed
  "progress": 0.65,
  "current_step": "Detecting players",
  "estimated_time_remaining": 120  # seconds
}

# Get results
GET /api/results/{video_id}
Response: {
  "statistics": {...},
  "shots": [...],
  "insights": "...",
  "shot_chart_url": "/static/...",
  "heatmap_url": "/static/...",
  "annotated_video_url": "/static/..."
}

# Stream annotated video
GET /api/video/{video_id}/annotated
Response: video/mp4 stream
```

### Error Handling

**Common Errors to Handle**:

1. **Video upload fails**: Network error, file too large
   - Show clear error message
   - Allow retry

2. **No ball detected**: Video might not contain basketball
   - Detect this early
   - Prompt user to check video content

3. **Processing timeout**: Video too long or complex
   - Set reasonable timeout (10 minutes)
   - Allow cancellation and retry

4. **API rate limits**: Claude API may have rate limits
   - Implement exponential backoff
   - Cache insights if regenerating

**Error UI Pattern**:
```jsx
{error && (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
    <p className="font-bold">Error</p>
    <p>{error.message}</p>
    <button onClick={retry}>Try Again</button>
  </div>
)}
```

## Demo Video Requirements (Alameda Hacks)

**Length**: 2-5 minutes  
**Format**: Screen recording with voice-over

**Structure**:
1. **Hook** (15 seconds)
   - "Coaches spend hours manually analyzing game footage. CourtVision automates this with AI."
   
2. **Problem** (30 seconds)
   - Traditional sports analysis is manual, time-consuming, expensive
   - Requires specialized equipment or trained analysts
   - Not accessible to youth/high school programs

3. **Solution** (45 seconds)
   - Show CourtVision landing page
   - Upload a game video
   - Explain the AI pipeline (detection → tracking → analysis)

4. **Demo** (2 minutes)
   - Processing page (show progress)
   - Results dashboard walkthrough:
     - Shot chart ("Here you can see shot distribution")
     - Statistics ("45% overall, strongest in the paint")
     - AI insights ("Claude identifies key patterns...")
     - Annotated video ("Watch the AI track players in real-time")

5. **Impact** (30 seconds)
   - "This makes professional-level analysis accessible to everyone"
   - "Coaches can focus on strategy, not data entry"
   - "Future: Real-time analysis, mobile apps, multiple sports"

6. **Call to Action** (15 seconds)
   - "Try CourtVision with your team's footage"
   - Show GitHub repo
   - Thank judges

**Technical Tips**:
- Use high-quality screen recording (OBS, QuickTime)
- Clear audio (good microphone)
- Pre-record video processing (show fast-forwarded version)
- Have a backup video file ready
- Practice the walkthrough multiple times

## Submission Outline (Alameda Hacks)

**Project Description**:
> CourtVision uses computer vision and AI to automatically analyze basketball game footage, providing coaches and players with shot charts, performance statistics, and AI-generated insights. The system detects players and the ball, tracks their movement, identifies shot attempts and outcomes, and generates actionable recommendations—turning hours of manual analysis into minutes of automated intelligence.

**Purpose**:
> Traditional sports video analysis requires expensive equipment, specialized software, or manual data entry. This creates a barrier for youth sports, high school programs, and recreational athletes who lack resources but want to improve. CourtVision democratizes sports analytics by making professional-level analysis accessible through simple video uploads. Beyond immediate utility for basketball, the underlying CV pipeline can extend to any sport, and eventually any domain requiring video analysis (retail traffic, wildlife monitoring, manufacturing QA).

**How It Works**:

*Technologies & Architecture*:
- **Frontend**: React + TypeScript with TailwindCSS for a responsive, modern UI
- **Backend**: Python FastAPI for RESTful API and asynchronous processing
- **Computer Vision**: YOLOv8 (object detection) + ByteTrack (multi-object tracking) + OpenCV (video processing)
- **AI Integration**: Anthropic Claude API for natural language insight generation
- **Deployment**: Containerized with Docker for portability

*Processing Pipeline*:
1. **Video Upload**: User uploads MP4 basketball footage (max 1080p)
2. **Frame Extraction**: System samples frames at 10 FPS for efficiency
3. **Object Detection**: YOLOv8 identifies players (class: person) and basketball (class: sports ball) in each frame with bounding boxes
4. **Multi-Object Tracking**: ByteTrack assigns persistent IDs to players and ball across frames, creating motion trajectories
5. **Court Mapping**: Classical CV techniques detect court boundaries and hoop location for spatial context
6. **Shot Detection**: Algorithm analyzes ball trajectory patterns to identify shot attempts:
   - Detects upward parabolic motion toward hoop
   - Classifies outcome (make/miss) based on ball-hoop interaction
   - Maps shot location to court zones (paint, mid-range, three-point)
7. **Statistical Aggregation**: System compiles shooting percentages, player movement patterns, zone-specific performance
8. **AI Insight Generation**: Claude API receives structured statistics and generates natural language analysis with strengths, weaknesses, and actionable recommendations
9. **Visualization**: Results displayed via interactive dashboard with shot charts, heatmaps, annotated video playback, and AI insights

*Key Features*:
- Shot chart showing spatial distribution of attempts
- Shooting percentage by zone (paint/mid-range/three-point)
- Player movement heatmap indicating court coverage
- Annotated video with bounding boxes and tracking IDs
- AI-generated coaching insights and recommendations
- CSV export for further analysis

**Datasets & Resources**:
- **Pre-trained Models**: YOLOv8 (trained on COCO dataset containing person and sports ball classes)
- **Libraries**: Ultralytics (YOLOv8 implementation), OpenCV (computer vision), Anthropic SDK (Claude API)
- **No custom datasets required for MVP** - leveraging transfer learning from existing models

## Success Criteria for MVP

**Functional Requirements**:
- ✅ Successfully upload and process a 5-minute basketball video
- ✅ Detect players and ball with ≥80% accuracy
- ✅ Identify shot attempts with ≥75% accuracy
- ✅ Classify make/miss with ≥70% accuracy
- ✅ Generate shot chart with correct spatial mapping
- ✅ Create player movement heatmap
- ✅ Produce AI insights that are coherent and actionable
- ✅ Complete processing in ≤10 minutes for 5-minute video

**Non-Functional Requirements**:
- ✅ Clean, professional UI that's easy to navigate
- ✅ Clear progress indicators during processing
- ✅ Graceful error handling with helpful messages
- ✅ Responsive design (works on laptop and desktop)
- ✅ Well-documented codebase for judges to review

**Demo Quality**:
- ✅ 3-4 minute video clearly explaining concept and showing functionality
- ✅ Smooth walkthrough with no major bugs
- ✅ Visually appealing dashboard that showcases insights
- ✅ Compelling narrative about problem, solution, and impact

## Stretch Goals (If Time Permits)

**Priority 1**: Manual court calibration UI (click 4 corners)  
**Priority 2**: Export results to PDF report  
**Priority 3**: Side-by-side comparison of two videos  
**Priority 4**: Play-by-play timeline of key events  
**Priority 5**: Additional sports (tennis, soccer) support

## Development Environment Setup

**Required Software**:
- Node.js 18+ (for React frontend)
- Python 3.9+ (for FastAPI backend)
- CUDA Toolkit (if using GPU, highly recommended)
- FFmpeg (for video processing)

**Python Dependencies** (`requirements.txt`):
```
fastapi==0.104.1
uvicorn==0.24.0
python-multipart==0.0.6
opencv-python==4.8.1.78
ultralytics==8.0.230
torch==2.1.1
torchvision==0.16.1
numpy==1.24.3
anthropic==0.7.0
python-dotenv==1.0.0
```

**Node Dependencies** (`package.json`):
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2",
    "react-dropzone": "^14.2.3",
    "recharts": "^2.10.3",
    "video.js": "^8.6.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.2",
    "tailwindcss": "^3.3.5",
    "vite": "^5.0.4"
  }
}
```

## Git Repository Structure

```
courtvision/
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API calls
│   │   ├── utils/         # Helper functions
│   │   └── App.tsx
│   ├── public/
│   └── package.json
├── backend/               # FastAPI application
│   ├── app/
│   │   ├── api/          # API endpoints
│   │   ├── models/       # Data models
│   │   ├── services/     # Business logic
│   │   │   ├── detection.py
│   │   │   ├── tracking.py
│   │   │   ├── analysis.py
│   │   │   └── insights.py
│   │   └── main.py
│   ├── data/             # Video storage
│   └── requirements.txt
├── docs/                 # Documentation
│   ├── API.md
│   └── SETUP.md
├── demo/                 # Demo video and assets
└── README.md
```

## Key Implementation Files

### Backend: Shot Detection Service

**File**: `backend/app/services/analysis.py`

```python
import numpy as np
from typing import List, Tuple, Dict
from dataclasses import dataclass

@dataclass
class Shot:
    frame_start: int
    frame_end: int
    location: Tuple[float, float]  # (x, y) on court
    outcome: str  # "make", "miss", "unknown"
    confidence: float
    trajectory: List[Tuple[float, float]]

class ShotDetector:
    def __init__(self, hoop_location: Tuple[float, float], threshold: float = 30.0):
        self.hoop_location = hoop_location
        self.threshold = threshold
    
    def detect_shots(self, ball_tracks: List[Dict]) -> List[Shot]:
        """
        Analyze ball tracking data to identify shot attempts
        
        Args:
            ball_tracks: List of ball positions per frame
                Format: [{"frame": int, "x": float, "y": float}, ...]
        
        Returns:
            List of Shot objects
        """
        shots = []
        i = 0
        
        while i < len(ball_tracks) - 5:  # Need at least 5 frames for trajectory
            # Extract potential shot sequence
            sequence = ball_tracks[i:i+15]  # Look ahead 15 frames (~1.5 sec)
            
            trajectory = [(p["x"], p["y"]) for p in sequence]
            
            if self._is_shot_trajectory(trajectory):
                outcome = self._classify_outcome(trajectory)
                
                shot = Shot(
                    frame_start=ball_tracks[i]["frame"],
                    frame_end=ball_tracks[i+len(sequence)-1]["frame"],
                    location=trajectory[0],  # Release point
                    outcome=outcome,
                    confidence=self._calculate_confidence(trajectory, outcome),
                    trajectory=trajectory
                )
                shots.append(shot)
                
                i += len(sequence)  # Skip past this shot
            else:
                i += 1
        
        return shots
    
    def _is_shot_trajectory(self, trajectory: List[Tuple[float, float]]) -> bool:
        """Check if trajectory represents a shot attempt"""
        if len(trajectory) < 5:
            return False
        
        # Check for upward motion
        y_values = [p[1] for p in trajectory[:5]]
        if not all(y_values[i] < y_values[i+1] for i in range(4)):
            return False
        
        # Check if heading toward hoop
        start_to_hoop = np.array(self.hoop_location) - np.array(trajectory[0])
        trajectory_direction = np.array(trajectory[3]) - np.array(trajectory[0])
        
        # Normalize vectors
        start_to_hoop = start_to_hoop / np.linalg.norm(start_to_hoop)
        trajectory_direction = trajectory_direction / np.linalg.norm(trajectory_direction)
        
        # Dot product to check angle
        dot_product = np.dot(start_to_hoop, trajectory_direction)
        
        return dot_product > 0.6  # Angle < 53 degrees
    
    def _classify_outcome(self, trajectory: List[Tuple[float, float]]) -> str:
        """Classify shot as make, miss, or unknown"""
        # Find closest point to hoop
        distances = [np.linalg.norm(np.array(p) - np.array(self.hoop_location)) 
                     for p in trajectory]
        min_distance = min(distances)
        closest_idx = distances.index(min_distance)
        
        if min_distance > self.threshold:
            return "miss"
        
        # Ball got close to hoop - check if it went through
        if closest_idx < len(trajectory) - 2:
            # Check if ball dropped after reaching hoop (make)
            if trajectory[closest_idx + 1][1] > trajectory[closest_idx][1]:
                return "make"
        
        return "miss"  # Got close but didn't go through
    
    def _calculate_confidence(self, trajectory: List[Tuple[float, float]], 
                              outcome: str) -> float:
        """Calculate confidence score for the classification"""
        # Base confidence on trajectory completeness and hoop proximity
        distances = [np.linalg.norm(np.array(p) - np.array(self.hoop_location)) 
                     for p in trajectory]
        min_distance = min(distances)
        
        # Closer to hoop = higher confidence
        proximity_score = max(0, 1 - (min_distance / self.threshold))
        
        # Longer trajectory = higher confidence
        length_score = min(1.0, len(trajectory) / 15.0)
        
        return (proximity_score + length_score) / 2
```

### Frontend: Shot Chart Component

**File**: `frontend/src/components/ShotChart.tsx`

```typescript
import React, { useEffect, useRef } from 'react';

interface Shot {
  x: number;  // Court x-coordinate (0-100)
  y: number;  // Court y-coordinate (0-100)
  outcome: 'make' | 'miss' | 'unknown';
}

interface ShotChartProps {
  shots: Shot[];
  width?: number;
  height?: number;
}

const ShotChart: React.FC<ShotChartProps> = ({ 
  shots, 
  width = 500, 
  height = 470 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw court outline
    drawCourt(ctx, width, height);
    
    // Draw shots
    shots.forEach(shot => {
      drawShot(ctx, shot, width, height);
    });
  }, [shots, width, height]);
  
  const drawCourt = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    
    // Outer boundary
    ctx.strokeRect(0, 0, w, h);
    
    // Three-point line (simplified arc)
    ctx.beginPath();
    ctx.arc(w / 2, 0, w * 0.35, 0, Math.PI);
    ctx.stroke();
    
    // Paint area
    ctx.strokeRect(w * 0.3, 0, w * 0.4, h * 0.25);
    
    // Free throw line
    ctx.beginPath();
    ctx.moveTo(w * 0.3, h * 0.25);
    ctx.lineTo(w * 0.7, h * 0.25);
    ctx.stroke();
    
    // Hoop
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.05, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#ff6b6b';
    ctx.fill();
    ctx.stroke();
  };
  
  const drawShot = (
    ctx: CanvasRenderingContext2D, 
    shot: Shot, 
    w: number, 
    h: number
  ) => {
    // Convert court coordinates (0-100) to canvas coordinates
    const x = (shot.x / 100) * w;
    const y = (shot.y / 100) * h;
    
    // Set color based on outcome
    ctx.fillStyle = shot.outcome === 'make' ? '#51cf66' : '#ff6b6b';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    
    // Draw circle
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-xl font-bold mb-4">Shot Chart</h3>
      <canvas 
        ref={canvasRef} 
        width={width} 
        height={height}
        className="border border-gray-300 rounded"
      />
      <div className="flex gap-4 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500" />
          <span>Make</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500" />
          <span>Miss</span>
        </div>
      </div>
    </div>
  );
};

export default ShotChart;
```

## Critical Success Factors

1. **Reliable Ball Detection**: Ball is small and often occluded - this is the hardest part. Lower confidence threshold for ball detection (0.3 vs 0.5 for persons).

2. **Reasonable Processing Time**: Optimize frame sampling and use GPU acceleration. Target: 5-minute video processes in 5-8 minutes.

3. **Intuitive UI**: Even if CV is imperfect, a clean UI makes the demo impressive. Focus on visual polish.

4. **Compelling Narrative**: Demo video must tell a story about democratizing sports analytics, not just show features.

5. **Graceful Degradation**: If shot detection fails, show what *did* work (player tracking, movement heatmap). Don't let one failure break everything.

## FAQ for Claude Code

**Q: Which YOLO version should I use?**  
A: YOLOv8n (nano) for speed. Pre-trained weights already include person and sports ball classes.

**Q: How do I handle videos with no ball detected?**  
A: Check ball detection count after processing. If < 10 detections, show warning: "Limited ball visibility detected. Results may be incomplete."

**Q: Should I implement user authentication?**  
A: No, not for MVP. Single-user demo is sufficient.

**Q: What if processing takes too long?**  
A: Implement timeout (10 minutes). Show progress every 10%. Allow cancellation.

**Q: How accurate does shot detection need to be?**  
A: 70-80% is acceptable for MVP. Show confidence scores so users understand uncertainty.

**Q: Should I deploy this or run locally?**  
A: Run locally for hackathon. Docker container for judges to test.

**Q: What's the most important feature?**  
A: Shot chart + AI insights. These showcase the core innovation best.

## Final Notes for Claude Code

This specification is comprehensive but flexible. If you encounter technical blockers (e.g., ByteTrack integration is too complex), simplify (e.g., use OpenCV's basic tracker instead). The goal is a **working demo that showcases the vision**, not perfect accuracy.

**Prioritize**:
1. End-to-end flow working (upload → process → view results)
2. Visual polish on dashboard
3. One impressive feature (shot chart or AI insights)
4. Demo video quality

**De-prioritize**:
1. Edge cases (what if video is upside down?)
2. Performance optimization beyond basic GPU usage
3. Advanced features (play-by-play, comparison mode)

You're building a **proof of concept** that judges can understand and get excited about. Focus on making the core experience smooth and impressive.

Good luck! 🏀
