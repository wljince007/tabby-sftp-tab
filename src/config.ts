import { ConfigProvider, Platform } from 'tabby-core';

/** @hidden */
export class SftpTabConfigProvider extends ConfigProvider {
  public platformDefaults = {
    [Platform.macOS]: require('./configDefaults.macos.yaml').default,
    [Platform.Windows]: require('./configDefaults.windows.yaml').default,
    [Platform.Linux]: require('./configDefaults.linux.yaml').default,
    [Platform.Web]: require('./configDefaults.web.yaml').default,
  }
  public defaults = require('./configDefaults.yaml').default
}
