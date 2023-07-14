import { Injectable } from '@angular/core';
import { HotkeyDescription, HotkeyProvider } from 'tabby-core';

/** @hidden */
@Injectable()
export class SftpTabHotkeyProvider extends HotkeyProvider {
  async provide(): Promise<HotkeyDescription[]> {
    return [
      {
        id: 'open-sftp-tab',
        name: 'open sftp tab like SecureCRT',
      },
    ];
  }
}
