# Tabby Sftp Tab Plugin

Plugin for the [Tabby Terminal](https://github.com/Eugeny/tabby)

This simple plugin allows you to set a hotkey to open sftp tab like SecureCRT (default hotkey: Ctrl-Shift-S).

# Implementation Description
1. Add [ssh2sftp_win_template， ssh2sftp_linux_template, ssh2sftp_mac_template] profiles to config when first call open sftp tab by context menu or hotkey(Ctrl-Shift-S),  and you can manually set it in Settings/Config file.
   
```
profiles:
  - type: local
    name: ssh2sftp_win_template
    icon: fas fa-terminal
    options:
      command: c:\Git\usr\bin\sftp.exe
      args:
        - '-oStrictHostKeyChecking=no'
        - '-oServerAliveInterval=30'
        - '-oServerAliveCountMax=1051200'
        - '-oTCPKeepAlive=yes'
      env: {}
      cwd: ''
    group: ssh2sftp_template
    id: local:custom:ssh2sftp_win_template:c617da05-d05c-482d-8ca6-3c7eb99452e9
  - type: local
    name: ssh2sftp_linux_template
    icon: fas fa-terminal
    options:
      command: /usr/bin/sftp
      args:
        - '-oStrictHostKeyChecking=no'
        - '-oServerAliveInterval=30'
        - '-oServerAliveCountMax=1051200'
        - '-oTCPKeepAlive=yes'
      env: {}
      cwd: ''
    group: ssh2sftp_template
    id: local:custom:ssh2sftp_linux_template:6c4bcc75-f690-482a-a882-40e1c9851a3d
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
      cwd: ''
    id: local:custom:ssh2sftp_mac_template:33162a26-7807-4c5e-ac2d-68cd2d9a4a24
    group: ssh2sftp_template
```

2. On window this plugin will use ssh2sftp_win_template profile to open sftp tab of ssh tab connection, you need fix sftp.exe path by edit profiles.ssh2sftp_win_template.command. It is recommended to install [git for Windows](https://gitforwindows.org/) and then use the path [git install dir]\usr\bin\sftp.exe, because it provide tab completion.
3. On linux this plugin will use ssh2sftp_linux_template profile to open sftp tab of ssh tab connection, default sftp provide tab completion.
4. On macos this plugin will use ssh2sftp_mac_template profile to open sftp tab of ssh tab connection, you need fix sftp path by edit profiles.ssh2sftp_mac_template.command. It is recommended to install openssh (command: brew install openssh) and then use the path /usr/local/opt/openssh/bin/sftp, because it provide tab completion.
