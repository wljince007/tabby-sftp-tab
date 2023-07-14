import { Injectable } from '@angular/core'
import { MenuItemOptions, BaseTabComponent, TabContextMenuItemProvider } from 'tabby-core'
import { SftpTabService } from './services/sftpTab.service'
// import { Logger,LogService } from 'tabby-core';

@Injectable()
export class SftptabContextMenuProvider extends TabContextMenuItemProvider {
    // private logger: Logger;

    constructor (
        // private log: LogService
        private sftptab: SftpTabService
    ) {
        super()
        // this.logger = log.create('open-sftp-tab-context-menu');
    }

    async getItems (tab: BaseTabComponent): Promise<MenuItemOptions[]> {
        return [
            {
                label: 'Open Sftp Tab',
                click: () => {
                    this.sftptab.opensftp(tab)
                    // this.logger("succ")
                },
            },
        ]
    }
}
