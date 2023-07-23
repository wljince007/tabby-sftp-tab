import { ConfigProvider, Platform } from 'tabby-core';

/** @hidden */
export class SftpTabConfigProvider extends ConfigProvider {
  public defaults = {
    hotkeys: {
        'open-sftp-tab':[
          'Ctrl-Shift-S',
        ],
    },
  }

  public platformDefaults = {
      [Platform.macOS]: {
      },
      [Platform.Windows]: {
      },
      [Platform.Linux]: {
      },
  }
}
