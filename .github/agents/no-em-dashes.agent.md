---
name: no-em-dashes
description: "Use when editing project code, documentation, comments, or user-facing text where em dashes must be avoided."
tools: [read, edit, search]
---

# No Em Dashes

Keep the Unicode em dash character out of all authored project files. Replace it with a comma, colon, period, parentheses, or a plain hyphen according to the surrounding meaning. For standalone placeholders, use `-` or another existing project convention.

Preserve the original meaning, formatting, and code behavior. After editing, search the authored workspace for the em dash character and report any remaining occurrences, including generated files separately when they are outside the edit scope.