## 2024-05-18 - [Add Context to Generic Action Buttons]

**Learning:** When grids or lists repeat identical action buttons (like "Join Team" or "Read More"), screen reader users encounter ambiguity as the button text alone doesn't clarify *which* item the action applies to.
**Action:** Always add dynamic `aria-label` attributes to repetitive action buttons, concatenating the action with the specific item's identifier (e.g., `aria-label={\`Join team ${team.name}\`}`).