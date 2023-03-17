import { App, PluginSettingTab, Setting } from "obsidian";

import type ThingsLogbookPlugin from "./index";

export const DEFAULT_SECTION_HEADING = "## Logbook";
export const DEFAULT_SYNC_FREQUENCY_SECONDS = 30 * 60; // Every 30 minutes
export const DEFAULT_TAG_PREFIX = "logbook/";
export const DEFAULT_CANCELLED_MARK = "c";
export const DEFAULT_TABLE_FORMAT = "TAg";

export interface ISettings {
  hasAcceptedDisclaimer: boolean;
  latestSyncTime: number;

  doesSyncNoteBody: boolean;
  isSyncEnabled: boolean;
  sectionHeading: string;
  syncInterval: number;
  tagPrefix: string;
  canceledMark: string;
  includeTags: boolean;
  includeHeaders: boolean;
  renderChecklists: boolean;
  alternativeCheckboxPrefix : string;
  renderAsTable : boolean;
  tableFormatDefinition : string;
}

export const DEFAULT_SETTINGS = Object.freeze({
  hasAcceptedDisclaimer: false,
  latestSyncTime: 0,

  doesSyncNoteBody: true,
  isSyncEnabled: false,
  syncInterval: DEFAULT_SYNC_FREQUENCY_SECONDS,
  sectionHeading: DEFAULT_SECTION_HEADING,
  tagPrefix: DEFAULT_TAG_PREFIX,
  canceledMark: DEFAULT_CANCELLED_MARK,
  includeTags: true,
  includeHeaders: true,
  renderChecklists: true,
  alternativeCheckboxPrefix: "",
  renderAsTable : false,
  tableFormatDefinition : DEFAULT_TABLE_FORMAT
});

export class ThingsLogbookSettingsTab extends PluginSettingTab {
  private plugin: ThingsLogbookPlugin;

  constructor(app: App, plugin: ThingsLogbookPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    this.containerEl.empty();

    this.containerEl.createEl("h3", {
      text: "Format Settings",
    });
    this.addSectionHeadingSetting();
    this.addTagPrefixSetting();
    this.addCanceledMarkSetting();

    this.containerEl.createEl("h3", {
      text: "Sync",
    });
    this.addSyncEnabledSetting();
    this.addSyncIntervalSetting();
    this.addDoesSyncNoteBodySetting();

    this.containerEl.createEl("h3", {
      text: "Enhanced Settings",
    });
    this.addSyncTagsSetting();
    this.addIncludeHeadersSetting();
    this.addAlternativeCheckboxPrefix();
    this.addRenderChecklists();
    //this.addRenderAsTable();
    //this.addTableFormatDefinition();
  }

  addSectionHeadingSetting(): void {
    new Setting(this.containerEl)
      .setName("Section heading")
      .setDesc(
        "Markdown heading to use when adding the logbook to a daily note"
      )
      .addText((textfield) => {
        textfield.setValue(this.plugin.options.sectionHeading);
        textfield.onChange(async (rawSectionHeading) => {
          const sectionHeading = rawSectionHeading.trim();
          this.plugin.writeOptions({ sectionHeading });
        });
      });
  }

