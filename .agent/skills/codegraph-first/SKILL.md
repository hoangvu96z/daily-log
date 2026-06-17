---
name: codegraph-first
description: Repository analysis workflow
---

# CodeGraph First Workflow

Before undertaking any code investigation or implementation tasks, you must follow this workflow:

1. **Query CodeGraph**: Start by querying CodeGraph for relevant symbols, components, or files related to your task.
   *Note: Use the predefined npm scripts in `package.json` to interact with CodeGraph:*
   - `npm run codegraph:sync` to sync the graph data.
   - `npm run codegraph:status` to check the current status.
   - `npm run codegraph:init` to initialize if needed.

2. **Analyze Dependencies**: Use the resulting graph or symbol data to understand how components interact and depend on each other.

3. **Read Source Code**: Only after building a foundational understanding of the codebase structure through CodeGraph, proceed to read the actual source files.

**Why?**
This approach minimizes unnecessary file reading and helps you build a robust mental model of the codebase architecture before diving into implementation details.
