## PALETTE'S JOURNAL - CRITICAL LEARNINGS ONLY

## 2024-07-26 - `TooltipProvider` Compositing
**Learning:** The `TooltipProvider` from the `shadcn/ui` library should be used as a single wrapper around a group of tooltips, rather than wrapping each tooltip individually. This is a key implementation detail for creating efficient and correct UI compositions with this library.
**Action:** When implementing tooltips in the future, I will ensure that I use a single, shared `TooltipProvider` for all tooltips within a given component or section of the UI. This will prevent redundant component rendering and adhere to the library's best practices.
