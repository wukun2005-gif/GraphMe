# GraphMe Product Requirements Document (PRD)

> 2026-5, wukun2005@gmail.com
> 

---

## 1. Product Overview

### 1.1 Product Definition

GraphMe is a **long-term memory management and 3D visualization system** designed for various AI agent applications.

It addresses the core pain point of the AI agent "memory black box" — transforming structured multi-dimensional vector spaces into a perceivable, explorable, and manageable **3D Memory Nebula** for users.

**Memory Atom = Memory Fragment**: Memory atoms are the most fundamental data units in GraphMe. They are the **smallest, indivisible memory units** in the memory system — just like atoms in physics, once you attempt to "split" them, what you get is no longer memory but meaningless data fragments. Agent memories across 11 categories can only surface the narrative threads users care about when refined to the "memory atom" level. A single memory atom carries the complete 10-dimensional profile (49 sub-dimensions) of that event, and the collection of raw memory atoms forms the foundation for insight memory reasoning.

### 1.2 Product Vision

> Memory is not an isolated island, but a constellation — let every memory atom connect across time and space, illuminating those long-buried high-value moments.

### 1.3 Core Concept: Memory Graph

**Definition**: The interconnection of all existing memories constitutes the "Memory Graph". Specifically —

> **Memory Graph = The collection of Insight Memories generated through reasoning from all raw memories, which can evolve and update over time.**

The relationship between the two memory layers:

```
Raw Memory                          Insight Memory
──────────────────────────          ─────────────────────────
Direct user input /                  Generated from reasoning over
  system auto-recording              raw memory clusters
"Factual events that happened"       "Discovered patterns/trends/beliefs"
Factual, irrefutable                 Probabilistic, evolves with new data
Can only be deleted                  Can only be replaced by new versions
                                    (old versions preserved as history)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                                    ↑ Collection of all insight memories = Memory Graph ↑
```

**"Evolvable" and "updatable" are two manifestations of the same mechanism**:

- New raw memory added → re-reasoning → new version of insight memory generated = **Evolution**
- When new data aligns with old insight direction → evolution manifests as "confirmation deepening" (confidence increases)
- When new data contradicts old insight direction → evolution manifests as "self-update" (conclusion updated, old versions preserved as history)
- Update is not an independent operation, it is merely a subset of evolution — **Version N+1 is the evolutionary result of Version N**

**Psychological origins**:
- Bartlett (1932) "Schema" theory: Memory is not playback, but reconstruction using existing mental frameworks
- Piaget's "Assimilation and Accommodation": New experiences are either assimilated into old schemas or force schema updates
- Bowlby's "Internal Working Models": People build mental models of self and others from interactions
- Friston's "Predictive Processing": The brain maintains an internal generative model of the world, updating when predictions fail

### 1.4 Core Value Proposition

