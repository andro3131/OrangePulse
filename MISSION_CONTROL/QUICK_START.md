# 🚀 MISSION CONTROL - Quick Start Guide

**Welcome to your command center for managing OrangePulse!**

---

## 📂 File Overview

| File | Purpose | When to Use |
|------|---------|-------------|
| `README.md` | Main dashboard + kanban board | Check daily progress |
| `TASKS.md` | Detailed task breakdown | View full task descriptions |
| `BACKLOG.md` | Long-term ideas | Brainstorm future work |
| `WEEKLY_REPORT.md` | Progress tracking | Review weekly achievements |
| `kanban.html` | Visual kanban board | Open in browser for pretty view |

---

## 🎯 How to Assign Tasks

### Simple Commands

**Start a task:**
```
Start task MP-002
```

**Create new task:**
```
New task: Write blog post about DCA strategies
```

**Change priority:**
```
Escalate MP-003 to HIGH
```

**Mark task as blocked:**
```
Block MP-005 - waiting on API key
```

---

## 📋 Daily Workflow

### Morning Standup (When You Check In)

Ask me:
```
Daily standup
```

I'll report:
- ✅ What I completed yesterday
- 🔄 What I'm working on today
- 🚧 Any blockers

---

### Assigning Work

**Option 1: Pick from existing tasks**
```
Start task MP-002
```

**Option 2: Create new task on the fly**
```
New task: Draft 5 tweets for this week
Priority: HIGH
Time: 1 hour
```

---

### Checking Progress

**Quick status:**
```
Show me progress on MP-001
```

**Weekly summary:**
```
Weekly report
```

---

## 🗂️ Task Status Flow

```
BACKLOG → TO DO → IN PROGRESS → DONE
            ↓
         BLOCKED (if needed)
```

---

## 🏷️ Task Naming Convention

**Format:** `[MP-XXX] Task Name`

**Examples:**
- `[MP-001]` YouTube Video Scripts
- `[MP-002]` TradingView Idea #4
- `[MP-003]` X Content Calendar

**MP = Mission Priority**

---

## 🎨 Visual Kanban Board

**Open in browser:**
```bash
open ~/Github/OrangePulse/MISSION_CONTROL/kanban.html
```

**Benefits:**
- See all tasks at a glance
- Color-coded by status
- Priority badges (HIGH/MEDIUM/LOW)
- Time estimates visible

---

## 📊 Weekly Review Process

**Every Sunday:**

1. Review completed tasks in `WEEKLY_REPORT.md`
2. Update metrics (X followers, YT views, etc.)
3. Note what worked / what didn't
4. Set goals for next week

**Ask me:**
```
Create weekly report for Week 04
```

---

## 💡 Backlog Management

**Adding ideas to backlog:**
```
Add to backlog: Create TikTok account for short-form content
Category: Social Media
Priority: LOW
```

**Promoting backlog → active tasks:**
```
Promote backlog item "TikTok account" to task MP-XXX
```

---

## 🔔 Notification Preferences

**Tell me when:**
- ✅ Task completed
- 🚧 Task blocked (need input)
- ⚠️ Deadline approaching
- 📊 Weekly goal at risk

---

## 🛠️ Commands Reference

| Command | What It Does |
|---------|--------------|
| `Start task MP-XXX` | Begin working on task |
| `Status MP-XXX` | Check task progress |
| `Block MP-XXX` | Mark as blocked |
| `Unblock MP-XXX` | Resume blocked task |
| `Complete MP-XXX` | Mark as done |
| `Daily standup` | Get today's summary |
| `Weekly report` | Generate week summary |
| `Show kanban` | Display current board state |
| `Add to backlog: [idea]` | Store future idea |

---

## 📈 Metrics Tracking

**Key metrics I track automatically:**

- **X (Twitter):** Followers, posts, engagement
- **YouTube:** Subscribers, videos, views
- **TradingView:** Ideas published, followers
- **Email:** Sequences built, automation status
- **Website:** Traffic (when GA connected)

---

## 🎯 Priority Levels Explained

| Priority | When to Use | Example |
|----------|-------------|---------|
| **HIGH** | Urgent, immediate impact | YouTube scripts (content pipeline) |
| **MEDIUM** | Important, not urgent | Email sequences (foundation building) |
| **LOW** | Nice to have, future work | Reddit posts (experimental growth) |

---

## 🚀 Getting Started (First Time)

**Step 1:** Open Mission Control
```bash
cd ~/Github/OrangePulse/MISSION_CONTROL
open README.md
```

**Step 2:** Review current tasks
```bash
open TASKS.md
```

**Step 3:** Open visual board (optional)
```bash
open kanban.html
```

**Step 4:** Assign first task
```
Start task MP-001
```

---

## 💬 Example Conversations

**Checking in:**
> You: "What are you working on?"
> Me: "Currently on MP-001 (YouTube Scripts). 60% complete. ETA: Tomorrow."

**Assigning work:**
> You: "Start task MP-002"
> Me: "Starting MP-002 (TradingView Idea #4). Will draft post about cooldown logic and report back in ~2 hours."

**Creating new task:**
> You: "New task: Design Instagram carousel about DCA strategies"
> Me: "Created MP-011: Instagram DCA Carousel. Added to MEDIUM priority. Estimated time: 2 hours. Should I start now or add to queue?"

---

## 🔄 Keeping It Updated

**I'll automatically:**
- Update task status when working
- Move tasks between columns
- Log completed work in WEEKLY_REPORT.md
- Flag blockers immediately

**You should:**
- Review kanban weekly
- Approve high-priority tasks before I start
- Provide feedback on completed work

---

## 📞 Support

**If something's unclear:**
```
Explain how to use Mission Control
```

**If you want to change the system:**
```
Let's modify the task structure to add [your idea]
```

---

**Ready to start?** Pick a task from `TASKS.md` and tell me to begin! 🚀

---

**[← Back to Mission Control](./README.md)**
