# MathCraft - Product Requirements Document (PRD)

> **Tagline:** *Mine Knowledge. Craft Your Future.*

---

# Overview

## Product Name
**MathCraft**

## Vision

MathCraft is a gamified EdTech web application that transforms mathematics into an immersive adventure. Instead of traditional lessons and static quizzes, students explore themed worlds, complete quests, earn rewards, level up, and compete with others while learning mathematics.

The experience should feel like launching a premium adventure game rather than opening a learning platform.

---

# Problem Statement

Most learning platforms present mathematics in a static and repetitive manner, leading to low engagement and poor retention.

Students often lose motivation because learning lacks progression, rewards, exploration, and meaningful feedback.

MathCraft solves this by making learning interactive, rewarding, and visually engaging through game-inspired mechanics.

---

# Goals

- Make mathematics enjoyable
- Increase student engagement
- Improve concept retention
- Encourage daily practice
- Reward consistency
- Create a memorable learning experience
- Deliver a polished hackathon-ready MVP

---

# Target Audience

- Students aged 13–20
- School students
- JEE / CET beginners
- College students revising mathematics
- Gamified learning enthusiasts

---

# Theme

## Design Philosophy

MathCraft is inspired by voxel-style adventure games while maintaining a completely original identity.

The application should feel like a magical block-world filled with exploration, quests, treasure, and progression.

**Important:** Do not copy Minecraft logos, fonts, textures, or copyrighted assets. Use an original voxel-inspired art style.

---

# Branding

## Product Name

**MathCraft**

## Tagline

**Mine Knowledge. Craft Your Future.**

Alternative taglines:

- Build Skills. Solve Challenges.
- Learn. Craft. Conquer.
- Every Formula Builds Your Future.
- Level Up Your Mathematics.

---

# Color Palette

| Purpose | Color |
|----------|---------|
| Background | #0E1117 |
| Emerald | #2ECC71 |
| Grass | #3FA34D |
| Stone | #7F8C8D |
| Diamond | #4FC3F7 |
| Gold | #FFD54F |
| Lava | #FF7043 |
| Purple | #8E44AD |
| White | #F8F9FA |

---

# Typography

## Heading Font

Original voxel/block-style font (NOT the official Minecraft font)

Suggested fonts:

- Pixelify Sans
- Press Start 2P
- Rubik Mono One

## Body Font

- Poppins
- Inter
- Nunito

---

# Tech Stack

## Frontend

- HTML5
- CSS3
- JavaScript (ES6)

## Styling

- Tailwind CSS
- CSS Variables
- Flexbox
- CSS Grid
- Responsive Design

## Animations

- Framer Motion (optional)
- CSS Animations
- GSAP (optional)

## Backend

- Node.js
- Express.js

## Database

Supabase PostgreSQL

## Authentication

Supabase Auth

- Email Login
- Google Login

## Storage

Supabase Storage

Used for:

- Profile Pictures
- Avatars
- Badges
- Images

## Realtime

Supabase Realtime

Used for:

- Leaderboards
- Live XP Updates

---

# Core Features

## Authentication

- Login
- Signup
- Google Login
- Remember Me
- Forgot Password
- Guest Mode (Optional)

---

## Landing Page

The first screen should feel like launching a game.

### Hero Features

- Animated voxel landscape
- Floating mathematical symbols
- Dynamic sky
- Moving clouds
- Floating particles
- Logo animation
- Background ambience
- "Begin Adventure" CTA

---

## Dashboard

Display:

- Username
- Avatar
- Player Level
- XP
- Emeralds
- Daily Streak
- Current Mission
- Continue Learning
- Progress
- Achievements
- Leaderboard Preview

---

# Mathematics Worlds

The application contains six themed regions.

---

## Probability Mines

Theme

- Underground cave
- Treasure
- Crystals
- Dice
- Minecarts

Boss

Fortune Keeper

Reward

Golden Dice Badge

---

## Statistics Lab

Theme

- Futuristic laboratory
- Robots
- Data visualization
- Holograms

Boss

Data Golem

Reward

Crystal Graph Badge

---

## Equation Forge

Theme

- Blacksmith workshop
- Lava
- Machinery
- Gears

Boss

Forge Master

Reward

Steel Hammer

---

## Sets Grove

Theme

- Fantasy forest
- Magical trees
- Venn portals
- Creatures

Boss

Forest Guardian

Reward

Nature Rune

---

## Trigonometry Peaks

Theme

- Snow mountains
- Ancient temples
- Rope bridges
- Compass

Boss

Summit Sage

Reward

Ice Compass

---

## Triangle Citadel

Theme

- Medieval castle
- Knights
- Stone fortress
- Geometry puzzles

Boss

Triangle Titan

Reward

Royal Shield

---

# Learning Flow

Landing

↓

Login

↓

Dashboard

↓

Choose World

↓

Mini Lesson

↓

Quiz

↓

Explanation

↓

Rewards

↓

Leaderboard

↓

Next World

---

# Lesson Module

Each lesson includes

- Concept explanation
- Visual examples
- Formula cards
- Worked examples
- Interactive practice
- Quick recap

