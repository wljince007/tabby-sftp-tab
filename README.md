# Tabby Sftp Tab Plugin

Plugin for the [Tabby Terminal](https://github.com/Eugeny/tabby)

This simple plugin allows you click a context menu(Open Sftp Tab) or press a hotkey(Ctrl-Shift-S) to open sftp tab like SecureCRT for ssh connection. 

## Installation

* Install [tabby](https://tabby.sh/) first, and then install the `sftp-tab` plugin.

![tabby-sftp-tab plugin](https://github.com/wljince007/tabby-sftp-tab/blob/main/doc/install.png?raw=true)


## Configuration

![tabby-sftp-tab setting_ssh2sftp_XXX_template](https://github.com/wljince007/tabby-sftp-tab/blob/main/doc/setting_ssh2sftp_template.png?raw=true)

* On window this plugin will use ssh2sftp_win_template profile to open sftp tab of ssh tab connection, you need fix sftp.exe path by edit profiles.ssh2sftp_win_template.command. It is recommended to install [git for Windows](https://gitforwindows.org/) and then use the path [git install dir]\usr\bin\sftp.exe, because it provide tab completion. :
  
![tabby-sftp-tab setting_ssh2sftp_win_template](https://github.com/wljince007/tabby-sftp-tab/blob/main/doc/setting_ssh2sftp_win_template.png?raw=true)

* On linux this plugin will use ssh2sftp_linux_template profile to open sftp tab of ssh tab connection, default sftp provide tab completion.:
  
![tabby-sftp-tab setting_ssh2sftp_linux_template](https://github.com/wljince007/tabby-sftp-tab/blob/main/doc/setting_ssh2sftp_linux_template.png?raw=true)

* On macos this plugin will use ssh2sftp_mac_template profile to open sftp tab of ssh tab connection, you need fix sftp path by edit profiles.ssh2sftp_mac_template.command. It is recommended to install openssh (command: brew install openssh) and then use the path /usr/local/opt/openssh/bin/sftp, because it provide tab completion.
  
![tabby-sftp-tab setting_ssh2sftp_mac_template](https://github.com/wljince007/tabby-sftp-tab/blob/main/doc/setting_ssh2sftp_mac_template.png?raw=true)

* setging hotkey:
  
![tabby-sftp-tab setting](https://github.com/wljince007/tabby-sftp-tab/blob/main/doc/setting_hotkey.png?raw=true)



## Screenshot

* Using sftp-tab in tabby, for ssh connection tab, click to open context menu, select "Open Sftp Tab". or press hotkey(default: Ctrl-Shift-S):

![tabby-sftp-tab using_context_menu](https://github.com/wljince007/tabby-sftp-tab/blob/main/doc/using_context_menu.png?raw=true)

* Then sftp tab for the ssh connection well open:

![tabby-sftp-tab using_context_menu_result](https://github.com/wljince007/tabby-sftp-tab/blob/main/doc/using_context_menu_result.png?raw=true)





# Implementation Description
1. The plugin well add [ssh2sftp_win_template， ssh2sftp_linux_template, ssh2sftp_mac_template] profiles on start(when config service ready), also you can set/change it in Settings/Config file manually.
   
```
profiles:
  - type: local
    name: ssh2sftp_win_template
    icon: fas fa-terminal
    options:
      command: c:\Git\usr\bin\sftp.exe
      env: {}
      cwd: ''
      args:
        - '-oStrictHostKeyChecking=no'
        - '-oServerAliveInterval=30'
        - '-oServerAliveCountMax=1051200'
        - '-oTCPKeepAlive=yes'
    group: ssh2sftp_template
    id: local:custom:ssh2sftp_win_template:c617da05-d05c-482d-8ca6-3c7eb99452e9
    disableDynamicTitle: true
    isTemplate: true
  - type: local
    name: ssh2sftp_linux_template
    icon: fas fa-terminal
    options:
      command: /usr/bin/sftp
      env: {}
      cwd: ''
      args:
        - '-oStrictHostKeyChecking=no'
        - '-oServerAliveInterval=30'
        - '-oServerAliveCountMax=1051200'
        - '-oTCPKeepAlive=yes'
    group: ssh2sftp_template
    id: local:custom:ssh2sftp_linux_template:6c4bcc75-f690-482a-a882-40e1c9851a3d
    disableDynamicTitle: true
    isTemplate: true
  - type: local
    name: ssh2sftp_mac_template
    icon: fas fa-terminal
    options:
      command: /usr/local/opt/openssh/bin/sftp
      args:
        - '-oStrictHostKeyChecking=no'
        - '-oServerAliveInterval=30'
        - '-oServerAliveCountMax=1051200'
        - '-oTCPKeepAlive=yes'
      env: {}
      cwd: /Volumes/RamDisk
    id: local:custom:ssh2sftp_mac_template:33162a26-7807-4c5e-ac2d-68cd2d9a4a24
    group: ssh2sftp_template
    disableDynamicTitle: true
    isTemplate: true
```
2. The plugin get params(params are: user, host, port) from ssh connection and use above ssh2sftp_XXX_template to open sftp tab.

# Version logs

## 1.0.3
* fix err to set isTemplate=true for no ssh2sftp_XXX_template
  
## 1.0.2
* Auto focus sftp tab after created.
  
## 1.0.1
* Set ssh2sftp_XXX_template.isTemplate=true, so ssh2sftp_XXX_template no display in "Profile & connections" when user select profile to open, but can edit in settings."Profile & connections".

## 1.0.0
* Automatically add ssh2sftp_XXX_template after config service ready.
* Refer to tabby-trzsz to modify user instructions.

## 0.0.9
* Implementing the sftp tab function of the SecureCRT class for the first time.