  addSyncEnabledSetting(): void {
    new Setting(this.containerEl)
      .setName("Enable periodic syncing")
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.options.isSyncEnabled);
        toggle.onChange(async (isSyncEnabled) => {
          this.plugin.writeOptions({ isSyncEnabled });
        });
      });
  }

  addDoesSyncNoteBodySetting() {
    new Setting(this.containerEl)
      .setName("Include notes")
      .setDesc('Includes Markdown notes of a task into the synced Obsidian document')
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.options.doesSyncNoteBody);
        toggle.onChange(async (doesSyncNoteBody) => {
          this.plugin.writeOptions({ doesSyncNoteBody })
        });
      });
  }

  addSyncIntervalSetting(): void {
    new Setting(this.containerEl)
      .setName("Sync Frequency")
      .setDesc("Number of seconds the plugin will wait before syncing again")
      .addText((textfield) => {
        textfield.setValue(String(this.plugin.options.syncInterval));
        textfield.inputEl.type = "number";
        textfield.inputEl.onblur = (e: FocusEvent) => {
          const syncInterval = Number((<HTMLInputElement>e.target).value);
          textfield.setValue(String(syncInterval));
          this.plugin.writeOptions({ syncInterval });
        };
      });
  }

  addTagPrefixSetting(): void {
    new Setting(this.containerEl)
      .setName("Tag Prefix")
      .setDesc(
        "Prefix added to Things tags when imported into Obsidian (e.g. #logbook/work)"
      )
      .addText((textfield) => {
        textfield.setValue(this.plugin.options.tagPrefix);
        textfield.onChange(async (tagPrefix) => {
          this.plugin.writeOptions({ tagPrefix });
        });
      });
  }
  addCanceledMarkSetting(): void {
    new Setting(this.containerEl)
        .setName("Canceled Mark")
        .setDesc(
            "Mark character to use for canceled tasks"
        )
        .addText((textfield) => {
          textfield.setValue(this.plugin.options.canceledMark);
          textfield.onChange(async (canceledMark) => {
            this.plugin.writeOptions({ canceledMark });
          });
        });
  }

  addSyncTagsSetting(): void {
    new Setting(this.containerEl)
      .setName("Include Things tags?")
      .setDesc("Enable this to display any Things tags after the task.")
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.options.includeTags);
        toggle.onChange(async (includeTags) => {
          this.plugin.writeOptions({ includeTags });
        });
      });
  }

  addIncludeHeadersSetting(): void {
    new Setting(this.containerEl)
      .setName("Include Project or Area names as headings?")
      .setDesc("Enable this to display the name of the Project or Area before the tasks.")
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.options.includeHeaders);
        toggle.onChange(async (includeHeaders) => {
          this.plugin.writeOptions({ includeHeaders });
        });
      });
  }
    addRenderChecklists(): void {
      new Setting(this.containerEl)
        .setName("Render subitems\\checklists?")
        .setDesc("Enable this to render any completed checklist items. Please note that the plugin doesn't " +
          "evaluate when the item was checked, just that it was."
        )
        .addToggle((toggle) => {
          toggle.setValue(this.plugin.options.renderChecklists);
          toggle.onChange(async (renderChecklists) => {
            this.plugin.writeOptions({ renderChecklists });
          });
        });
  }
  addAlternativeCheckboxPrefix(): void {
    new Setting(this.containerEl)
      .setName("Alternative checkbox character(s)")
      .setDesc(
        "Normally the plugin will render the completed task as a markdown checkbox." +
        "Enter a prefix here to use a different character. Setting this will " +
        "no longer render the task as a markdown task marked as Checked."
      )
      .addText((textfield) => {
        textfield.setValue(this.plugin.options.alternativeCheckboxPrefix);
        textfield.onChange(async (alternativeCheckboxPrefix) => {
          this.plugin.writeOptions({ alternativeCheckboxPrefix });
        });
      });
  }
/*
  addRenderAsTable(): void {
    new Setting(this.containerEl)
      .setName("Render the output as a markdown table?")
      .setDesc("Enable this setting to render the logbook as a Markdown table.\n" +
      "Setting this will prevent Checklists from being rendered.\n" +
      "Please note that disabling the Tags will prevent them from being rendered " +
      "iirespective of the format string defined for the table itself.")
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.options.renderAsTable);
        toggle.onChange(async (renderAsTable) => {
          this.plugin.writeOptions({ renderAsTable });
        });
      });
  }
  addTableFormatDefinition(): void {
    new Setting(this.containerEl)
      .setName("Table Format Definition")
      .setDesc(
        `If you have selected to render the logbook as a table, then this string will define ` +
        `the format of the rendered table.\n` +
        `The default format is ${DEFAULT_TABLE_FORMAT}\n` +
        `Where  T = Task Title\n` +
        `       A = Area\n` +
        `  and  g = Tags`
      )
      .addText((textfield) => {
        textfield.setValue(this.plugin.options.tableFormatDefinition);
        textfield.onChange(async (tableFormatDefinition) => {
          this.plugin.writeOptions({ tableFormatDefinition });
        });
      });
  }
  */
}