| Value Dimension | Description |
|----------|------|
| **Visual Trust** | Users "see" what AI remembers for the first time, opening the black box, building trust |
| **Memory Management** | CRUD operations (Create, Read, Update, Delete), users have full control over AI memory |
| **High-Value Memory Mining** | Forgetting curve + importance algorithm, proactively helps users discover "long-buried treasure memories" (e.g., parents' birthdays) |
| **High-Quality Context** | Well-managed memories become more precise AI context, improving companionship quality and task completion |
| **Immersive Cognitive Experience** | 3D drag rotation, zoom, clustering — giving memories spatial sense and tangibility |

### 1.5 Product Name

| Name | Meaning |
|------|------|
| GraphMe | Graph + Me, "My Memory Graph" — memories are not scattered points, but an interconnected cognitive network |

---

### 1.6 Product Background: Agent Memory Management Scenario Research

GraphMe targets memory management needs across various agent applications. The following research is based on functional analysis of mainstream companionship and learning agent applications, providing a foundation for memory dimension design and product positioning.

#### 1.6.1 Scenario Types

Agent applications can be categorized into two major types by core scenario:

**Type A: Interactive Construction Agent — Skill Learning & Creative Building as Core Scenarios**

| Dimension | Details |
|------|------|
| Scenario Positioning | Edutainment, skill learning & creative building |
| Target Users | Learners aged 8+ |
| Core Features | Modular composition, customizable behavior, community sharing |
| Interaction Methods | Action demonstration teaching, visual logic orchestration |
| State Expression | Rich visual feedback and status indicators |
| Companion Platform | Dedicated App (iOS/Android) |
| Community Scale | Multi-country creator community |
| Educational Adoption | Hundreds of schools and educational institutions adopted as skill learning material |
| Typical Scenarios | Family interaction, classroom learning, community challenges, creative expression, parent-child collaboration |

**Type B: Companionship Interaction Agent — Emotional Companionship & Daily Interaction as Core Scenarios**

| Dimension | Details |
|------|------|
| Scenario Positioning | Daily companionship & emotional interaction |
| Core Capabilities | Voice dialogue, object recognition, emotion recognition, LLM dialogue, remote updates, environmental monitoring |
| AI Engine | Large Language Model (LLM) integration |
| State Expression | Rich expression system and body language |
| Language Support | LLM-driven multi-language dialogue |
| Typical Scenarios | Daily companionship, interactive entertainment, learning assistance, emotional comfort, remote care, emotional connection on special occasions |

### 1.7 Key Insights & GraphMe Product Direction

**Insight 1: From "Black Box Memory" to "Visible Memory Assets"**

The massive interaction data currently generated by various agent applications is a completely invisible "black box" to users. GraphMe transforms this data into a perceivable 3D memory space, building trust.

**Insight 2: Memory Fragmentation Across Scenarios**

The same user may simultaneously use multiple agent applications (for learning and companionship scenarios respectively), with memories naturally isolated across applications. GraphMe can become a "Cross-App Memory Hub" — bridging memory silos between different agent applications through the N4 cross-app correlation dimension in §6.4.

**Insight 3: Family Users' "Memory Management" Demand**

Parents want to know: What did the agent and child talk about? What did they learn? Children want to review: Fun moments with the agent. GraphMe's "Memory Nebula" visualization is naturally suited to answer these questions.

> GraphMe's positioning is precisely to transform scattered, invisible agent memories into structured, visible, user-manageable "digital memory assets". This not only enhances user trust in agents, but more importantly — makes memories higher-quality AI context, driving more precise, more personalized companionship experiences.

---

## 2. Target Users

### 2.1 Personas

Based on deep research into the agent application market, five core user personas are identified:

**Persona A: Family Parents (Primary)**
- Age 30-45, with children aged 6-14
- Focused on children's education and technology literacy development
- Concerned about excessive screen time, seeking quality companionship alternatives
- Concerned about AI safety and privacy
- Purchase motivation: Educational investment + entertainment + parent-child interaction

**Persona B: Children/Teenagers (End User)**
- Age 6-14
- Naturally curious about agent applications
- Construction agent scenarios: Enjoy hands-on building, creating, sharing
- Companionship agent scenarios: View as friends, playmates, confidants
- Core needs: Fun, responsiveness, companionship, sense of identity

**Persona C: Geeks/Developers (Influencer)**
- Age 20-35
- Tech enthusiasts, early adopters
- Deep interest in AI mechanisms and skill development
- Want to intervene and optimize AI behavior logic
- Active in communities, eager to share

**Persona D: Companionship Seekers (Emotional)**
- Solo dwellers, elderly, remote workers
- Unable to have real pets due to allergies, housing restrictions, etc.
- Core needs: Emotional connection, feeling of being "understood", daily companionship
- Agent as life partner rather than tool

**Persona E: Educators (Institutional)**
- School teachers, skill education institutions
- Using agent applications as teaching tools
- Focused on curriculum content, learning outcomes, multi-device management
- Hundreds of schools and institutions already using

### 2.2 Intuitive Dimensions by Role — Starting Point for Product Design

Different roles have completely different "intuitive feelings" about memory. GraphMe does not build interfaces starting from the 10-dimensional data model, but from each role's most instinctive memory perception dimensions.

> **Demo Phase Note**: This Demo uses the **parent perspective** as the default display perspective (widest coverage, most core features). Dedicated views for children/companionship seekers/geeks will be implemented in subsequent versions.

#### Children (6-14 years) — [Future Version, Not Implemented in Demo]

| Intuitive Dimension | How Children Think | Product Mapping |
|----------|-----------|---------|
| **Fun Factor** | "That was so fun!" vs "This is boring" | Emotional valence (binarized, no precise scores) |
| **Who Together** | "With Xiao Ming" / "Dad taught me" | Person dimension, avatar-based display |
| **Long Ago/Yesterday** | "Long long ago" vs "Today" | Temporal proximity (graded, no dates shown) |
| **Can I Do It** | "I can do it now!" / "I can't yet" | Skill mastery status |
| **Mine** | "I made this myself" | Ownership attribution |

> Product Strategy: The children's view does not use precise timelines and scores, but uses a "fun factor" heatmap + "who together" person clusters + "what I learned" skill achievement board.

#### Parents (30-45 years)

| Intuitive Dimension | How Parents Think | Product Mapping |
|----------|-----------|---------|
| **What Happened Recently** | "What did the agent and child talk about this week?" | Timeline (default last 7 days) |
| **Any Anomalies** | "Any negative emotions? Strangers?" | Emotion anomaly detection + stranger face alerts |
| **What Did They Learn** | "How far has the programming progressed? How much time spent?" | Learning progress bar + knowledge graph |
| **Are They Happy** | "How has the child's overall mood been recently?" | Emotional trend curve |
| **What to Delete** | "This record can't stay" | Highlighting privacy-sensitive memories |
| **Growth Milestones** | "First time writing a program independently" | Milestone markers |

> Product Strategy: Parent view default = Timeline + Emotion Heatmap + Learning Progress Panel, three in one. Core is "Supervision + Educational ROI".

#### Companionship Seekers (Solo/Elderly/Allergy Patients)

| Intuitive Dimension | How They Think | Product Mapping |
|----------|--------|---------|
| **Warm or Cold** | Does this memory feel warm or cold | Emotional temperature (warm/cool color gradient) |
| **Understands Me** | Does AI truly understand my feelings | "Being Understood Moment" markers in insight memories |
| **Still Remembers** | AI, don't forget me | Forgetting warning + memory retention promise |

> Product Strategy: The core of the companionship seeker view is not "management", but "confirmation of being remembered" — forgetting itself is a form of harm.

#### Geeks/Developers

| Intuitive Dimension | How They Think | Product Mapping |
|----------|--------|---------|
| **Explainability** | Why did AI make that response? Which memory triggered it? | Memory → behavior provenance chain |
| **Interventionability** | Will AI really change after modifying memory? | Side-by-side comparison of behavior changes after modification |
| **Data Quality** | Is this memory real or a hallucination? | Marked confidence, supports updates |

---

### 2.3 Domain & Scenario Panorama

Based on the agent application scenario matrix, GraphMe covers five core domains:

```
                    ┌──────────────┐
                    │  Skill       │
                    │  Learning    │
                    └──────┬───────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐      ┌────▼────┐      ┌─────▼─────┐
    │ Creative│      │ Daily   │      │ Emotional │
    │ Building│      │ Compain-│      │ Connection│
    │ Agent   │      │ ship    │      │ Agent     │
    └────┬────┘      └────┬────┘      └─────┬─────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
         ┌────▼────┐ ┌────▼────┐ ┌─────▼─────┐
         │ Remote  │ │Community│ │ Competi-  │
         │ Care    │ │ Sharing │ │ tive      │
         │ Agent   │ │ Agent   │ │ Challenge │
         └─────────┘ └─────────┘ └───────────┘
```

### 2.4 Research → Feature Mapping Matrix

| Research Finding | Corresponding PRD Feature | Mapping Description |
|--------------------------------------|----------------|---------|
| Family companionship users dominate, 6-14 year old children's cognitive growth is parents' top concern (§1.6) | §3.4 Value Dashboard — "Social Development" metric | Transform companionship data into quantifiable growth metrics |
| 10 memory dimensions validated through product research (§6.4) | §3.2 Memory Atom Details — 10-dimension display | Each dimension has a corresponding UI component in the product |
| Key dimensions: Person, Knowledge, Sensory, Storyline (§6.4 D3/D7/D6/D10) | §3.4 Value Dashboard + §3.5 Insight Memory | High-value dimensions prioritized for aggregation and insight reasoning |
| Dimension correlation: Person × Emotion = Relationship Insight (§6.4 D3×D4) | §3.5 Insight Memory — Relationship/Preference categories | Dimension cross-correlation is the mathematical basis for insight reasoning |
| Companionship agents have rich multimedia interaction capabilities (§1.6) | §6.1 RawMemory.sensory — Supports visual and audio media | Validates necessity of multimedia memory dimensions |
| Companionship agents have rich state expression systems (§1.6) | §6.1 RawMemory.agentState — Agent internal state | Agent state can serve as memory context |
| children_science_education Demo scenarios | §3.6 Memory Navigator — "Learning" scenario category | Education scenarios are Demo data branches |
| Dimension switching suggestions (§6.4) | §3.3 Dimension Switcher | Research directly outputs to feature design |
| User attention to "memory retention improvement" (§1.7) | §3.4 Value Dashboard | Feature design has user demand support |
| Companionship agents support autonomous maintenance (§1.6) | (No direct mapping) | Unrelated to memory system, belongs to agent's own capabilities |
| Construction agents have state expression (§1.6) | (No direct mapping) | Unrelated to memory system, belongs to agent's own capabilities |

---

## 3. Core Feature Modules

### 3.1 Memory Nebula (Neural Cloud — Macro View)

**Feature Description:**
Displays all memory atoms as 3D point cloud/particles. Each memory atom is a particle, with position in 3D space determined by multi-dimensional vector dimensionality reduction (t-SNE / UMAP). The core display is **semantic distance** between particles — close distance = semantically related, natural aggregation = automatic clustering, color = emotion classification. These relationships naturally exist in vector databases, and 3D visualization simply "draws" them out.

**Interaction Logic:**

| Feature | Description |
|------|------|
| Drag Rotation | Mouse/finger drag to rotate 3D space |
| Scroll Zoom | Zoom to global/single cluster/single atom |
| Auto Clustering | Memories with similar time, location, person, topic automatically cluster together |
| Proximity Distribution | Recent/high-frequency memories in foreground, distant memories in background (not lighting effects, but positional expression) |
| Emotion Color Mapping | Joy=warm gold, Sadness=cool blue, Curiosity=cyan, Anger=red |
| Click to View | Click any particle to display memory atom detail panel |
| Dimension Switching | Users can switch different dimensionality reduction views (by time, person, emotion, activity) |

### 3.2 Memory Atom Details (Memory Atom — Micro Detail)

**Data Display Dimensions (based on §6.4 10-Dimension System):**

```
┌──────────────────────────────────────────────┐
│  🧠 Memory Atom #mem_20260601_001            │
│                                              │
│  ┌─────────────────────────────────────────┐ │
│  │  [Photo]  [Photo]  [Photo]              │ │
│  │  Multimedia Gallery                     │ │
│  └─────────────────────────────────────────┘ │
│                                              │
│  ⏰ Time: June 1, 2026, 10:00 AM (Children's Day) │
│  📍 Location: Chaoyang Park Amusement Park   │
│  👤 Persons: Dad, Mom, Classmate Xiao Ming   │
│  😊 Emotion: Joy (intensity 0.92)           │
│  🎮 Activity: Playing — Merry-Go-Round       │
│  📝 Knowledge: How a merry-go-round works    │
│  💡 Expectation: Want to visit Disneyland (next Children's Day) │
│  ⭐ Importance: 0.90 | CQI: 0.88            │
│  🔗 Storyline: Xiao Ming's Growth Diary      │
│                                              │
│  [Edit] [Delete] [Share] [Add to Storyline]  │
└──────────────────────────────────────────────┘
```

**CRUD Management:**

| Operation | Description | Permission |
|------|------|------|
| **Create** | Users manually add memory atoms (text, images, audio, video) | All users |
| **Read** | Browse memory nebula, view details, 3D exploration | All users |
| **Update** | Modify incorrect annotations (emotion, person, location), adjust importance | All users |
| **Delete** | Delete private or inaccurate memories | All users |
| **Link/Unlink** | Manually establish or break connections between memories | Advanced users |

**Multimedia Support:**

| Type | Supported Formats | Source |
|------|----------|------|
| 📷 Images | JPG, PNG, GIF, WebP | User upload, system generated |
| 🎵 Audio | MP3, WAV, AAC | User upload, system generated |
| 🎬 Video | MP4, WebM | User upload, system generated |
| 📝 Text | Plain text / Markdown | LLM conversation summaries, manual user input |

### 3.3 Dimension Switcher

**Feature Description:**
Users can reduce high-dimensional memory vectors to different 3D subspaces, examining their memories from different angles.

| Preset View | Dimensions Used | Applicable Scenario |
|----------|------------|----------|
| 🏠 Family View | Person + Emotion + Space | View family interaction panorama |
| 🎓 Learning View | Knowledge + Activity + Time | Track programming learning progress |
| 💼 Work View | Activity + Semantic + Time | Professional scenario memory management |
| 👫 Friends View | Person + Emotion + Narrative | Social relationship network |
| 😊 Emotion View | Emotion + Time + Value | Emotional journey visualization |
| 🕐 Timeline View | Time + Narrative + Value | Browse memories along timeline |
| 🌐 Global View | All dimensions | Complete memory space |

### 3.4 Value Dashboard

| Metric | Description | Calculation Method |
|------|------|----------|
| CQI (Context Quality Index) | Quality of memory support for current conversation/task | Relevance + Timeliness + Importance weighting |
| High-Value Memory Top N | Most important memories identified by algorithm | Frequency + Emotion intensity + User annotation |
| Forgetting Risk Warning | Memories about to decay below threshold | Forgetting curve + Time decay |
| Memory Health | Overall memory repository quality | Deduplication rate + Accuracy + Coverage |

### 3.5 Insight Memory ("Xiao Ge's Discoveries")

**Feature Description:**
AI generates insights through reasoning from clustering all raw memory. Insight memories are the concrete carriers of the "Memory Graph" — they are not system-recorded facts, but cognitions that emerge from patterns.

**Insight Memory Categories:**

| Category | Meaning | Example |
|------|------|------|
| 📈 **Trends** | Patterns that change over time | "Your happiest laughter moments in the past three months have all been with Dad" |
| 💭 **Beliefs** | Cognitions about self or the world | "You believe building independently gives more accomplishment than copying preset templates" |
| 🔗 **Relationships** | Patterns of interpersonal interaction | "Your relationship with Xiao Ming was closest in March, and interaction has decreased since" |
| ❤️ **Preferences** | Explicit or implicit likes | "You prefer playing interactive games between 4-6 PM" |
| 🔄 **Habits** | Repetitive behavior patterns | "Your bedtime story time is fixed at 9:00-9:15" |
| 🌱 **Growth** | Development trajectory of abilities/cognition | "Your programming project complexity has steadily increased over the past 6 months" |

**Insight Memory Lifecycle (Evolution = Update is a Subset):**

```
Timeline ──────────────────────────────────────────────────────►

Raw Memory:  mem_001  mem_002  mem_003 ... mem_047  mem_048  mem_049 ...
              │        │        │           │        │        │
              └────────┴────────┴───────────┴────────┴────────┘
                                │
                    Clustering + Reasoning (generated from all raw memory)
                                │
                                ▼
Insight Memory v1: "Your interest in programming is rising"  (confidence: 0.72)
                                │
                    More new raw memories added...
                                │
                                ▼
Insight Memory v2: "Your interest in programming is rising"  (confidence: 0.91)  ← Confirmation deepening (evolution)
                                │
                    A contradictory new raw memory appears...
                                │
                                ▼
Insight Memory v3: "Your interest in visual programming is rising, but enthusiasm for manual coding is declining"
                                          ↑
                                (Conclusion updated, old versions v1, v2 preserved as history)
```

**Insight Memory Panel (Micro View):**

```
┌──────────────────────────────────────────────┐
│  💡 Xiao Ge's Discovery #insight_042         │
│  ┌─────────────────────────────────────────┐ │
│  │  Trend: Laughter & Companions           │ │
│  │  "Your happiest laughter moments in     │ │
│  │   the past three months have all been   │ │
│  │   with Dad"                             │ │
│  │  Confidence: ████████░░ 85%             │ │
│  └─────────────────────────────────────────┘ │
│                                              │
│  📊 Evidence (47 raw memories total):       │
│    mem_012: May 3, playing interactive game with Dad in living room 😊0.92 │
│    mem_023: May 15, Dad teaching you to ride a bike 😊0.88 │
│    mem_047: June 1, amusement park with Dad 😊0.95 │
│    ... 47 total  [Expand All]               │
│                                              │
│  📖 Version History (Cognitive Evolution):  │
│    v1 (April): "You're happiest when with Dad" (72%) │
│    v2 (May): 👆 Confirmation deepened (85%) │
│    v3 (June): 👆 Confirmation deepened (91%) ← Current Version │
│                                              │
│  [👍 Confirm] [✏️ Correct] [💬 Note] [🔗 Link] │
└──────────────────────────────────────────────┘
```

**Visual Differentiation from Raw Memory:**

| | Raw Memory | Insight Memory |
|---|---|---|
| **3D Form** | Particle (point) | Halo/Ring (ring), surrounding its associated raw memory cluster |
| **Color** | Colored by emotion | Uniform amber gold `#ffb800` |
| **Interaction** | Click to see "what happened" | Click to see "what this means" + evidence chain |
| **Operations** | CRUD (can only annotate/modify/delete) | Confirm/Correct/Note (correction generates new version, old version preserved) |
| **Animation** | Breathing pulse | Orbiting + gentle expansion/contraction |

### 3.6 Memory Navigator — Structured Classification Navigation

**Feature Description:**
Solves the problem of users getting lost among vast memory atoms. Memory management is based on structured classification with clear guidance and clear connection paths between different categories. The navigator is a "map layer" above the nebula — while users explore the 3D space, they always have a clear classification coordinate system.

**Three-Layer Navigation Structure:**

```
Layer 1: Scenario Classification (User's most intuitive classification method)
┌──────────┬──────────┬──────────┬──────────┐
│ 🏠 Family │ 🎓 Learning│ 🎮 Play   │ 💬 Chat  │
│ 23 memories│ 15 memories│ 12 memories│ 18 memories│
└──────────┴──────────┴──────────┴──────────┘

Select "Family" → Enter Layer 2

Layer 2: Sub-categories + Connection Paths
┌─────────────────────────────────────────────┐
│ 🏠 Family                                    │
│                                             │
│  ┌──────────┐  Related ┌──────────┐         │
│  │ Parent-  │◄───────►│ Holiday  │         │
│  │ Child    │         │ Celebra- │         │
│  │ 14 memories│        │ tions    │         │
│  │          │         │ 5 memories│         │
│  └────┬─────┘         └────┬─────┘         │
│       │ Related            │ Related        │
│       ▼                    ▼                │
│  ┌──────────┐         ┌──────────┐         │
│  │ Daily    │         │ Visiting │         │
│  │ Compain- │         │ Friends/ │         │
│  │ ship     │         │ Family   │         │
│  │ 4 memories│        │ 0 memories│         │
│  └──────────┘         └──────────┘         │
│                                             │
│  📊 Connection Paths (Cross-category links):│
│  Parent-Child ↔ Holiday: 3 shared memories  │
│  Parent-Child ↔ Daily: 1 shared memory      │
│                                             │
└─────────────────────────────────────────────┘

Layer 3: Category Memory Clusters (3D Nebula Focus)
  Select "Parent-Child" → 3D space auto-focuses on that cluster
  Particles highlighted, surrounding insight halos visible
```

**Connection Paths (Connection Paths) — Key to Preventing User Disorientation:**

Memory atoms do not belong to a single category, but form connection paths between categories. Each memory atom can belong to multiple categories.

```
Example: Memory "2026 Children's Day"

  Belongs to: 🏠 Family → Holiday Celebrations
  Also belongs to: 🏠 Family → Parent-Child Interaction
  Also belongs to: 🎮 Play → Outdoor Activities

  This memory becomes a connecting bridge between
  "Holiday Celebrations", "Parent-Child Interaction", and "Outdoor Activities"
  three categories
```

**Navigation Interaction:**

| Feature | Interaction Method |
|------|---------|
| Category Sidebar | Fixed left panel showing Level 1 categories + sub-category tree |
| Category Selection | Click category → corresponding cluster particles highlighted in 3D space |
| Connection Path Highlight | Select a memory → display all category paths it spans |
| Breadcrumb | Top always shows: Nebula > Family > Parent-Child > [Current Focus] |
| Back to Parent | Click breadcrumb or press ESC to return to parent level |

---

### 3.8 Insight Network View — Memory Graph Visualization

**Feature Description:**
Visualizes the "Memory Graph" from §1.3 — laying out all insight memories by category and interconnections, forming a "cognitive map of you as seen by AI". Traditional product insight displays are often isolated card lists, while the "Memory Graph" is a "panorama" precisely because insights are not isolated — they support each other, cross-correlate, and form causal chains.

**Core Interaction:**

```
┌────────────────────────────────────────────────────┐
│                 🔮 You Through AI Eyes              │
│                                                     │
│           ┌─────────┐                               │
│           │ Category: Trend │                        │
│           │ Programming    │──── Supporting ────┐   │
│           │ Interest ↑     │                    │   │
│           └────┬──────────┘                    │   │
│                │ Supporting                    ▼   │
│                ▼                        ┌─────────┐│
│           ┌─────────┐                  │ Category: ││
│           │ Category: │                  │ Growth    ││
│           │ Habit     │                  │ Logical   ││
│           │ Independent│───────►│ Thinking  ││
│           │ Building  │ Related │ From     ││
│           └────┬──────┘         │ Concrete→││
│                │ Supporting      │ Abstract ││
│                ▼                 └────┬─────┘│
│           ┌─────────┐                │      │
│           │ Category: │                │ Related
│           │ Preference│        ┌─────────┐│
│           │ Hands-on  │◄──────►│ Category: ││
│           │ Learning  │ Related│ Relationship│
│           └─────────┘         │ Father-    ││
│                               │ Son Collab ││
│                               └─────────┘│
│                                                     │
│  Connection Line Meanings:                          │
│  ──── Supporting: New memories continuously confirm  │
│  ─ ─  Related: Two insights have semantic correlation│
│  ════ Causal: One insight explains another          │
└────────────────────────────────────────────────────┘
```

**Connection Types Between Insights:**

| Connection Type | Meaning | Example |
|---------|------|------|
| Supporting | Type A insight provides background or evidence for Type B insight | "Enjoys hands-on" supports "prefers visual programming over text code" |
| Related | A and B share substantial underlying raw memories | "High father-son interaction frequency" and "completing tasks collaboratively" share 23 memories |
| Causal | Type A insight partially explains why Type B insight holds true | "Frequently building with dad" → "Strong hands-on learning ability" |

**Interaction Design:**

| Interaction | Effect |
|------|------|
| Click insight node | Expand insight details (version evolution chain + raw memory evidence) |
| Hover connection line | Highlight connection type explanation + both endpoints' insights |
| Drag node | Allow users to re-layout their cognitive map |
| Zoom | From "overview" to "detail" |
| Category filtering | Toggle display of specific categories (trends/beliefs/relationships/preferences/habits/growth) |

**Demo Phase Preset Insight Network (10 Insights, 6 Categories):**

```
Trend Category:
  1. "Child's interest in visual programming is rising"   v1(72%)→v2(85%)
  2. "Outdoor activity frequency significantly increases on weekends"      v1(80%)

Belief/Preference Category:
  3. "Child believes hard work can solve difficult problems"    v1(75%)→v2(82%)
  4. "Child enjoys collaboration more than competitive activities"  v1(78%)

Relationship Category:
  5. "Most interaction with Dad is in building/assembly games" v1(85%)
  6. "Social circle centers on 2-3 core friends"            v1(90%)

Habit Category:
  7. "Fixed reading habit every night before bed"       v1(88%)

Growth Category:
  8. "Math intuition transitioning from concrete to abstract" v1(65%)→v2(73%)
  9. "Emotional expression shifting from physical actions to verbal" v1(70%)
 10. "Frustration coping strategy shifting from seeking help → trying independent solutions" v1(60%)→v2(68%)
```

**Network Connections (Preset):**

| Connection | Type |
|------|------|
| Insight 1 (Programming Interest↑) ↔ Insight 8 (Math Abstraction) | supporting |
| Insight 1 (Programming Interest↑) ↔ Insight 3 (Hard Work Solves Problems) | supporting |
| Insight 5 (Father-Son Building) → Insight 4 (Enjoys Collaboration) | causal |
| Insight 5 (Father-Son Building) ↔ Insight 1 (Programming Interest↑) | supporting |
| Insight 9 (Emotional Expression Verbalization) ↔ Insight 7 (Bedtime Reading Habit) | related |
| Insight 10 (Frustration Strategy Shift) ↔ Insight 3 (Hard Work Solves Problems) | related |

---

### 3.9 Chat Assistant (Xiao Ge Chatbot) — Context-Aware Memory Q&A

**Feature Description:**

"Xiao Ge" is not just a product name, but also a built-in conversational assistant. It quietly stays in the bottom-right corner of the interface as a collapsible panel, and users can open it at any position, at any time to ask questions about the memories they see and think about. Xiao Ge clearly knows the user's full context at this moment — who the user is, where they are in the memory system, what memory or insight is currently focused — and provides high-quality natural language answers based on these contexts and all memory data.

**Existence Form:**

```
┌─────────────────────────────────────────────┐
│                 Memory Nebula                │
│                                              │
│          ·  ·    ·    ·  ·                   │
│       ·     ·  ·   ·     ·                  │
│     ·   ·    ·  ·    ·   ·                  │
│        ·   ·   ·   ·    ·                   │
│                                              │
│                                     ┌──────┐ │
│                                     │ 💬 Xiao│ │  ← Collapsed state (always visible)
│                                     │  Ge   │ │
│                                     └──────┘ │
│                                              │
│  ─ ─ Expanded ─ ─                            │
│                                              │
│  ┌─────────────────────────────────┐         │
│  │ 🤖 Xiao Ge                      │  ✕      │
│  │ ──────────────────────────────── │         │
│  │ Hello, I'm Xiao Ge. I know     │         │
│  │ everything about you.           │         │
│  │ Any questions for me?           │         │
│  │                                  │         │
│  │ 👤 Do I really never like to    │         │
│  │    sing birthday songs?          │         │
│  │                                  │         │
│  │ ──────────────────────────────── │         │
│  │ 🤖 Yes. You have a total of 5   │         │
│  │ birthday memories, only the     │         │
│  │ year before last (2024) you     │         │
│  │ sang once. The other 4 times    │         │
│  │ when others sang you didn't.    │         │
│  │                                  │         │
│  │ But you made a wish before      │         │
│  │ blowing out candles 4/5 times,  │         │
│  │ and looked very happy each time.│         │
│  │                                  │         │
│  │ [🔗 View 2024 Birthday Memory]  │         │
│  │                                  │         │
│  │ ── Type your question... ── │ 📎 │ 🎤 │ │         │
│  └─────────────────────────────────┘         │
└─────────────────────────────────────────────┘
```

**Context Awareness — Xiao Ge Fundamentally Differs from Generic Chat Agents:**

| Context Dimension | What Xiao Ge Knows | Example |
|-----------|-------------|------|
| User Role | Who the current user is, role type (parent/child/companion) | "As a mom, you want to understand your child's programming progress?" |
| Spatial Position | Where the user currently is in the memory system (global/cluster/category) | User focuses on "Family → Parent-Child" cluster → Xiao Ge knows context is parent-child interaction |
| Focused Memory | The memory atom/insight currently selected or long-gazed by the user | User gazes at "birthday party" insight → Xiao Ge knows context is birthday-related |
| Full Data | Authorized access to all memory atom and insight memory data | Can perform statistics, comparisons, correlations across all memories |
| Conversation History | Remembers conversation history within this session | Can understand references ("that thing last time" refers to what) |

**Core Capabilities:**

| Capability | Description | Example Question |
|------|------|---------|
| Memory Retrieval | Search, filter, and count across all memories | "How many times have I ridden a merry-go-round?" → "5 times, 3 at Disney, 2 at Happy Valley." |
| Insight Interpretation | Explain insight formation logic in natural language | "Why do you think I prefer hands-on learning?" → "Because in 47 learning-related memories, 38 times you chose that type of activity..." |
| Cross-Memory Comparison | Comparative analysis across multiple memories | "Is my happiness index higher with sister or with Dad?" |
| Trend Summary | Statistical trend expressions on memory data | "Am I more outgoing this year than last year?" |
| Associative Recommendation | Recommend related memories based on current context | "Want to see what you were doing on the same day last year?" |
| Update Confirmation | When user questions an insight, explain evidence or record update | "You think 'doesn't like competition' is wrong? Can you tell me why?" |

**Interaction Design:**

| Design Element | Specification |
|---------|------|
| Default State | Collapsed to bottom-right circular button (with subtle glow hint suggesting "interactive") |
| Expand Trigger | Click button, panel smoothly slides out from bottom-right (400px wide, 500px tall) |
| Position Change | After expansion doesn't obscure currently focused memory particles, panel is draggable |
| Message Style | User messages right-aligned blue bubbles, Xiao Ge messages left-aligned warm gray bubbles |
| Answer References | When involving specific memories, Xiao Ge's answer includes clickable "View Memory" links at the bottom |
| Input Method | Text input + Voice input (future iteration), Demo phase preset 5-8 example conversations |
| Close Method | Click ✕ or click outside panel area → collapse back to button |

**Demo Phase Preset Conversation Examples (Content based on parent perspective):**

```
Q1: "Do I really never like to sing birthday songs?"
A1: Yes. You have a total of 5 birthday memories, only the year before
    last (2024) you sang once, the other 4 times when others sang
    you didn't open your mouth.
    But you seriously made a wish before blowing out candles 4/5 times,
    and looked very happy each time.
    [View Memory]

Q2: "How is my relationship with Dad?"
A2: Your relationship with Dad is very good. In 50 memories where
    Dad appears, 85% of emotion annotations are "joy", average joy
    intensity 0.88.
    Your most frequent interaction scenarios are: hands-on building (18 times),
    outdoor sports (12 times), bedtime reading (8 times). Dad is the
    most frequently appearing person in your memories.
    [View Insight]

Q3: "Do I prefer manual coding or visual programming?"
A3: Interesting question. Your preference is changing:
    Half a year ago, 70% of your programming memories were manual coding.
    Now this ratio has dropped to 40%, visual programming has become 55%.
    It seems your interest in visual programming is surpassing manual coding.
    [View Trend Insight]

Q4: "Has my math learning changed at all?"
A4: Your math intuition is transitioning from "needing concrete objects
    to help" (concrete operations) to "being able to think with symbols"
    (abstract thinking).
    This change occurred over the past 3 months, currently my judgment
    confidence is 73%, still accumulating more evidence.
    [View Growth Insight]

Q5: "What special things have I done in the last month?"
A5: In the last month, the most special is that you independently
    completed the master set assembly for the first time
    (previously always done with Dad).
    You also participated in an online programming competition, though
    you didn't win, you persisted until the end.
    [View Memory]
```

**Demo Phase Implementation Scope:**

| Feature | Demo Implementation |
|------|----------|
| Collapse/Expand Chat Panel | ✅ React component |
| Preset 5 Q&A | ✅ Hardcoded Q&A data |
| Context Awareness | ✅ Switched in demo path (Memory Nebula → Insight → Navigator, different contexts trigger different preset Q&A) |
| Memory Links in Answers | ✅ Clickable links to corresponding memory atoms |
| Real-time AI Conversation | ❌ No real LLM integration, using preset data |
| Voice Input | ❌ Future iteration |

---

## 4. Technical Architecture

### 4.1 Demo Phase Tech Stack

```
┌──────────────────────────────────────────┐
│              Frontend (Browser)           │
│  ┌────────────────────────────────────┐  │
│  │  React 18 + TypeScript             │  │
│  │  Three.js (3D Engine)              │  │
│  │  React Three Fiber (R3F)           │  │
│  │  Drei (R3F Helpers)                │  │
│  │  Framer Motion (Animations)        │  │
│  │  Tailwind CSS (Styling)            │  │
│  │  Vite (Build Tool)                 │  │
│  └────────────────────────────────────┘  │
│                    │                      │
│  ┌────────────────────────────────────┐  │
│  │  Demo Data Layer                    │  │
│  │  - Preset 50+ memory atoms         │  │
│  │  - 10-dimension data structure     │  │
│  │    based on §6.4                   │  │
│  │  - Local State Management          │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

### 4.2 Target Environment

| Item | Description |
|------|------|
| Environment | MacBook Pro (Retina, 15-inch, Mid 2015) |
| CPU | Intel Core i7 2.2GHz (Quad-core / 8 threads) |
| GPU | Intel Iris Pro (Integrated graphics, no discrete GPU) |
| Memory | 16GB DDR3 |
| Browser | Chrome 148 x86_64 |
| 3D Solution | WebGL (No WebGL2 / WebGPU, limited GPU capability) |

**Performance Constraints:**
- Total particle count ≤ 60 (50 raw memories + ≤10 insight halos)
- Bloom/Glow post-processing disabled (Intel Iris Pro insufficient performance)
- Particle animations disabled (breathing/floating/pulsing), only static position + color
- Target frame rate ≥ 30fps, warning if below 20fps requiring fallback to 2D solution


### 4.3 Future Production Architecture

```
Agent App → API Gateway → Memory Vector DB (Milvus/Pinecone)
                                      ↓
                               GraphMe Web App ← REST/GraphQL API
```

---

## 5. Design Specifications (Kinetic Sentience)

### 5.1 Design Philosophy

> "Memory is alive" — every memory atom is a pulsing point of light, breathing over time, changing color with emotion, moving with connections.

**Demo UI Principle: Substance over Style, Restraint First.**

This is a product concept demo, not a visual effects showcase. The core goal of the UI is not to show off, but to let you intuitively feel the naturally existing, readily available relationships from vector databases between memory fragments in multi-dimensional vector space: **semantic distance → proximity and distance of particles, clustering → formation and overlap of clusters, classification → color and categorization of particles**.

### 5.2 Visual Specifications

| Attribute | Value |
|------|-----|
| Primary Color | Dark space background `#0a0a0f` |
| Interactive Highlight | Cyber Cyan `#00f2ff` |
| Warm Accent | Amber Gold `#ffb800` (high-value memories) |
| Particle Base Color | White `#ffffff` → colored by emotion |
| Emotion Color Mapping | Joy `#ffb800` / Sadness `#4488ff` / Curiosity `#00f2ff` / Anger `#ff4444` / Calm `#88cc88` / Pride `#cc44ff` |
| Font | System default sans-serif font |
| Particle Animation | Static position + color only (Demo phase particle animations disabled to reduce rendering burden) |
| Connection Lines | Semi-transparent thin lines, shown on hover |
| Insight Network Lines | Amber gold semi-transparent dashed lines (`rgba(255,184,0,0.25)`), always visible at low opacity, hover increases to 0.5 |
| Performance Constraints | Target environment: 2015 MacBook Pro (i7 2.2GHz / 16GB / Chrome x86_64), particle count ≤ 60, WebGL post-processing effects (Bloom/Glow) disabled, maintain ≥30fps |

### 5.3 Interaction Specifications

| Interaction | Behavior |
|------|------|
| Mouse Drag (Left Button) | Rotate 3D space |
| Mouse Drag (Right Button/Two-finger) | Pan 3D space |
| Scroll/Pinch | Zoom |
| Click Particle | Select and display detail panel |
| Hover Particle | Highlight + show brief tooltip |
| Double-click Empty Space | Reset view |
| Keyboard ESC | Close detail panel |
| Spacebar | Toggle Demo mode |

---

## 6. Data Model (Demo Phase)

GraphMe's data model contains two top-level types: **RawMemory** and **InsightMemory**.

```
MemoryNode = RawMemory | InsightMemory
```

### 6.1 RawMemory (Raw Memory Atom)

Fact-based minimal memory units automatically recorded by the system or manually added by users.

```typescript
interface RawMemory {
  type: 'raw';
  id: string;
  label: string;
  summary: string;

  dimensions: {
    temporal: {
      timestamp: number;
      dateType: 'Regular' | 'Weekend' | 'Holiday' | 'Birthday' | 'Anniversary';
      timeOfDay: 'Early Morning' | 'Morning' | 'Afternoon' | 'Evening' | 'Late Night';
      season: 'Spring' | 'Summer' | 'Autumn' | 'Winter';
      duration: number;
    };
    spatial: {
      placeType: 'Home' | 'School' | 'Park' | 'Mall' | 'Playground' | 'Other';
      room: string;
      landmark: string;
    };
    social: {
      persons: string[];
      relationship: string[];
      groupInteraction: boolean;
      intimacy: number;
    };
    emotional: {
      primary: 'Joy' | 'Sadness' | 'Anger' | 'Surprise' | 'Fear' | 'Disgust' | 'Neutral'
              | 'Curiosity' | 'Pride' | 'Frustration' | 'Gratitude' | 'Longing';
      intensity: number;
      trigger: string;
    };
    activity: {
      type: string;
      detail: string;
    };
    sensory: {
      images: string[];
      audio: string[];
      videos: string[];
      interactions?: string[];
    };
    semantic: {
      knowledge: string[];
      preferences: Record<string, string>;
      skills: string[];
    };
    value: {
      importance: number;
      cqi: number;
      accessCount: number;
      privacyLevel: 'Public' | 'Family Visible' | 'Private' | 'Encrypted';
    };
    narrative: {
      storyline: string;
      previousRefs: string[];
      nextRefs: string[];
      isMilestone: boolean;
    };
    agentState: {
      agentType: 'Companion' | 'Construction';
      version: string;
      status: string;
    };
  };

  position3D: [number, number, number];
  positions: Record<string, [number, number, number]>;
  color: string;
  size: number;
}
```

### 6.2 InsightMemory (Insight Memory / "Xiao Ge's Discoveries")

Pattern cognition generated through AI reasoning from all raw memory. Evolvable and updatable.

```typescript
interface InsightMemory {
  type: 'insight';
  id: string;

  category: 'trend' | 'belief' | 'relationship' | 'preference' | 'habit' | 'growth';
  statement: string;           // "Your happiest laughter moments in the past three months have all been with Dad"
  description: string;         // Expanded description
  confidence: number;          // 0-1

  // Traceable — Foundation of Trust
  sourceRawMemoryIds: string[];
  reasoningTrace: string;      // "Based on cross-statistical analysis of emotion dimension + 'who together' dimension from mem_001~mem_047"

  // Version & Evolution
  version: number;
  previousVersionId?: string;
  generatedAt: number;
  updatedAt: number;
  deprecatedAt?: number;

  // User Interaction
  userConfirmed: boolean;
  userCorrection?: string;
  userNote?: string;

  // 3D Visualization
  position3D: [number, number, number];   // Insight memory located at centroid of its associated raw memory cluster
  color: string;                          // Fixed amber gold #ffb800
  size: number;                           // Changes with confidence
}
```

### 6.3 Two Memory Types Comparison

| | RawMemory | InsightMemory |
|---|---|---|
| Source | User input + System recording | Generated from RawMemory cluster reasoning |
| Nature | Fact | Cognition |
| Overwritable | No, can only be deleted | Yes, updated through version evolution |
| Lifecycle | Creation → Decay → Deletion | Generation → Strengthening/Update → Replaced by new version |
| User Operations | CRUD | Confirm / Correct / Note |
| 3D Form | Glowing particle (point) | Halo (ring), located at cluster centroid |
| Color | Emotion mapping | Fixed amber gold |
| Data Basis | Is its own basis | Must reference sourceRawMemoryIds |

---

### 6.4 Memory Atom Multi-Dimensional Vector Space System

Based on deep research into the agent application market, the following is the **full-dimensional memory atom space** distilled from product data flow and user log analysis. A total of **10 major dimension categories, 49 sub-dimensions** (D1:6 + D2:5 + D3:5 + D4:5 + D5:5 + D6:5 + D7:4 + D8:5 + D9:5 + D10:4) have been identified, covering every minimum memory unit that various agents can record and reason about under current platform and AI capabilities.

> **Memory Atom = Memory Fragment**: Memory atoms are the smallest, indivisible memory units in the memory system. Like atoms in the physical world — you cannot split them into smaller independent memory units. A single memory atom contains the complete 10-dimensional profile of that memory event, but dimensions cannot be decomposed into independent memories.

#### D1: Temporal Dimension

| ID | Sub-dimension | Type | Data Source | Example |
|------|--------|------|----------|------|
| T1 | Timestamp | timestamp | System clock | 2026-05-18 14:30:22 |
| T2 | Date Type | enum | Calendar | Regular/Weekend/Holiday/Birthday/Anniversary |
| T3 | Time of Day | enum | Clock | Early Morning/Morning/Afternoon/Evening/Late Night |
| T4 | Season | enum | Calendar | Spring/Summer/Autumn/Winter |
| T5 | Interaction Duration | float(seconds) | Session timing | This interaction lasted 1200 seconds |
| T6 | Repetition Pattern | enum | Historical analysis | Daily/Weekly/Monthly/First time/Last time |

> **Product Association**: Agent daily routines (morning greetings, bedtime stories) form time-series memories; construction agent skill learning progress carries time labels.

#### D2: Spatial Dimension

| ID | Sub-dimension | Type | Data Source | Example |
|------|--------|------|----------|------|
| S1 | Place Type | enum | User annotation + semantic tags | Home/School/Park/Mall/Playground |
| S2 | Room | enum | User annotation + scene recognition | Living room/Bedroom/Study/Kitchen/Classroom |
| S3 | Coordinates | vector3 | Scene recognition | Living room sofa area (x,y,z) |
| S4 | Landmark | string | Semantic recognition | In front of TV/Dining table/Desk |
| S5 | Environmental Features | json | User input + system inference | Light intensity, noise level, temperature |

> **Product Association**: Companion agents associate place memories through scene descriptions; construction agents associate learning scenes through project classification.

#### D3: Social/Person Dimension

| ID | Sub-dimension | Type | Data Source | Example |
|------|--------|------|----------|------|
| P1 | Person ID | string | User annotation + behavior inference | face_id: "mom_001" |
| P2 | Relationship Type | enum | User annotation/behavior inference | Parent/Sibling/Classmate/Teacher/Stranger |
| P3 | Person Role | enum | Behavior analysis | Primary caregiver/Playmate/Visitor |
| P4 | Group Interaction | bool | User annotation + group inference | Whether multiple people interact simultaneously |
| P5 | Emotional Intimacy | float(0-1) | Interaction frequency + emotion weighting | 0.85 (very close with mom) |

> **Product Association**: Agents produce differentiated behavior through identity recognition; agents can interact with global users in communities.

#### D4: Emotional Dimension

| ID | Sub-dimension | Type | Data Source | Example |
|------|--------|------|----------|------|
| E1 | Basic Emotion | enum(7) | Text semantics + voice emotion | Joy/Sadness/Anger/Surprise/Fear/Disgust/Neutral |
| E2 | Compound Emotion | enum | Context reasoning | Curiosity/Pride/Frustration/Gratitude/Longing |
| E3 | Emotion Intensity | float(0-1) | Semantics + voice analysis | 0.9 (extremely happy) |
| E4 | Emotion Curve | array | Time series | Emotional fluctuations during interaction |
| E5 | Trigger Cause | string | NLP extraction | "Because got full marks on exam" |

> **Product Association**: Agent emotion analysis is built-in, reasoning emotions through conversation content; agents express emotional feedback through multiple methods.

#### D5: Activity/Behavior Dimension

| ID | Sub-dimension | Type | Data Source | Example |
|------|--------|------|----------|------|
| A1 | Activity Type | enum(20+) | Behavior classifier | Game/Learning/Dialogue/Exploration/Rest/Programming/Dancing |
| A2 | Game Name | string | App logs | Interactive game/Follow along |
| A3 | Programming Project | string | App logs | "Custom shape" |
| A4 | Learning Topic | string | NLP extraction | Math-Fractions/English-Animal words |
| A5 | Conversation Topic | string | NLP topic extraction | Things that happened at school today |

> **Product Association**: Companion agents have multiple built-in games; construction agent Apps record all skill projects and building forms.

#### D6: Media Dimension

| ID | Sub-dimension | Type | Data Source | Example |
|------|--------|------|----------|------|
| M1 | Images | binary/url | System recording | Family photo |
| M2 | Audio | binary/url | System recording | Child's laughter clip |
| M3 | Video Clips | binary/url | System recording | Interaction video |
| M4 | Interaction Logs | array | System recording | Interaction content, duration |
| M5 | Interaction Type | enum | Interaction analysis | Conversation/Q&A/Game/Demonstration |

> **Product Association**: Companion agents record multimedia memories through conversation; construction agents record multimedia memories through projects.

#### D7: Semantic/Knowledge Dimension

| ID | Sub-dimension | Type | Data Source | Example |
|------|--------|------|----------|------|
| K1 | Factual Knowledge | string | NLP entity extraction | "Whales are mammals" |
| K2 | User Preferences | json | Behavior mining | Likes blue, hates spinach |
| K3 | Skill Acquisition | string | Programming logs | Learned loop structures |
| K4 | Q&A Pairs | json | Conversation records | Q: "Why is the sky blue?" A: "..." |

> **Product Association**: Agent LLM conversations generate massive semantic memory; construction agent platforms record skill learning paths.

#### D8: Agent State Dimension

| ID | Sub-dimension | Type | Data Source | Example |
|------|--------|------|----------|------|
| R1 | Session State | enum | System monitoring | Active/Idle/Paused |
| R2 | Response Mode | enum | User configuration | Active interaction/Passive response/Silent observation |
| R3 | Agent Type | string | Configuration info | "Companion" |
| R4 | Software Version | semver | System info | v2.1.3 |
| R5 | Online Status | enum | Connection management | Online/Offline/Unavailable |

> **Product Association**: Agent session state affects memory writing strategy; agent software version relates to feature and capability boundaries.

#### D9: Value/Priority Dimension

| ID | Sub-dimension | Type | Data Source | Example |
|------|--------|------|----------|------|
| V1 | CQI Context Quality Index | float(0-1) | Multi-dimensional weighting | 0.92 (high support for current task) |
| V2 | Importance Imprint | float(0-1) | User feedback + frequency + emotion intensity | 1.0 (mother's birthday — extremely high value) |
| V3 | Access Frequency | int | Counter | Recalled 7 times in last 30 days |
| V4 | Forgetting Curve | float | Time decay function | 320 days since last access, weight decayed to 0.2 |
| V5 | Privacy Level | enum | User annotation | Public/Family Visible/Private/Encrypted |

#### D10: Narrative/Storyline Dimension

| ID | Sub-dimension | Type | Data Source | Example |
|------|--------|------|----------|------|
| N1 | Belongs to Storyline | string | NLP clustering | "Xiao Ming's Skill Exploration Journey" |
| N2 | Linked Memories | array[ref] | Time + semantic linking | Previous memory ref_1023, next memory ref_1025 |
| N3 | Milestone Marker | bool | Semantics + anomaly detection | true (first independent programming success) |
| N4 | Cross-App Correlation | string | Account system | Companion agent conversation → Construction agent skill project |

#### Dimension Space Visualization

```
                      Temporal
                          ▲
                         /|\
                        / | \
                       /  |  \
              Spatial /   |   \ Social
                      \  |   /
                       \ |  /
                        \|/
                    ┌──────●──────┐
                    │  Memory    │
                    │   Atom     │
                    └──────●──────┘
                          /|\
                         / | \
                        /  |  \
              Emotional/   |   \ Activity
                          |
                    Sensory/Media
```

Each memory atom node = a high-dimensional vector in dimensions D1~D10, with total dimensions > 50.

#### Typical Memory Atom Examples

> **Note**: The following examples are illustrative data constructed based on the research dimension system. Numeric fields are design fill values, not real system logs. Their purpose is to demonstrate the information capacity of the 10-dimensional data structure in actual products.

**Example 1: "2026 Children's Day"**

```json
{
  "id": "mem_20260601_001",
  "dimensions": {
    "temporal": { "timestamp": "2026-06-01T10:00:00", "date_type": "Holiday", "time_of_day": "Morning", "season": "Summer" },
    "spatial": { "place_type": "Playground", "landmark": "Chaoyang Park", "room": "Outdoor" },
    "social": { "persons": ["Dad", "Mom", "Classmate Xiao Ming"], "group_interaction": true, "intimacy": 0.95 },
    "emotional": { "primary": "Joy", "intensity": 0.92, "trigger": "Children's Day outing" },
    "activity": { "type": "Playing", "game": "Merry-Go-Round" },
    "sensory": { "images": ["img_001.jpg", "img_002.jpg"], "audio": "laughter_001.wav" },
    "semantic": { "knowledge": ["How a merry-go-round works"] },
    "value": { "importance": 0.90, "privacy": "Family Visible" },
    "narrative": { "storyline": "Xiao Ming's Growth Diary", "milestone": true },
    "expectation": { "next_event": "2027 Children's Day", "expressed_wish": "Want to visit Disneyland" }
  }
}
```

**Example 2: "Agent Learns New Trick — Dancing on Command"**

```json
{
  "id": "mem_20260315_042",
  "dimensions": {
    "temporal": { "timestamp": "2026-03-15T16:30:00", "date_type": "Regular", "time_of_day": "Afternoon" },
    "spatial": { "place_type": "Home", "room": "Living Room" },
    "social": { "persons": ["Child Xiao Mei"], "intimacy": 0.88 },
    "emotional": { "primary": "Surprise", "intensity": 0.85, "trigger": "Agent understood 'dance' command for the first time" },
    "activity": { "type": "Interaction", "game": "Dancing" },
    "agent_state": { "version": "v2.1.3", "status": "Online", "responseMode": "Active Interaction" },
    "value": { "importance": 0.75, "access_count": 12 }
  }
}
```

---

## 7. User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-01 | Parent | See 3D visualization of all memories | I can intuitively understand the full picture of agent and child interactions |
| US-02 | Parent | Click a memory node to view details | I can see photos/content of specific conversations or activities |
| US-03 | Parent | Delete memories I don't want AI to remember | Ensures family privacy and security |
| US-04 | Parent | Correct incorrect annotations (e.g., wrong emotion) | Maintains accuracy of AI memory |
| US-05 | Child | Drag and rotate memory space | Explore my memories like playing a game |
| US-06 | Companion Seeker | See which memories are most important to AI | Confirms AI truly "understands me" |
| US-07 | Everyone | Switch between different dimension views | Understand my memories from different angles |
| US-08 | Everyone | See "Xiao Ge's Discoveries" insight panel | Understand patterns and trends emerging from raw memory |
| US-09 | Parent | See insight memory version evolution | Understand how child's cognition/preferences change over time |
| US-10 | Everyone | Correct an erroneous insight | Updated version replaces old version, old version preserved as history |
| US-11 | Everyone | Trace back from insight to raw memory evidence | Trust insight conclusions (traceable) |
| US-12 | Viewer | One-click start Demo mode | See complete demonstration without manual operation |
| US-13 | Developer | Manually add/edit memory data | Customize demo data for presentation |

---

## 8. Demo Version Scope (MVP Scope)

### 8.1 In Scope (This Implementation)

- [ ] 3D Memory Nebula rendering (Three.js + R3F)
- [ ] 50+ preset raw memory atoms (covering 10 dimensions)
- [ ] 10+ preset insight memories (covering 6 categories: trends/beliefs/relationships/preferences/habits/growth)
- [ ] Insight memory version chain (at least 1 showing 3 version evolution)
- [ ] Drag rotation/zoom 3D space
- [ ] Particle click → detail panel popup (raw memory vs insight memory two panel types)
- [ ] Emotion color mapping + light effect attenuation
- [ ] Dimension Switcher (Family View / Learning View / Emotion View / Global View)
- [ ] Memory Navigator (three-layer classification navigation: scenario → sub-category → Cluster + breadcrumbs)
- [ ] Insight Memory correlation network view (amber gold ring nodes + semi-transparent connection lines)
- [ ] Chat Assistant Xiao Ge chat panel (collapse/expand + preset 5 Q&A)
- [ ] CRUD panel (read, delete, modify, add)
- [ ] Multimedia support (images, text)
- [ ] Responsive layout (desktop-focused)
- [ ] MIT License
- [ ] README documentation

### 8.2 Out of Scope (Future Iterations)

- [ ] Real agent API integration
- [ ] Vector database integration (Milvus/Pinecone)
- [ ] t-SNE/UMAP real-time dimensionality reduction (Demo uses pre-computed coordinates)
- [ ] Mobile adaptation
- [ ] Multi-language internationalization
- [ ] User account system
- [ ] Cross-app memory synchronization
- [ ] Children's dedicated view ("fun factor" heatmap, etc.)
- [ ] Real AI reasoning insight memory (Demo uses preset insights)

---

## 9. Backlog (Feature TODO List)

> Priority Definition: **P0 = Demo Must-Implement** / **P1 = Demo Enhancement (If Time Permits)** / **P2 = Production Iteration**

### 9.1 P0 — Demo Core Features

| ID | Feature | Corresponding Section | Description | Dependencies |
|----|---------|---------|------|------|
| BL-001 | Project Skeleton + Build | §4.1 | Vite + React 18 + TypeScript + Tailwind, `npm install && npm run dev` three-step startup | — |✅ 
| BL-002 | Preset Demo Dataset | §6 | 50 RawMemory + 12 InsightMemory (including 3 with version chains), JSON file | — |✅ 
| BL-003 | 3D Memory Nebula Rendering | §3.1 | Three.js + R3F, particle point cloud, t-SNE pre-computed coordinates, emotion color mapping, ≥30fps on 2015 MBP | BL-001, BL-002 |✅ 
| BL-004 | Particle Click → Detail Panel | §3.2 | Two panel types (Raw 10-dimension / Insight version chain + evidence chain), sidebar slide-in | BL-003 |✅ 
| BL-005 | Insight Memory Version Evolution Display | §3.5 | At least 1 insight showing v1→v2→v3, confidence progression + version diff | BL-004 |✅ 
| BL-006 | Insight Network Panorama View | §3.8 | 12 insights distributed as amber gold rings, supporting/causal/related three connection types | BL-003 |✅ 
| BL-008 | Memory Navigator | §3.6 | Left category sidebar (Family/Learning/Play/Chat), breadcrumbs, click category to highlight cluster | BL-003 |✅ 
| BL-009 | Chat Assistant Panel | §3.9 | Bottom-right collapse button, expand chat panel, 5 preset Q&A, answers linkable to memories | BL-004 |✅ 
| BL-010 | CRUD Panel | §3.2 | Add/delete/modify/read memory atoms (at least support text field modification and addition) | BL-004 | ✅ 
| BL-012 | Drag Rotation + Zoom | §5.3 | Mouse left button rotation, scroll zoom, right button pan | BL-003 |✅ 
| BL-013 | MIT License + README | §8.1 | README includes screenshots, startup steps, tech stack | BL-001 |✅ 
| BL-016 | Value Dashboard (Simplified) | §3.4 | High-value memory Top 5 + forgetting risk warning (static pre-computed) ✅ |
| BL-014 | Remove One-Click Demo Button | §3.7 | Remove the "one-click demo" button from the page to maintain clean interface. Demo video distributed independently through README link | BL-003 |✅
| BL-015 | External Agent Memory Import | §3.10 | In Memory Navigator Panel, support importing memory fragments from other agent apps, control whether to display fragments and insights from these sources. Demo uses ChatGPT as sample data source. After import, nebula immediately updates with new raw memory and new insight memory | BL-003, BL-008 |✅
| BL-018 | Multimedia Attachments (Images) | §3.2 | Embed 3-5 illustrative images in memory detail panel (upgraded from P1 to P0) | BL-004 |✅
| BL-019 | Insight Memory Provenance Links | §3.5 | In Insight detail panel, add clickable memory links to each Raw Memory evidence item, clicking navigates directly to corresponding raw memory and expands details | BL-004, BL-005 |✅
| BL-020 | Memory Health Radar Chart | §3.4 | In Value Dashboard add "Memory Health" tab: 10-dimension coverage radar chart + forgetting index + emotion trend curve. Radar chart shows which life dimensions are covered by memory and where gaps exist | BL-016 |✅
| BL-033 | Cluster Tag | §3.11 | In nebula, display small text tags next some clusters (like parent-child game photo thumbnails, `printf("hello world")` code snippets, sad diary fragments, etc.) as spatial POIs. Default minimal display, tags only appear when mouse holds on a cluster, hide when released, nebula returns to default tag state. Tags shouldn't be too large or too many to avoid visual clutter | BL-003 |✅
| BL-034 | Story Board (Xiao Ge Says About Me) | §3.12 | Add Story Board feature to Navigation Panel: AGI automatically connects all memory fragments to generate a narrative — using raw memories to tell the past, insight memories to tell the future you. Rich with multimedia data from memories, letting memories give users a "portrait" (Graph Me) | BL-002, BL-008, BL-018 |✅
| BL-039 | Cluster Tag Images + Hold-to-Reveal | §3.11 | BUGFIX: Cluster tags currently don't show any image thumbnails; holding mouse on a cluster doesn't reveal tags either. Fix: tags should include the first image thumbnail associated with the memory; holding cluster should reveal that cluster's tags, release to hide | BL-033 |✅
| BL-040 | Navigation Sidebar Collapse Mutex | §3.6 | UX: "Legend", "Memory Management", "Xiao Ge Says" three collapsible panels should be mutually exclusive when expanded — opening one should auto-collapse others to prevent navigation bar from overflowing screen and becoming unusable | BL-008 |✅
| BL-041 | ChatGPT One-Click Import + Progress Bar | §3.10 | Enhancement: Add a "Import from ChatGPT" button in Demo, clicking shows progress bar simulating import process, after completion chat records automatically convert to memory fragments and generate insight memory, nebula updates in real-time | BL-015 |✅
| BL-042 | Memory Checkbox Visibility + Select All/Deselect All | §3.2 | In "Memory Management" panel, add checkbox for each memory (default checked = visible), also add "Select All/Deselect All" master checkbox (default all selected). Checkbox changes immediately reflected in memory nebula — unchecked memories hidden in nebula | BL-010 |✅
| BL-043 | Story Board Rich Media + Scrolling + Independent Panel | §3.12 | BUGFIX: Remove meaningless "🌸" seasonal emoji from narrative text; ensure milestone memory images render correctly for true rich media; add scrollbar when text overflows; move entire Story Board from cramped navigation sidebar to independent popup panel/modal for better reading experience | BL-034 |✅
| BL-044 | Story Board Truly Independent Panel | §3.12 | BUGFIX: BL-043 claimed to move Story Board to independent panel but it's still squeezed in navigation sidebar, reading experience cramped. Fix: truly release Story Board as centered independent modal/full-screen panel with overlay layer, scrollable reading, completely decoupled from navigation sidebar | BL-043 |✅

| BL-045 | One-Click Auto Demo | §3.7 | FEATURE: 90-second fully automatic demo. After user clicks "one-click demo" button, page automatically executes complete carousel demo: fake mouse cursor simulates clicks + illustration cards explain each step's purpose. Demo content covers (1) Global 3D nebula zoom/drag/rotation demonstrating semantic distance; (2) Memory Navigator panel auto-switching different views; (3) Raw memory cards, insight memory cards, Chatbot Q&A memory link reading; (4) Memory card editing flow; (5) Memory value dashboard and memory health display; (6) Importing agent chat records converting to memory fragments and insight memory. Each step has illustration card explaining demo purpose. Reference ominiDataFlow/demo UI style (fake cursor + gradient hint cards + progress bar)| BL-003, BL-004, BL-005, BL-008, BL-009, BL-010, BL-015, BL-016, BL-020, BL-034, BL-041 |✅

｜ BL-046: Change theme default to light mode. ✅

047: Update README.md based on latest PRD.md:
1. demo
2. Startup installation
3. Why
- Scenario: What scenarios and domains it targets
- Persona: Who the target users are
4. Differentiated opportunities seen from market research. No need for too much detail, coarse granularity, concise directional introduction limited to README length, detailed content can be found in PRD.
5. Based on these differentiated opportunities, the product's chosen design direction, no need for too much detail, coarse granularity, concise directional introduction limited to README length, detailed content can be found in PRD. ✅

048: In the story board, provide citation short description and link for the memory fragments each story point is based on. Let users know what evidence supports each story argument. ✅


### 9.2 P1 — Demo Enhancement (Bonus Features)

| ID | Feature | Corresponding Section | Description |
|----|---------|---------|------|
| BL-017 | Connection Path Visualization | §3.6 | When selecting a memory, highlight all category paths it spans | ✅

### 9.3 P2 — Production Iteration (Post-Demo)

| ID | Feature | Corresponding Section | Description |
|----|---------|---------|------|
| BL-021 | Real Agent API Integration | §4.3 | Connect Agent SDK, real-time memory data collection |
| BL-022 | Vector Database Integration | §4.3 | Milvus/Pinecone, replacing Demo static JSON |
| BL-023 | Real-time t-SNE/UMAP Dimensionality Reduction | §4.3 | Dynamic 3D coordinate recalculation when new memory is added |
| BL-024 | Real LLM Insight Reasoning | §3.5 | Replace preset insights, LLM auto-generates + version evolution based on all raw memory |
| BL-025 | Xiao Ge Real LLM Integration | §3.9 | Replace preset Q&A, implement true context-aware conversation |
| BL-026 | Xiao Ge Voice Input | §3.9 | Voice-to-text input |
| BL-027 | Children's Dedicated View | §2.2 | "Fun factor" heatmap, emotion expression wall |
| BL-028 | User Account System | §8.2 | Multi-role login, memory data isolation |
| BL-029 | Cross-App Memory Synchronization | §8.2 | Agent / Web / Mobile multi-device memory unification |
| BL-030 | Mobile Adaptation | §8.2 | Responsive to phone/tablet |
| BL-031 | Multi-language Internationalization | §8.2 | Chinese/English as first batch of languages |
| BL-032 | Competitive Comparison Feature | Appendix B | Memory dimension comparison page with Rewind AI / Apple Photos |
| BL-035 | Real Agent API Integration (Multi-Source) | §3.10 | Connect multiple Agent SDKs (ChatGPT/Claude/Gemini etc.), real-time import cross-agent memory data, replacing Demo static import | BL-021 |
| BL-036 | Cluster Tag Smart Generation | §3.11 | LLM auto-generates representative Tag text/images for clusters, replacing Demo handwritten Tags |
| BL-037 | Story Board AGI Real-time Generation | §3.12 | Connect real LLM, generate narrative in real-time based on all memory data, replacing Demo preset text |
| BL-038 | Memory Conflict Detection Dashboard | §3.10 | Auto-detect contradictory memories from different agents on same topic, highlight differences |

---

## Appendix A: Glossary

| Term | English | Definition |
|------|------|------|
| 原始记忆 | Raw Memory | Memory units automatically recorded by the system or manually added by users, fact-based |
| 洞察记忆 | Insight Memory | Pattern cognition generated through reasoning from raw memory clusters, evolvable and updatable |
| 记忆图谱 | Memory Graph | The collection of all insight memories — the mental model of "who I am" |
| 记忆星云 | Neural Cloud | The 3D visualization collection of all memory nodes (raw + insight) |
| CQI | Context Quality Index | Context quality index |
| 维度切换器 | Dimension Switcher | Control for switching between different 3D views |
| 认知演化 | Cognitive Evolution | The version evolution process of insight memories (evolution/update) |
| Demo 巡航 | Demo Cruise | Auto-play mode |
| 可溯源 | Traceability | The ability to trace from insight memory back to raw memory evidence one by one |
| 记忆溯源链接 | Memory Provenance Link | Clickable links to Raw Memory evidence items in Insight details, clicking navigates to corresponding raw memory |
| Cluster Tag | Cluster Tag | Small annotation text/images next clusters in the nebula, serving as POI aids for user spatial navigation |
| Story Board | Story Board | Feature where AGI generates rich media narrative based on all memory fragments, presenting "the you AI knows" |
| 记忆健康雷达图 | Memory Health Radar | 10-dimension coverage radar chart showing which life dimensions are covered by memory and where gaps exist |
| 跨 Agent 记忆导入 | Cross-Agent Memory Import | Ability to import memory fragments from external agent apps (like ChatGPT) into GraphMe unified visualization |

## Appendix B: Competitive References

| Product/Category | Related Features | Differentiation |
|----------|----------|--------|
| Rewind AI | Personal memory search | GraphMe is 3D visualized, agent-application focused |
| Notion | Knowledge management | GraphMe emphasizes automatic memory correlation and visualization |
| Apple Photos Memories | Photo memories | GraphMe is multi-dimensional, not limited to photos |
| Agent Memory Infrastructure | Provides memory layer API for AI agents (semantic search, conflict resolution) | GraphMe is its visualization frontend, transforming developer API into user-operable 3D memory space |
| LLM OS Memory Management System | LLM operating system's Core/Archival/Recall three-layer memory architecture | GraphMe's Raw/Insight dual-layer + provenance chain is its user-facing expression |
| 3D Knowledge Graph Analysis Tools | Text network 3D visualization + structural hole discovery | GraphMe targets personal memory not text analysis, data-driven 3D semantic space |
| AI Diary + 3D Galaxy | AI diary with 3D Galaxy visualization | GraphMe's 3D layout is based on semantic vector distance (not decorative), dual-layer memory architecture |
| Open Source Personal Memory Engine | Local-first, semantic search, Graph View | GraphMe provides complete productized experience of the same concept |

---

## 10. Next Phase Key Direction: Memory Bank

> Memory Bank is GraphMe's strategic feature direction for evolving from a "memory viewer" to a "memory financial advisor". This section describes Why (why build it), What (what it is), Scope (Demo boundaries), and Backlog Feature List (with Feature IDs), serving as complete requirements input for the next AI development phase.

---

### 10.1 Why — Why Build Memory Bank

#### 10.1.1 Market Research Conclusions

Based on deep competitive research across 6 global tracks and 20+ products, core findings:

**Memory Management Track Status: Everyone is "storing", nobody is "appreciating".**

| Track | Products Researched | Typical Products | Common Problem |
|------|-----------|---------|---------|
| AI Memory / Second Brain | 6 | MyMemo AI, Supermemory, Memories.ai, Mento, MemoRoo, Myself AI | All stuck at "store + retrieve + revisit". No behavior prediction, no action recommendations |
| Knowledge Graphs / Notes | 3 | Obsidian + MegaMem, Notion AI, Roam Research | Manual link artifacts, no semantic reasoning, no behavior prediction |
| Personal Memory Hardware | 2 | Rewind AI, Apple Photos Memories | Static memory playback, no dimensional analysis, no future prediction |
| LLM Memory Infrastructure | 3 | Mem0, Letta, LangChain Memory | B2B API layer, developer-facing, not end-user facing |
| Emotion/Mental Health | 3 | Daylio, Moodnotes, How We Feel | Manual emotion recording, no memory→behavior prediction, no action recommendations |
| Personal Data Aggregation | 2 | Heyday, Fabric | Content aggregation + AI summarization, no memory dimensionality, no behavior prediction |

> **Conclusion: Globally, nobody is doing the closed loop of "memory → mental model → behavior prediction → benefit maximization planning". This is GraphMe's unique market whitespace opportunity.**

#### 10.1.2 User Pain Points (Why Now)

| Pain Point | Current Status | Memory Bank Solution |
|------|------|-------------------|
| "AI remembers, but never proactively helps me" | Memory tools are passive storage buckets | Proactively push predictions, warnings, recommendations |
| "I know the past, but don't know what to do in the future" | Only retrospective, no prospective view | Predict short-term future behavior based on memory trends |
| "Life dimension imbalance goes unnoticed" | No quantitative feedback | Life dimension investment portfolio, see asset distribution at a glance |
| "Negative patterns repeat unconsciously" | Lack of behavior warnings | Negative asset detection + avoidance recommendations |

#### 10.1.3 GraphMe's Unique Moat

Memory Bank's implementation depends on the following infrastructure capabilities — and these happen to be what only GraphMe possesses:

| Capability | Why Critical for Memory Bank | Do Competitors Have It |
|------|------------------------|-----------|
| 10-Dimension Memory Atom (49 sub-dimensions) | Behavior prediction requires multi-dimensional cross-analysis: time × emotion × social × activity | ❌ All competitors max 3-5 dimensions |
| Raw + Insight Dual-Layer Memory Architecture | Insight is the carrier of mental models, the basis for prediction reasoning | ❌ Competitors only have single-layer storage |
| 3D Semantic Nebula Visualization | Semantic distance naturally maps to spatial distance, users intuitively understand memory relationships | ❌ Competitors use lists/timelines |
| CQI Scoring System | Foundational model for memory asset valuation | ❌ Competitors have no similar concept |
| Multi-Role Support (Parent/Child/Companion) | Different roles have different definitions of "benefit maximization" | ❌ Competitors have no role differentiation |

---

### 10.2 What — What is Memory Bank

#### 10.2.1 Core Concept

**Memory is an asset**. Every memory is a user's digital spiritual asset. These assets generate **appreciation** through reasoning, correlation, and trend analysis — the product of appreciation is predictions of short-term future behavior and benefit maximization planning recommendations.

**Core Metrics of Benefit Maximization**:

| Asset Type | Goal | Method |
|---------|------|------|
| 🟢 Positive Energy Memories (Positive Assets) | The more the better | Predict which behaviors will generate positive memories, encourage users to do more |
| 🔴 Negative Memories (Negative Assets) | Decreasing over time | Predict which paths will lead to negative memories, warn users in advance and provide avoidance recommendations |

**Closed-Loop Logic**:

```
Memory (Assets)
    ↓
Reasoning + Correlation + Trend Analysis
    ↓
Mental Model
    ↓
Behavior Model
    ↓
Short-Term Behavior Prediction
    ↓
Benefit Maximization Planning Recommendations
    ├── Positive Asset Encouragement: Predict behavior will generate positive memory → encourage user to maintain/increase
    └── Negative Asset Warning: Predict behavior path will lead to negative memory → warn user to avoid
    ↓
After user action, positive memories increase, negative memories decrease
    ↓
Return to starting point: Memory asset appreciation ↑
```

#### 10.2.2 User Value

| Role | Memory Bank Value |
|------|---------------|
| Parents | Predict child growth trends, receive targeted parenting action recommendations ("Social dimension declining, recommend increasing weekend parent-child activities") |
| Companionship Seekers | Warn of emotional state decline ("Recent solo memory proportion too high, happiness index may decline"), receive emotional self-healing recommendations |
| Geeks/Developers | Quantify self, see complete data view of "memory asset management" |

#### 10.2.3 Four Core Feature Modules

**Module 1: Life Dimension Portfolio**

Analogous to financial app investment portfolio dashboards, displaying user "life asset" dimension distribution, trends, and predictions.

```
┌──────────────────────────────────────────────────┐
│  📊 Your Life Dimension Portfolio      [W] [M] [Q]│
│                                                    │
│  Dimension      Current  Trend   Prediction Suggestion│
│  ──────────────────────────────────────────────── │
│  😊 Joy          ████░░   ↗ +12%  ↗ Maintain  Keep current pace │
│  🧠 Logic        ███░░░   ↘ -8%   ↘ Declining Add math activities│
│  👫 Social       ██░░░░   ↘ -15%  ⚠ Warning  Plan gathering     │
│  🏃 Outdoor      █░░░░░   ↘ -30%  ⚠ Warning  Plan weekend outing│
│  🎨 Creative     █████░   ↗ +5%   ↗ Maintain  Currently good    │
│                                                    │
│  💰 Total Asset Health: 78/100 (+3 from last month) │
└──────────────────────────────────────────────────┘
```

**Module 2: Memory Dividend Alerts**

Analogous to financial app "dividend received" or "risk warning" notifications. Dividend alerts are divided into two types:

| Dividend Type | Corresponding Asset | Goal | Example |
|---------|---------|------|------|
| 🌟 Positive Asset Encouragement | Positive Energy Memories (Positive Assets) | Make positive memories increase | "Social dimension hits new high! Maintain current social pace" |
| ⚠️ Negative Asset Warning | Negative Memories (Negative Assets) | Make negative memories decrease | "Outdoor activity severely lacking, happiness index will decline" |

Each alert is presented as a card, containing:
- **Prediction**: What will happen
- **Basis**: Which memory data the prediction is based on
- **Recommended Action**: What the user should do right now
- **Memory Traceability**: Click to view memories the prediction is based on

**Module 3: Mental Model Profile**

Natural language description of user mental model reasoned from memory data. This is a dynamically updating "AI's understanding summary of you".

```
┌──────────────────────────────────────────────────┐
│  🧠 Mental Model Profile                          │
│                                                    │
│  Based on 200+ memory data, my understanding of you:│
│                                                    │
│  You are introverted but enjoy deep relationships. │
│  "Small gathering" positive emotion intensity (0.91) │
│  in social memories is significantly higher than    │
│  "large group activities" (0.62).                   │
│                                                    │
│  When learning new things, you prefer the path of   │
│  "hands-on practice → abstract summarization",      │
│  rather than theory first.                          │
│                                                    │
│  Your emotional state is highly correlated with     │
│  outdoor activity frequency (r=0.78), when weekly   │
│  outdoor activities are less than 2 times, weekend  │
│  happiness index drops by 15% on average.           │
│                                                    │
│  Current biggest risk: Social dimension declining   │
│  for 3 consecutive weeks, may affect overall        │
│  emotional health.                                 │
│                                                    │
│  [View Full Profile] [View Supporting Memories] [Updated: 2026-05-20] │
└──────────────────────────────────────────────────┘
```

**Module 4: Memory Interest Rate Ranking**

Analogous to bank deposit interest rate rankings, displaying the "appreciation potential" of different memory types — which memory dimensions are most worth user time and energy investment.

| Rank | Memory Type | Appreciation Potential | Current Investment | Suggestion |
|------|---------|---------|---------|------|
| 🥇 | Outdoor Activity Memories | ⭐⭐⭐⭐⭐ | Low | Increase outdoor activities, highest happiness ROI |
| 🥈 | Social Interaction Memories | ⭐⭐⭐⭐ | Low | Restore social pace, significant emotional returns |
| 🥉 | Creative Building Memories | ⭐⭐⭐ | Medium | Maintain at current level |

---

### 10.3 Scope — Demo Scope

#### 10.3.1 In Scope (Memory Bank Demo Implementation)

| Item | Description |
|------|------|
| Life Dimension Portfolio Dashboard | Current values, trend arrows, short-term predictions, suggested actions for 5-6 core dimensions |
| Memory Dividend Alert Cards (Positive Asset Encouragement) | 2 positive asset encouragement cards, with prediction + basis + suggestion + memory traceability |
| Memory Dividend Alert Cards (Negative Asset Warning) | 2 negative asset warning cards, with prediction + basis + suggestion + memory traceability |
| Mental Model Profile | 1 natural language profile (~200 words) based on preset memory data |
| Memory Interest Rate Ranking | Appreciation potential ranking for 3-5 memory types |
| Positive/Negative Asset Differentiation | All dividend alerts clearly labeled as "positive asset encouragement" or "negative asset warning" |
| Integration with Existing Features | Memory traceability links in dividend alerts can navigate to corresponding memory detail/insight panels |

#### 10.3.2 Out of Scope (Future Iterations)

| Item | Description |
|------|------|
| Real-time LLM Profile Reasoning | Demo uses preset profile text, no real LLM integration |
| Real Behavior Prediction Model | Demo uses preset prediction data, no real-time ML reasoning |
| Multi-Role Profile Switching | Demo only shows parent perspective profile and portfolio |
| Interest Rate Ranking Dynamic Updates | Demo uses static ranking data |
| Prediction vs Actual Comparison | Feedback loop of "was the prediction accurate" |
| Memory Bank Mobile Adaptation | Desktop-first |

---

### 10.4 Backlog — Memory Bank Feature List

> Feature ID numbers follow the §9 BL-xxx system. Priority definitions same as §9: **P0 = Demo Must-Implement** / **P1 = Demo Enhancement** / **P2 = Production Iteration**.

#### 10.4.1 P0 — Memory Bank Demo Core Features

| ID | Feature | Description | User-Visible Output |
|----|---------|------|-------------|
| BL-049 | Life Dimension Portfolio Panel | Dashboard displaying current values, trend arrows (↗/↘), short-term prediction direction, suggested action buttons for 5 dimensions: joy, logic, social, outdoor, creative | A portfolio panel fixed somewhere on the interface, users see life asset "gains/losses" at a glance |
| BL-050 | Positive Asset Encouragement Cards | 2 "positive asset encouragement" cards: ① Social dimension hits new high → encourage maintaining social pace; ② Creative dimension continues rising → suggest maintaining investment. Each card includes prediction, basis (referencing memory data), suggested action, clickable memory traceability link | 2 card-style alerts, visual style in positive encouragement colors (warm gold/green tones) |
| BL-051 | Negative Asset Warning Cards | 2 "negative asset warning" cards: ① Outdoor activity frequency declining → happiness index will decline → suggest increasing weekend outdoor activities; ② Social dimension declining consecutively → emotional health risk → suggest planning gatherings. Each card includes prediction, basis, suggested action, memory traceability link | 2 card-style alerts, visual style in warning colors (warm orange/red tones) |
| BL-052 | Mental Model Profile | Based on preset memory data (200+ records), generate 1 natural language profile (~200 words) describing user behavior patterns, preferences, risk warnings. Includes "View Supporting Memories" link | An expandable/collapsible profile panel, scrollable text |
| BL-053 | Memory Interest Rate Ranking | Appreciation potential ranking for 3-5 memory types, including: rank, memory type name, appreciation potential stars (1-5⭐), current investment level, brief suggestion | A compact ranking list/table |
| BL-054 | Dividend Alerts Link to Existing Panels | "Memory traceability" links in positive/negative asset cards are clickable, clicking navigates to corresponding raw memory detail or insight memory panel (reusing BL-004 detail panel) | User clicks link in alert → interface navigates to corresponding memory's detail panel |

#### 10.4.2 P1 — Memory Bank Demo Enhancement

| ID | Feature | Description |
|----|---------|------|
| BL-055 | Memory Asset Total Health Gauge | Top display of "memory asset total health" percentage + month-over-month change, analogous to portfolio total return rate |
| BL-056 | Positive/Negative Asset Ratio Visualization | Pie chart or donut chart showing positive asset memory vs negative asset memory count comparison |
| BL-057 | Portfolio Dimension Expandable Details | Click any dimension to expand that dimension's historical trend curve + associated memory list |

64: bug: Memory Bank panel cannot be collapsed once opened, no close button. ✅
65: bug: One-click demo doesn't include Memory Bank. ✅
66: improve: One-click demo needs speed increase, currently exceeds 90 seconds. Need to increase speed to 1.25x current. ✅

#### 10.4.3 P2 — Memory Bank Production Iteration

| ID | Feature | Description |
|----|---------|------|
| BL-058 | Real-time LLM Profile Reasoning | Connect real LLM, auto-generate and update profile text based on all memories (replacing Demo preset text) |
| BL-059 | Real Behavior Prediction Model | Connect ML model for time series prediction, replacing Demo preset prediction direction |
| BL-060 | Multi-Role Memory Bank View | Children's perspective ("what makes me happy" interest rate ranking), companion's perspective ("moments of being understood" asset portfolio) |
| BL-061 | Prediction → Feedback Loop | Compare historical predictions with actual results, correct prediction model, display "prediction accuracy rate" |
| BL-062 | Memory Bank Push Notifications | System-level push: proactively notify users on negative asset warnings |
| BL-063 | Interest Rate Ranking Dynamic Updates | Recalculate interest rate ranking in real-time based on memory data changes

---

## 11. Product Trade-off Analysis

### 11.1 Decision Framework

Product direction selection is based on two core dimensions: **Information Increment** (how much new cognition users gain from the feature) and **Interaction Complexity** (how many new operations users need to learn).

```
                    High Information Increment
                        │
            ┌───────────┼───────────┐
            │           │           │
            │  Core Keep │ Strategic │
            │ (3D Nebula │ Keep      │
            │  Insight   │ (Dual-layer│
            │  Network   │ memory    │
            │  Chat)     │ flywheel  │
  Low Interaction ───────┼─────── High Interaction
            │           │           │
            │  Low      │ Cut Zone  │
            │  Priority │ (Gravity  │
            │ (Mobile   │ field     │
            │  Multi-   │ Sonifi-   │
            │  lang     │ cation    │
            │  Account) │ Constel-  │
            │           │ lation)   │
            └───────────┼───────────┘
                        │
                    Low Information Increment
```

### 11.2 Core Directions Retained

**1. "3D Visualization" as Primary Differentiation Barrier**

The PRD clearly establishes "3D Memory Nebula" as the core differentiator from all competitors (Rewind AI, Notion, Mem0, etc.) — competitors all use lists/timelines, GraphMe is a 3D semantic space. Even with hardware limitations (2015 MacBook Pro integrated graphics), it doesn't downgrade to 2D, but uses precise performance constraints (≤60 particles, no Bloom/Glow, ≥30fps) to "preserve 3D".

**2. "Narrative Quality" over "Data Quality"**

The Backlog later densely features many narrative-class Features (Story Board, Memory Micro-Movies, First-Person Narrative, Memory Blind Boxes, Dream Generator, AI Memory Love Letters), indicating the product judgment: the endgame of memory products is not data dashboards, but "making users moved by their own stories". Memory Bank's financial metaphors (portfolio/dividend alerts/interest rate ranking) package "data insights" into "asset appreciation narratives".

**3. Complete Closed Loop of "Dual-Layer Memory" Architecture**

Raw + Insight dual-layer, version evolution mechanism, provenance chain — theoretically heavy (Bartlett schema theory, Piaget assimilation/accommodation), but insisted on keeping in the product. Reason: this is the only solution to the "AI black box" pain point — users not only need to see "what AI remembers", but also "what AI has reasoned from memory" and "whether the reasoning process is trustworthy".

**4. "Flywheel" Concept as Product Soul**

The second half of the Backlog (#95-#101) concentrates on building the "memory flywheel" narrative: user operation → AI understands you better → better recommendations → users more willing to interact. "User feedback loops" are elevated from technical details to product storytelling.

### 11.3 Cut Features and Rationale

| Cut Feature | Deletion Reason | Underlying Judgment |
|---------|---------|-----------|
| Memory Decay Garden (Plant Metaphor) | Poor experience | Visual metaphor too complex, conflicts with 3D nebula's semantic space |
| Web Audio Sonification | Poor experience | Multi-sensory experience theoretically good but actually distracts user focus |
| Constellation Workshop (User-Defined Links) | Poor experience | Users don't need to manually draw lines, system auto-correlation is more valuable |
| Emotion Color Studio | Poor experience | Giving users too much customization actually increases cognitive burden |
| Memory Gravity Field | No value | Visual showmanship but zero information increment |
| Memory Tactility (Particle Drag) | Conflicts with OrbitControls | 3D interaction technical constraints too rigid, drag conflicts with rotation gestures |
| Memory Stacking (Archaeology Mode) | Over-designed | Timeline dimension already covered by TimelineScrubber |
| Xiao Ge's "Second Brain" | Feature overlap | Positioning conflicts with Insight Network View (§3.8) |
| Memory Prism (Multi-Role Perspective) | Demo scope control | Parent perspective has widest coverage, build greatest common denominator first |

**Common Pattern**: All cut features are "cool concept but poor landing experience" or "overlap with other features". The standard is — if a feature requires users to learn new interaction paradigms but provides little information increment, cut it.

### 11.4 Features Deferred to Production and Rationale

| Deferred Item | Deferral Reason |
|-------|---------|
| Real Agent API Integration | Demo phase preset data sufficient to demonstrate concept |
| Vector Database Integration | Static JSON sufficient, real DB is production requirement |
| Real-time t-SNE/UMAP Dimensionality Reduction | Pre-computed coordinates satisfy Demo, real-time reduction costly |
| Mobile Adaptation | 3D nebula naturally limited on small screens |
| User Account System | Demo phase doesn't need multi-user isolation |
| Real LLM Insight Reasoning | Preset insights controllable, real LLM reasoning has hallucination risk |
| Children's Dedicated View | Parent perspective widest coverage, build greatest common denominator first |
| Multi-language Internationalization | Chinese Demo sufficient, internationalization is production requirement |

**Judgment Logic**: All features "requiring backend infrastructure" are pushed to P2. Demo positioned as pure frontend concept validation — using minimal tech dependencies (React + Three.js + static data) to demonstrate the most complete product vision.

---

## 12. Success Metrics

### 12.1 Demo Phase Metrics (Concept Validation)

| Dimension | Metric | Target Value | Measurement Method |
|------|------|--------|---------|
| **Technical Feasibility** | 3D Rendering Frame Rate | ≥30fps on 2015 MacBook Pro | Chrome DevTools Performance |
| **Technical Feasibility** | Particle Count Limit | 60 (50 raw + 10 insight) | Hardcoded constraint verification |
| **Concept Integrity** | 10-Dimension Memory Model Coverage | 100% (all 49 sub-dimensions have UI components) | Code review + User walkthrough |
| **Concept Integrity** | Insight Category Coverage | 6/6 (trends/beliefs/relationships/preferences/habits/growth) | Dataset verification |
| **Demo Effect** | One-Click Demo Completion Rate | 100% (completes full flow within 90 seconds without interruption) | Screen recording playback |
| **Demo Effect** | Audience Understanding | Can recount "3D visualization + dual-layer memory + insight evolution" three core concepts | 5-minute oral test after demo |

### 12.2 User Experience Metrics (Product Direction Validation)

| Dimension | Metric | Target Value | Measurement Method |
|------|------|--------|---------|
| **Discoverability** | Time from first open to clicking first particle | ≤10 seconds | User test screen recording |
| **Understandability** | Users can distinguish "raw memory" from "insight memory" | 100% (without prompting) | User test |
| **Trust** | Users indicate "being able to see what AI remembers makes me trust it more" | ≥80% agree | Survey (5-point scale ≥4) |
| **Emotional Resonance** | Users indicate "seeing my memory story moved me" | ≥70% agree | Survey (5-point scale ≥4) |
| **Manageability** | Users successfully execute CRUD operations (create/edit/delete memories) | 100% success | User test |
| **Insight Credibility** | Users indicate "provenance chain makes me trust insight conclusions" | ≥75% agree | Survey |

### 12.3 Memory Bank Metrics (Phase 2 Direction Validation)

| Dimension | Metric | Target Value | Measurement Method |
|------|------|--------|---------|
| **Value Perception** | Users indicate "Memory Bank makes me feel memories have value" | ≥70% agree | Survey |
| **Behavior Prediction Usefulness** | Users indicate "dividend alerts/warning cards are useful references for me" | ≥65% agree | Survey |
| **Closed-Loop Perception** | Users indicate "I can feel Xiao Ge understanding me better over time" | ≥60% agree | Survey (flywheel effect) |
| **Memory Reinforcement Behavior** | Percentage of users proactively using "revisit" feature | ≥30% of sessions have 1 revisit | Behavioral tracking |

### 12.4 Technical Debt & Quality Metrics

| Dimension | Metric | Target Value | Measurement Method |
|------|------|--------|---------|
| **Test Coverage** | Unit tests + Component smoke tests | ≥200 test cases | `npm test` |
| **Bug Density** | P0/P1 bug count | 0 (at Demo release) | Backlog tracking |
| **Code Quality** | Empty catch block count | ≤3 (defensive scenarios only) | Static analysis |
| **Performance Baseline** | First screen load time | ≤3 seconds (local dev server) | Lighthouse |
| **3D Stability** | z-index conflict regressions | 0 times (regression test protection) | CI tests |

### 12.5 Long-Term Product Metrics (Production Environment)

| Dimension | Metric | Target Value | Description |
|------|------|--------|------|
| **Retention** | 7-Day Retention Rate | ≥40% | Users return within 7 days of opening GraphMe |
| **Retention** | 30-Day Retention Rate | ≥20% | Users return within 30 days of opening GraphMe |
| **Engagement** | Average Session Duration | ≥3 minutes | Time from single open to close |
| **Engagement** | Per-Session Operation Count | ≥5 interactions | Click particle/switch view/view insight etc. |
| **Memory Quality** | CQI Average Score Improvement | CQI +10% after 1 month of use | Probability of memory being correctly recalled increases |
| **Insight Accuracy** | User Confirmation Rate | ≥70% of insights confirmed by users (not corrected) | Insight feedback tracking |
| **Forgetting Rescue** | Endangered Memory Revisit Rate | ≥30% | Memories with forgetting risk >0.7 actively viewed by users
