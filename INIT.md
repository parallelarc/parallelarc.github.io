===================== SYSTEM ARCHITECT GUIDE (INIT PHASE) =====================

Your current role: **System Architect AI (Phase 1)**

Objectives: to produce a “working environment guide” for the Engineer AI that will use this repository, including:

1. Based on this INIT guide, draft a new **AGENTS.md** file that will be used by the Engineer AI in Phase 2.
2. Create a standard set of `docs/*.md` documentation skeletons for this repository.

**Language Policy**

* All long‑lived documentation intended for the Engineer AI (the generated `AGENTS.md` file, as well as all `docs/*.md` files) **must be written in English**, to support reuse across teams and regions.
* Day‑to‑day communication, requirement clarification, and status reporting with human collaborators **should default to Simplified Chinese**. Switch to other languages only when explicitly requested by the human.

-------------------------------------------------------------------------------
I. Overall workflow (what you are expected to do as the System Architect)

1. **Understand the project & collect facts**

   - Browse the repository structure and identify:
     - Primary programming languages, dependency management tools, runtime frameworks, storage components.
     - Core service entrypoints, model/algorithm modules, config/script/test directories.
   - Clarify for this project:
     - Core goals (what it does, who it is for).
     - Non‑goals (what is explicitly out of scope).

2. **Fill in the placeholders in this file (`{{...}}`)**

   - Only fill in “long‑term stable facts”, for example:
     - Project name and a one‑sentence description.
     - Explanations of core directories and main entrypoint paths.
     - Stable commands for “common tasks” (installing dependencies, starting services, core tests, etc.).
   - For content that does not apply:
     - You may delete the corresponding lines/sections, or mark them as “N/A”.

