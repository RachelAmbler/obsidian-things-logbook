# 📕 Things Logbook for Obsidian

[![Build plugin](https://github.com/RachelAmbler/obsidian-things-logbook/actions/workflows/publish.yml/badge.svg)](https://github.com/RachelAmbler/obsidian-things-logbook/actions/workflows/publish.yml)

This plugin for [Obsidian](https://obsidian.md/) will periodically sync your [Things](https://culturedcode.com/things/) Logbook with your Obsidian Daily Notes.

## Why?

Anecdotally, I love using Things for task management. But I also want Obsidian daily notes to be a holistic view of my day-to-day. This plugin dumps completed tasks from Things into my daily notes, meaning I can keep my same workflow, and my Second Brain has a new data source.

## Disclaimer 🚨

The initial sync will back-fill your entire Things Logbook into Obsidian. This potentially means creating/modifying hundreds of files. I recommend testing this plugin out in a new vault first to make sure you're happy with the result.

### Backup your data

While I have tested this plugin with my own data, your mileage may vary. I am not at fault for any data loss that may incur. Backup your data!

## Usage

This plugin will fetch all your historical tasks and dumps them into the Daily Note corresponding to the **completed date** of the task.

It also displays any subtasks, tags, or areas associated to the tasks.

It will re-fetch the tasks at a designated interval.

<img width="452" alt="image" src="https://user-images.githubusercontent.com/693981/105621501-144e6a80-5dd6-11eb-9462-4f7ba342afbc.png">

## Settings

| Setting         | Description                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------ |
| Section Heading | Controls where the tasks will be displayed within your daily notes. Defaults to `## Logbook`     |
| Sync Frequency  | How often you want to fetch the tasks from the Things DB                                         |
| Tag Prefix      | Allows you to prefix your Things tags into a parent tag (e.g. `#logbook/work` `#logbook/school`) |


## Enhanced Settings

The Enhanced version of the plugin allows for more customizable rendering of your tasks, for example:

<img width="500" alt="image" src="https://github.com/RachelAmbler/obsidian-things-logbook/blob/main/Assets/EnhancedRenderingExample.png?raw=true">

| Setting                                   | Description                                                                                                                                                                                                    |
|-------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Include Things tags?                      | Enable this to display any Things tags after the task.                                                                                                                                                         |
| Include Project or Area names as headings | Enable this to display the name of the Project or Area before the tasks.                                                                                                                                       |
| Alternative checkbox character(s)         | Normally the plugin will render the completed task as a checked markdown checkbox. The chosen character (or characters) will be displayed before the taks and prevent it from being render as a markdown task. |
| Render subitems\checklists?               | nable this to render any completed checklist items.                                                                                                                                                            |

## Say Thanks 🙏

If you like this plugin and would like to buy me a coffee, you can!

[<img src="https://cdn.buymeacoffee.com/buttons/v2/default-violet.png" alt="BuyMeACoffee" width="100">](https://www.buymeacoffee.com/RachelAmbler)
