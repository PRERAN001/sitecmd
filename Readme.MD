
# Sitecmd

Turn websites into programmable tools.

Sitecmd lets you connect to a website, authenticate once, teach it a workflow by interacting with the website normally, and turn that workflow into a reusable command.

Instead of building a custom integration for every website, Sitecmd learns how the website is used and allows the workflow to be replayed with different parameters.

## How It Works

```text
Connect
   ↓
Authenticate
   ↓
Learn a workflow
   ↓
Record actions
   ↓
Compile into a command
   ↓
Run with different parameters
````

For example, teach Sitecmd how to search a website once:

```bash
sitecmd learn github.com
```

After recording the workflow:

```bash
sitecmd compile recording.json --name github_search
```

You can then reuse it:

```bash
sitecmd run github_search --query "webcmd"
```

And run the same workflow with different parameters:

```bash
sitecmd run github_search --query "playwright"
```

The workflow stays the same while the input changes.

## Features

* Connect to websites and authenticate once
* Persistent browser sessions
* Record user interactions
* Capture clicks and inputs
* Record filters and form changes
* Track page navigation
* Capture network activity
* Automatically detect workflow parameters
* Compile recordings into reusable commands
* Custom command names
* Store and manage learned commands
* Inspect compiled commands
* Replay workflows using Playwright
* Run commands with different parameters
* Selector-based element replay
* Wait for elements during execution
* Support for reusable filters and dynamic inputs

## CLI

### Connect to a website

```bash
sitecmd connect <url>
```

Example:

```bash
sitecmd connect github.com
```

Authenticate in the browser. Sitecmd stores the persistent browser session for future use.

### Learn a workflow

```bash
sitecmd learn <url>
```

Example:

```bash
sitecmd learn github.com
```

Perform the workflow normally in the browser. Sitecmd records the interaction.

### Compile a workflow

```bash
sitecmd compile <recording> --name <command>
```

Example:

```bash
sitecmd compile recording.json --name github_search
```

This converts the recorded workflow into a reusable command.

### List commands

```bash
sitecmd commands
```

Shows all learned commands.

### Inspect a command

```bash
sitecmd inspect <command>
```

Shows the command's parameters, workflow steps, selectors, navigation and other recorded information.

### Run a command

```bash
sitecmd run <command> --<parameter> <value>
```

Example:

```bash
sitecmd run github_search --query "webcmd"
```

Parameters can be changed without changing the underlying workflow.

### Open a connected website

```bash
sitecmd open <url>
```

### Disconnect a website

```bash
sitecmd disconnect <url>
```

## Example Workflow

A user teaches Sitecmd:

```text
Open website
      ↓
Click search
      ↓
Enter "rice"
      ↓
Apply rating filter
      ↓
Sort results
      ↓
Select result
```

Sitecmd records the workflow and identifies values that can become parameters:

```text
query
min_rating
sort
```

The workflow can then become:

```bash
sitecmd run food_search \
  --query "pizza" \
  --min-rating 4.5 \
  --sort "delivery_time"
```

The actions remain the same while the parameters change.

## Architecture

```text
Website
   ↓
Playwright
   ↓
Recorder
   ├── Actions
   └── Network Activity
          ↓
      Recording
          ↓
      Compiler
          ↓
     Command Registry
          ↓
        Runner
          ↓
      Playwright
          ↓
       Website
```

## Tech Stack

* JavaScript
* Node.js
* Playwright
* Commander.js

## Status

Sitecmd is currently in active development.

The current version focuses on:

* Website connections
* Persistent sessions
* Workflow recording
* Parameter extraction
* Command compilation
* Command storage
* Command execution

More advanced workflow handling and integrations are planned.

## Vision

Websites are designed to be used through a browser.

Sitecmd explores a different idea:

**What if the workflows we perform on websites could become programmable commands?**

Connect once.
Teach once.
Reuse anywhere.