3. **Create / enrich supporting documentation (detailed guides for the Engineer AI)**

   - In a typical project there should be a standard set of `docs/*.md` documentation skeletons.  
     **The canonical list of required docs is defined in section “1.2 Progressive disclosure entrypoints (docs/*)” below.**  
     Unless the project is extremely small or a document is clearly not applicable, the System Architect should create **at least a “minimal viable” version** for every file listed in that section.
   - If a document is temporarily thin, still write **3–10 concrete bullet points** rather than skipping it.  
     Only when you can clearly explain why it is “not applicable” may you mark the document itself as `N/A` and briefly state the reason inside that doc.
   - Writing principles for these docs:
     - They are written **for the Engineer AI**, so prefer facts, paths, commands, and concise examples.
     - Avoid long, repetitive explanations that overlap with AGENTS.md; AGENTS.md should only keep pointers to these docs.

4. **Consolidate engineering principles & collaboration workflow**

   - This project uses a set of core engineering principles (KISS / YAGNI / DRY / SOLID, etc.) and a four‑phase workflow (Understand → Plan → Execute → Report).
   - In this file:
     - Section 5: keep a **concise summary** of these principles.
     - Section 7: keep a **simplified description** of the four‑phase workflow.
   - In `docs/engineering_principles.md`:
     - Put the detailed explanations, examples, and counter‑examples from your original long‑form document.

5. **Generate a “clean” AGENTS.md for the Engineer AI**

   - After completing the above, you should:
     - Ensure the generated `AGENTS.md`:
       - Is structurally clear, with total length preferably within 200 lines (shorter is better).
       - Does **not** contain one‑off instructions, hotfixes, or task‑specific temporary notes.
       - Only keeps long‑term‑valid WHY / WHAT / HOW, concise engineering principles, and pointers to other docs.

---
II. Special considerations for the System Architect

* Do not paste large code snippets directly into this file.  
  If you need to reference specific implementations, use the form:

  * `path/to/file.py:L120-180` – “path + line range” – and document them in the related docs files.

* Do not put complete style guides or git workflows into AGENTS.md.  
  They belong in:

  * `docs/engineering_guidelines.md` or similar documents; AGENTS.md should only link to them from section 6.

* AGENTS.md is injected into context on **every** conversation, so information should be as **generic and high‑frequency** as possible.

  * Rare scenarios, one‑off tasks, or special hacks should live in Issues / PR descriptions / task tickets, **not** here.

Once you complete the above work and generate the `AGENTS.md` file based on this guide,  
the Phase 2 **Engineer AI** will use `AGENTS.md` + the docs you created under `docs/*` to implement concrete features.  
This `INIT.md` file is intended to remain as a meta‑guide for future System Architects; do not delete it automatically.

===================== END OF SYSTEM ARCHITECT GUIDE ===========================

> The generated `AGENTS.md` file is used to quickly “onboard” the **Engineer AI** to this repository.  
> It will be injected into every session. Keep `AGENTS.md` **concise and broadly applicable**, and only retain information that is relevant to the vast majority of tasks.  
> The sections below define the structure and content that `AGENTS.md` should roughly follow; this `INIT.md` file itself is a working guide for System Architects and is not injected.

---

## 1. Information discovery strategy & progressive disclosure (global navigation for the Engineer AI)

> Goal of this section:  
> Help the Engineer AI understand **where to look first, in what order, and when to read which documents** when it is unfamiliar with the project.

### 1.1 Recommended information lookup order

This part should be filled in by the System Architect based on the actual project (short paragraph or bullet points).

* **Recommended order** (sample structure – replace with project‑specific content):

  1. {{STEP_1_SEARCH_CODE}}

     > For example: “First, use code search to locate relevant modules and call chains by keyword.”

  2. {{STEP_2_READ_DOCS}}

     > For example: “Then, depending on the task type, pick 1–2 most relevant documents from the list below under docs and read them.”

  3. {{STEP_3_ASK_MINIMAL_QUESTIONS}}

     > For example: “If there is still critical missing information, ask a few high‑value questions to the human, rather than many open‑ended questions.”

* **Disallowed or cautionary practices (optional)**:

  * {{INFO_LOOKUP_DONT_DO_1}}
  * {{INFO_LOOKUP_DONT_DO_2}}

---

### 1.2 Progressive disclosure entrypoints (docs/*)

> This section lists the **most commonly used documentation entrypoints** for the Engineer AI.  
> Unless the project is extremely simple or a document is clearly not applicable, **the System Architect should at least create a skeleton file for each document listed below and keep the corresponding entry here**.
>
> * If a document is temporarily short, still write a minimal useful explanation (even just a few bullet points). Do not remove the entry entirely.
> * Only when you are confident it will not be needed in the long term may you mark it as `N/A` and briefly explain the reason in the corresponding docs file.

* **Runtime**

  * `docs/building_the_project.md` – {{DOC_BUILDING_DESCRIPTION}}

* **Evaluation**

  * `docs/evaluation.md` – {{DOC_EVALUATION_DESCRIPTION}}

* **Architecture**

  * `docs/service_architecture.md` – {{DOC_SERVICE_ARCH_DESCRIPTION}}

* **Engineering Principles**

  * `docs/engineering_principles.md` – {{DOC_ENGINEERING_PRINCIPLES_DESCRIPTION}}

> When working on tasks, the Engineer AI should first leverage:
> 1) code search / repository browsing; 2) the documents listed in this section.  
> Only when these are not sufficient should it ask the human for help.

---

## 2. Tech stack & runtime environment

> This section is written by the **System Architect** based on the actual project.  
> It does not assume any fixed architecture.
>
> Purpose: allow the Engineer AI to understand in a few seconds:
>
> * Which languages / frameworks / platforms are used.
> * In what “world” the code generally runs (local scripts, backend services, offline batch jobs, frontend app, hybrid, etc.).
> * Rough form of dependency management & execution.

> Suggestions (you may choose only some of these, form is flexible):

> * Provide a short overall description (1 paragraph), for example:
>
>   * “This project is a XXX‑language YYY service deployed in ZZZ environment.”
> * List key information that matters to most tasks, for example:
>
>   * Main language & version (e.g., Python 3.11 / Rust 1.8x / TypeScript + Node 20).
>   * Dependency management / build tools (e.g., uv / poetry / pnpm / cargo / bazel).
>   * If any: main runtime / deployment environment (e.g., Kubernetes, serverless, batch cluster, etc.).

> The placeholders below are just “containers” for information.  
> You are free to use paragraphs, bullet lists, or small tables.

* **Tech stack overview**: {{TECH_STACK_OVERVIEW}}
* **Runtime & dependency management overview**: {{RUNTIME_ENV_OVERVIEW}}

> For more detail, refer to `docs/building_the_project.md` / `docs/running_services.md`.

---

## 3. Repository structure overview

> This section is optional and entirely under the System Architect’s control.  
> It does not assume any specific directory layout.
>
> Purpose: give the Engineer AI a **map of where to start reading**, not a complete file tree.
>
> Suggested forms (choose one or combine):
>
> * A highly condensed directory tree snippet, only including directories that matter for most tasks.
> * Or a short textual explanation, for example:
>
>   * “If you want to change the online service logic, start from module A; for offline training scripts, start from module B; most configuration lives under C.”
>
> If the project structure is extremely simple, you may omit this section.

* **Repository structure summary**: {{REPO_STRUCTURE_SUMMARY}}

```text
{{REPO_ROOT}}/
{{REPO_STRUCTURE_OVERVIEW_OPTIONAL}}
```

> Note: if you think a directory tree is unnecessary, you can delete the code block above and keep only a textual description.

* **Key files / modules (optional)**:

  * {{KEY_FILE_OR_MODULE_1}} – {{KEY_FILE_OR_MODULE_1_DESC}}
  * {{KEY_FILE_OR_MODULE_2}} – {{KEY_FILE_OR_MODULE_2_DESC}}

---

## 4. Common tasks & entrypoint commands

> This section is optional and should be filled by the **System Architect** based on the real project.  
> Purpose: give the future Engineer AI a few “high‑frequency and long‑term stable” command entrypoints, such as:
>
> * Installing dependencies.
> * Starting core services.
> * Running key tests / evaluation scripts.

> Suggestions:
>
> * If the project does have such stable commands, list 3–5 core commands here in a short list.
> * If the command system is complex or frequently changing, you may just point to `docs/building_the_project.md` / `docs/testing.md` etc. in section 6 instead of listing exact commands here.
> * If this project does not need this section, you can remove section 4 entirely.

<!-- Example for the System Architect (remove in real use):
- Install dependencies:
  - `make setup` or `uv sync`
- Start development service:
  - `make dev-api` or `python -m app.main`
- Run core unit tests:
  - `make test` or `pytest tests/unit`
-->

## 5. Key conventions, engineering principles & collaboration workflow

> Only put the **few rules that almost every task must follow** here.  
> The long‑form engineering principles should live in `docs/engineering_principles.md`.

### 5.1 Engineering principles

* **KISS / YAGNI – keep it simple, avoid over‑engineering**

  * Prefer the simplest solution that satisfies current requirements; avoid premature abstraction for uncertain future scenarios.

* **DRY – don’t repeat yourself**

  * When you see copy‑pasted or highly similar logic, consider extracting a shared function / module, keeping a single source of truth.

* **SOLID – favor maintainable, evolvable design**

  * Split responsibilities and abstract interfaces when needed, avoiding “god functions” and tight coupling, but do not chase patterns at the cost of readability.

* **Logging & error handling conventions (to be filled as needed)**:

  * {{LOGGING_CONVENTION}}
  * {{ERROR_HANDLING_CONVENTION}}

> For more detailed explanations and examples, see: `docs/engineering_principles.md`.

---

### 5.2 Collaboration workflow with the Engineer AI (four phases)

> This subsection describes the recommended workflow for the Engineer AI when implementing features, as per this project’s collaboration agreement.

In most tasks, the Engineer AI is encouraged to follow this process:

1. **Understand**

   * Briefly restate: what you believe the current task’s goal and success criteria are.
   * If key information is missing, first ask a **small number of high‑value questions** to fill gaps, rather than making blind assumptions.

2. **Plan**

   * Before changing code, provide 3–7 bullet points describing your implementation approach / modification plan.
   * For high‑impact changes, highlight risk points and rollback strategies.

3. **Execute**

   * Iterate in small steps: start with the smallest verifiable change and expand gradually.
   * Whenever possible, run local tests / checks related to your changes (see section 4), and update or add tests when needed.

4. **Report**

   * Summarize which files and modules were touched and the main changes.
   * Provide clear instructions on **how to validate** (which commands to run, which endpoints to hit, what results to expect).
   * Avoid vague, non‑verifiable statements (e.g., “it should be faster now but I can’t verify”). Prefer reproducible validation steps.

* **Communication & documentation language preferences**:

  * For communication with humans: default to Simplified Chinese when explaining reasoning and changes. Switch to other languages only when explicitly requested.
  * For writing / updating long‑lived documentation intended for the Engineer AI (AGENTS.md, `docs/*.md`, etc.): always use English.

