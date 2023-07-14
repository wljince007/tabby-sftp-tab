import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import TabbyCoreModule, {ConfigProvider, HotkeyProvider, TabContextMenuItemProvider } from 'tabby-core';


import { SftpTabHotkeyProvider } from './hotkey';
import { SftpTabConfigProvider } from './config';

import { SftptabContextMenuProvider } from './contextMenu'

import { SftpTabService } from './services/sftpTab.service';

@NgModule({
  imports: [CommonModule, FormsModule, TabbyCoreModule, NgbModule],
  providers: [
    
    SftpTabService,
    {
      provide: HotkeyProvider,
      useClass: SftpTabHotkeyProvider,
      multi: true,
    },
    { provide: TabContextMenuItemProvider, useClass: SftptabContextMenuProvider, multi: true },
    {
      provide: ConfigProvider,
      useClass: SftpTabConfigProvider,
      multi: true,
    },
  ],
})
export default class SftpTabModule {
  constructor(private service: SftpTabService) {
    this.service.init();
  }
}