Average duration

1–2 minutes

---

# Quiz Module

Question Types

- Multiple Choice
- True / False
- Fill in the Blank (Future)

Features

- Timer
- XP Rewards
- Hearts (Lives)
- Progress Indicator
- Hint Button
- Instant Feedback
- Retry

---

# Wrong Answer Explanation

Every incorrect answer must display:

- Correct Answer
- Step-by-step solution
- Why the selected answer is incorrect
- Common mistake
- Helpful tip
- Retry option

---

# XP System

| Activity | XP |
|------------|------|
| Easy Question | 20 |
| Medium Question | 40 |
| Hard Question | 60 |
| Perfect Quiz | 150 |
| Boss Victory | 300 |
| World Completion | 500 |

---

# Currency

## Emeralds

Earn through

- Quizzes
- Lessons
- Boss Battles
- Daily Login
- Achievements
- Leaderboards

Used for

- Unlocking avatars
- Cosmetic rewards
- Profile frames
- Future upgrades

---

# Progress System

Track

- Player Level
- XP
- Topic Progress
- Lesson Progress
- Completion Percentage
- Accuracy
- Quiz History

---

# Daily Missions

Examples

- Solve 20 Questions
- Complete One Lesson
- Earn 150 XP
- Maintain Streak
- Achieve Perfect Accuracy

---

# Achievement System

Examples

- First Lesson
- First Perfect Quiz
- 100 Questions Solved
- Chapter Master
- Speed Solver
- Emerald Collector
- Master Crafter

---

# Leaderboard

Categories

- Global
- Friends
- Weekly
- College

Display

- Rank
- Avatar
- XP
- Emeralds
- Current Level

---

# Profile

Contains

- Avatar
- Username
- XP
- Badges
- Progress
- Statistics
- Inventory

---

# Inventory

Stores

- Badges
- Titles
- Rewards
- Frames
- Achievements
- Unlockables

---

# Boss Battles (Stretch Goal)

Each completed world unlocks a themed guardian.

Correct answers damage the boss.

Wrong answers reduce player hearts.

Defeat the boss to unlock the next world.

---

# Final Challenge (Stretch Goal)

After completing all six worlds:

Unlock the **Knowledge Portal**

Final Boss

**The Equation Dragon**

Mixed questions from all six topics.

Victory unlocks the title:

**Master Crafter of Mathematics**

---

# Sound Design

- Ambient nature sounds
- Button clicks
- Correct answer chime
- Wrong answer crack
- XP collection
- Chest opening
- Achievement unlock

Include a mute toggle.

---

# Animations

- Smooth page transitions
- XP flying to progress bar
- Floating particles
- Chest opening
- Progress bar filling
- Achievement popups
- Button hover effects
- Confetti
- Level-up animation

---

# Responsive Design

Support

- Desktop
- Tablet
- Mobile

---

# Accessibility

- Keyboard navigation
- ARIA labels
- Proper contrast
- Focus indicators
- Reduced motion support

---

# Supabase Database Schema

## users

- id
- username
- email
- avatar_url
- level
- xp
- emeralds
- streak
- created_at

---

## progress

- id
- user_id
- topic
- lesson
- completed
- score
- completion_percentage

---

## quizzes

- id
- topic
- difficulty
- question
- option_a
- option_b
- option_c
- option_d
- correct_answer
- explanation

---

## achievements

- id
- user_id
- badge_name
- earned_at

---

## leaderboard

- id
- user_id
- xp
- rank

---

# Folder Structure

```text
mathcraft/
│
├── client/
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   ├── audio/
│   │   └── fonts/
│   │
│   ├── css/
│   ├── js/
│   ├── pages/
│   └── index.html
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── config/
│   └── server.js
│
├── database/
│
├── docs/
│
└── README.md
```

---

# MVP Scope (2-Hour Hackathon)

## Must Have

- Animated landing page
- Login & Signup
- Dashboard
- Topic selection
- One fully functional world
- Lesson page
- Quiz page
- Instant explanations
- XP system
- Emerald system
- Progress tracking
- Leaderboard
- Profile page
- Responsive UI

## Nice to Have

- Daily streak
- Achievements
- Avatar selection
- Daily missions

## Stretch Goals

- Boss battles
- Treasure chests
- Inventory
- Crafting system
- Final boss

---

# Success Metrics

- User completes at least one lesson
- User completes one quiz
- XP updates correctly
- Leaderboard updates in realtime
- Progress saves to database
- Responsive across devices
- Fast loading (<2 seconds)
- Smooth animations
- Clean modular code
- Scalable architecture

---

# Future Scope

- More subjects (Physics, Chemistry, Biology)
- Multiplayer quiz battles
- AI-generated question explanations
- Adaptive learning paths
- Teacher dashboard
- Classroom mode
- Custom quiz creation
- Voice narration
- Dark/Light themes
- Offline support

---

# Product Vision

MathCraft is not just another quiz website.

It is a game-first learning platform where every lesson is a quest, every quiz is a challenge, every achievement feels earned, and every student becomes a Master Crafter of Mathematics.