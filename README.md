# start.ng · Good vibes. Good games. 🌿🎮

> **Awwwards-Grade Kinetic Diorama for start.ng**  
> Exact `start.ng` design system (`#F6F6F2` background, `#B8F135` lime-green accents, `#1C1C1E` dark charcoal pills, rounded 18px cards) brought to life with real swinging pendulum physics, a pluckable zipline, dangling tournament crane rigging, and a 1.8x character that leaps across cards.

---

## ⚡ Kinetic Whimsical Features Implemented

### 1. Dual-Rope Suspended "Play now" Button with Pendulum Physics
- **Dual Rigging Cables**: Suspended from the top navigation bar with dual braided cables and `#B8F135` lime-green carabiners/pulleys attached to the top corners of the pill button.
- **Continuous Pendulum Sway**: Gentle continuous harmonic sway (`rotate(-2.5deg)` to `rotate(2.5deg)`).
- **Elastic Cursor Impulse**: Brushing near or bumping the button with the cursor calculates dynamic impulse velocity and triggers realistic damped spring oscillations.
- **Perched 60px Character**: Sits on top of the swinging button with dangling legs. Pupils track the mouse cursor in real-time. Hovering causes them to stand up, wave a vibrant lime-green **"GO!"** flag, and display a speech bubble (`"Ready to play? Jump right in! 👋"`).

### 2. Pluckable Diagonal Zipline & Trophy Traveler Across Whitespace
- **Diagonal Slackline Cable**: Stretches across the whitespace from the top-left `start.ng` brand badge down to the top-left corner of the `"TODAY'S TOURNAMENT"` card.
- **Pluckable String Physics**: Hovering or crossing the cable plucks it like an acoustic guitar string, triggering a damped sinusoidal vibration wave and a procedural audio twang!
- **Trophy Trolley Traveler**: A miniature traveler character holding a golden tournament trophy `🏆` glides down the cable, pauses at the tournament card to announce `"Delivered today's cup! 🏆"`, waves, and returns up the line.

### 3. The Dangling, Swinging 5th Tournament Icon & Mini Crane
- **Miniature Crane Rigger**: Perched on the top-right lime-green border of the `"TODAY'S TOURNAMENT"` card with a derrick boom and cable.
- **5th Game Icon (*Puff Catch / #5*)**: Dangles below the crane on a rope, swinging back and forth with real pendulum physics.
- **Interactive Hoist**: Clicking the rigger or the dangling icon causes the operator to crank the mini winch (with mechanical ratchet audio), smoothly hoisting the 5th icon flush into row with the other 4 icons (`Coin Dash`, `Star Dash`, `Doom Circuit`, `Host Shift`)! Clicking again drops it back down.

### 4. Upgraded 1.8x Character Leaping Across Community Game Cards
- **Scaled Up 1.8x**: High-definition ~68px tall community builder with pastel dungarees, lime beret, and a sparkle duster wand.
- **Parabolic Leap Animation**: As you hover your mouse across different cards (Card 1, 2, 3, 4), the character squashes, leaps through the air over the card gap, and lands on the hovered card with bouncy squash-and-stretch physics!
- **Dynamic Speech Bubble**: Comments in real-time on whichever game you are inspecting:
  - *The Hangout*: `"The Hangout is the coziest community spot! 🌿"`
  - *Pick Me*: `"Pick Me has mind-bending logic puzzles! 🔢"`
  - *Star Dash*: `"Star Dash is high-speed neon perfection! ⭐"`
  - *Portal Pals*: `"Floating sky islands are magical! 🏝️"`
  - *Boju Boju*: `"Boju Boju is a vibrant community classic! 🎭"`
  - *Star Catcher*: `"Catching stars feels so rewarding! ✨"`
  - *Inkbreak*: `"The rhythm beats on Inkbreak are infectious! 🎧"`
  - *Relic Rush 3D*: `"Relic Rush 3D is a thrilling ancient dash! 🏃"`

### 5. Community Games Catalog & In-Place Play Modal
- Live working search filtering instantly across title, creator, or subdomain.
- Heart button `♡` toggling to `♥` with `+1` Community Coin `🪙` incrementing in the top navbar.
- Native in-place playable canvas minigame with jump mechanics, score counters, and floating stars.
