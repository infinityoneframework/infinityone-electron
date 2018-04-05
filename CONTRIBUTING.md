# Contributing Guidelines

Thanks for taking the time to contribute!

The following is a set of guidelines for contributing to InfinityOne Electron Desktop Client. These are just guidelines, not rules, so use your best judgement and feel free to propose changes to this document in a pull request.

## Getting Started

InfinityOne-Desktop app is built on top of [Electron](http://electron.atom.io/). If you are new to Electron, please head over to [this](http://jlord.us/essential-electron/) great article.

## Community

* The whole InfinityOne documentation, such as setting up a development environment, setting up with the InfinityOne webapp project, and testing, can be read [here](https://github.com/infinityoneframework/infinity_one).

* If you have any questions regarding infinityone-electron, open an [issue](https://github.com/infinityoneframework/infinityone-electron/issues/new/).

## Issue
Ensure the bug was not already reported by searching on GitHub under [issues](https://github.com/infinityoneframework/infinityone-electron/issues). If you're unable to find an open issue addressing the bug, open a [new issue](https://github.com/infinityoneframework/infinityone-electron/issues/new).

Please pay attention to the following points while opening an issue.

### Does it happen on web browsers? (especially Chrome)
InfinityOne's desktop client is based on Electron, which integrates the Chrome engine within a standalone application.
If the problem you encounter can be reproduced on web browsers, it may be an issue with [InfinityOne web app](https://github.com/infinityoneframework/infinityone).

### Write detailed information
Detailed information is very helpful to understand an issue.

For example:
* How to reproduce the issue, step-by-step.
* The expected behavior (or what is wrong).
* Screenshots for GUI issues.
* The application version.
* The operating system.
* The InfinityOne-Desktop version.


## Pull Requests
Pull Requests are always welcome.

1. When you edit the code, please run `npm run test` to check the formatting of your code before you `git commit`.
2. Ensure the PR description clearly describes the problem and solution. It should include:
   * The operating system on which you tested.
   * The InfinityOne-Desktop version on which you tested.
   * The relevant issue number, if applicable.
