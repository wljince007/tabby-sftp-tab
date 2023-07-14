import { Injectable } from '@angular/core';
// import { Logger, LogService, HotkeysService, HostAppService } from 'tabby-core';
import { BaseTabComponent, AppService, Logger, LogService, TabsService, HotkeysService } from 'tabby-core';
import {Profile, Platform, ProfilesService, HostAppService, ConfigService, PartialProfile } from 'tabby-core';

import deepClone from 'clone-deep'
import {SftpTabConfigProvider} from '../config'

import {SettingsTabComponent} from 'tabby-settings';


@Injectable()
export class SftpTabService {
  private logger: Logger;
  private sftpTabConfigProvider: SftpTabConfigProvider;

  constructor(
    private config: ConfigService,
    private app: AppService,
    private profilesService: ProfilesService,
    private hostApp: HostAppService,
    private hotkeys: HotkeysService,
    private tabsService: TabsService,
    log: LogService    
  ) {
    this.sftpTabConfigProvider = new SftpTabConfigProvider
    this.logger = log.create('open-sftp-tab');
    this.logger.info('starting...');
  }

  init(): void {
    this.hotkeys.hotkey$.subscribe(async (h) => {
      if (h === 'open-sftp-tab') {
        this.opensftp(null)
      }
    });
    this.logger.info('init succ!');
    this.config.ready$.toPromise().then(() => {
      this.tryAddSftpProfilesTemplateToConfigService().then(() => {
        this.logger.info('call tryAddSftpProfilesTemplateToConfigService after config.ready');
      })
    })
  }

  findFirstSshProfile(token: any):   Profile | null {
    this.logger.info(`token:${token}`, token)
    if (token.type == "app:ssh-tab" ) {
      if (token.profile!=null) {
        return token.profile
      }
    }
    if (token?.children?.length >0) {
      // find first children ssh-tab of origin tab(split-tab)
      for (let index = 0; index < token.children.length; index++) {
        const curtab = token.children[index];
        if (curtab.type == "app:ssh-tab" ) {
          if (curtab.profile!=null) {
            return curtab.profile
          }
        }
      }
    }
    return null
  }

  // add sftp profile template to config service and save to config file
  async tryAddSftpProfilesTemplateToConfigService(): Promise<void> {
    let modifiedConfig :boolean = false
    this.sftpTabConfigProvider.defaults.profiles.forEach(sftpProfile => {
      let find_in_config : boolean = false
      this.config.store.profiles.forEach(profile => {
        if (profile?.name == sftpProfile.name){
          find_in_config = true
        }
      });
      if (!find_in_config) {
        this.config.store.profiles = [...this.config.store.profiles, deepClone(sftpProfile)]
        modifiedConfig = true
      }
    });
    if (modifiedConfig) {
      await this.config.save()
      await this.config.load()
  
      // If the settings tab is already open, close and reopen the settings tab on the same tabs index.
      const settingsTabOld = this.app.tabs.find(tab => tab instanceof SettingsTabComponent)
      if (settingsTabOld) {
          const settingsTabOldIdx = this.app.tabs.indexOf(settingsTabOld)
          this.app.closeTab(settingsTabOld)
  
          const settingsTab = this.tabsService.create({ type: SettingsTabComponent })
          this.app.addTabRaw(settingsTab,settingsTabOldIdx)
          this.app.selectTab(settingsTab)
      }
    }
  }


  async findSftpProfileTemplate(): Promise<PartialProfile<Profile>|null> {
    let profileName =""
    if (this.hostApp.platform === Platform.macOS) {
        profileName = "ssh2sftp_mac_template"
    } else if (this.hostApp.platform === Platform.Linux) {
        profileName = "ssh2sftp_linux_template"
    } else if (this.hostApp.platform === Platform.Windows){
        profileName = "ssh2sftp_win_template"
    } else if (this.hostApp.platform === Platform.Web){
        return null
    }

    let sftpProfileTemplate = (await this.profilesService.getProfiles()).find(x => x.name === profileName)
    if (!sftpProfileTemplate) {
      // Attempt to add a default sftp profile when not found
      this.logger.warn(`Requested profile ${profileName} not found, try adding ...`, profileName);
      await this.tryAddSftpProfilesTemplateToConfigService()
      sftpProfileTemplate = (await this.profilesService.getProfiles()).find(x => x.name === profileName)
    }
    return sftpProfileTemplate
  }

  async openSftpImpl (tab: BaseTabComponent|null): Promise<BaseTabComponent|null>{
    let ans :BaseTabComponent|null = null
    if (tab == null) {
      tab = this.app.activeTab
    }

    let sftpProfileTemplate = await this.findSftpProfileTemplate()
    if (!sftpProfileTemplate) {
        // Report an error if it cannot be found the second time
        this.logger.warn(`Requested profile ${sftpProfileTemplate} not found`, sftpProfileTemplate);
        return null
    }else {
        let sftpProfile = deepClone(sftpProfileTemplate)
        const token = await tab.getRecoveryToken()
        let sshprofile : Profile | null =this.findFirstSshProfile(token)
        if (sshprofile != null) {
          sftpProfile.name =  "sftp_" + sshprofile?.name
          if(sftpProfile?.options && sshprofile?.options){
              let args = sftpProfile.options["args"]
              if (args as Array<string>) {
                  args.push("-P")
                  const port = sshprofile.options.port as number
                  args.push(port.toString())
                  args.push(sshprofile.options.user as string + "@" + sshprofile.options.host as string)
              }
          }
          let params = await this.profilesService.newTabParametersForProfile(sftpProfile)
          if (params) {
              const sftptab = this.tabsService.create(params)
              if (sftptab) {
                  this.app.addTabRaw(sftptab,this.app.tabs.indexOf(tab)+1)
                  this.app.selectTab(sftptab)
                  ans = sftptab
                  this.logger.info('open sftp tab for ssh profile succ');
              }
          }
          return ans
        }else {
            this.logger.warn('open sftp tab just for ssh profile connection。 can not find ssh profile! can not open sftp tab!!!');
        }
    }
    return ans
  }

  opensftp(tab: BaseTabComponent|null):void {
    this.logger.info('try open sftp tab for ssh profile');
    this.openSftpImpl(tab).then((baseTabComponent) => {
      if (baseTabComponent ==null){
        this.logger.error('open sftp tab for ssh profile error!!!');
      }
    })
  }
}
