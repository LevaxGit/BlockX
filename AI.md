# AI Assistance

This fork of [BlockX](https://github.com/CodesxTalha/BlockX) was made with the help of
[Claude](https://claude.ai), an AI assistant made by Anthropic.

## What the AI did

Working in conversation with the maintainer of this fork, Claude:

- Read the BlockX source and explained how blocking works.
- Wrote the code for the changes listed under "Changes in this fork" in the [README](README.md):
  Firefox support, the Firefox lockdown policy generator fix, Schedules, and the Focus timer.
- Wrote the patches that were applied to this repository, and the text of the README changes and this file.
- Suggested ideas for features and helped debug problems from console output and screenshots.

## What the maintainer did

- Chose the features, forked the repository, and decided which changes to keep.
- Applied the patches, made the commits, and pushed them.
- Tested the extension by hand in Firefox and Vivaldi, and reported what went wrong so it could be fixed.

## Limits of the testing

- The extension was tested in Firefox as a temporary add-on, and in Vivaldi. Other browsers have not been tested.
- A signed Firefox build and the lockdown policy commands have not been tested on a real system.
- The code has not had an independent security review. AI-written code can contain mistakes, so read the changes
  before you rely on them.

## Original work

The original design, code, and assets belong to the original author, Talha Khalid, and to the third parties named
in [CREDITS.md](CREDITS.md). This fork keeps the original [license](LICENSE) (PolyForm Noncommercial 1.0.0) and the
required copyright notice.
