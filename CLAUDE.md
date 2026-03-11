# CLAUDE.md — AI Assistant Guide for tabby-sftp-tab

## Project Overview

`tabby-sftp-tab` is a plugin for the [Tabby terminal emulator](https://tabby.sh) that opens an SFTP tab alongside an active SSH connection. It extracts SSH connection parameters from the active tab and launches a new SFTP session, supporting jump hosts configured via OpenSSH (`~/.ssh/config`).

- **npm package:** `tabby-sftp-tab`
- **Current version:** 1.0.7
- **Author:** wljince007 (liangwang007@gmail.com)
- **License:** MIT
- **Repository:** https://github.com/wljince007/tabby-sftp-tab

---

## Repository Structure

```
tabby-sftp-tab/
├── src/
│   ├── index.ts                        # Angular module entry — registers all providers
│   ├── config.ts                       # ConfigProvider — platform-specific YAML defaults
│   ├── contextMenu.ts                  # TabContextMenuItemProvider — "Open Sftp Tab" menu item
│   ├── hotkey.ts                       # HotkeyProvider — declares 'open-sftp-tab' hotkey
│   ├── configDefaults.yaml             # Default SFTP profile template (all platforms)
│   ├── configDefaults.linux.yaml       # Linux sftp binary path + hotkey
│   ├── configDefaults.windows.yaml     # Windows sftp binary path + hotkey
│   ├── configDefaults.macos.yaml       # macOS sftp binary path + hotkey
│   ├── configDefaults.web.yaml         # Web platform (empty/unsupported)
│   └── services/
│       └── sftpTab.service.ts          # Core service — all SFTP logic lives here
├── dist/                               # Webpack build output (gitignored, generated)
├── doc/                                # Screenshot images for README
├── package.json
├── tsconfig.json
├── webpack.config.js
├── build.sh                            # yarn install + yarn run build
├── publish.sh                          # npm webpack + npm publish
└── README.md
```

---

## Architecture

This is an **Angular-based Tabby plugin** using the Tabby provider extension model. There are four integration points:

| File | Provider Interface | Purpose |
|---|---|---|
| `src/hotkey.ts` | `HotkeyProvider` | Declares the `open-sftp-tab` hotkey ID |
| `src/contextMenu.ts` | `TabContextMenuItemProvider` | Adds "Open Sftp Tab" to right-click tab menu |
| `src/config.ts` | `ConfigProvider` | Supplies platform-specific default profile templates |
| `src/services/sftpTab.service.ts` | `Injectable` service | All SFTP tab creation logic |

All providers are registered in `src/index.ts` via the `SftpTabModule` Angular module.

### Data Flow

1. User triggers SFTP open (hotkey `Ctrl+Shift+S` or context menu)
2. `SftpTabService.opensftp(tab)` is called with the active tab
3. `findFirstSshProfile(token)` extracts SSH credentials from the tab (or its split-tab children)
4. `findSftpProfileTemplate()` locates the platform-appropriate SFTP template from config
5. The template is deep-cloned, connection parameters are injected into its `args` array
6. A new tab is created adjacent to the SSH tab and auto-focused

### Jump Host Support

The service parses `~/.ssh/config` for `ProxyJump` and `ProxyCommand` directives. For each jump host in the chain, an additional `-J user@host:port` argument is prepended to the SFTP command.

---

## Key Source Files

### `src/services/sftpTab.service.ts`

The core service (~229 lines). All business logic.

**Important methods:**

- `init()` — Called at module startup. Subscribes to the `open-sftp-tab` hotkey and loads config.
- `findFirstSshProfile(token)` — Traverses the active tab tree (including split-tab children) to find the SSH profile with connection details.
- `findSftpProfileTemplate()` — Returns the platform-specific SFTP profile template from `ConfigService`.
- `tryAddSftpProfilesTemplateToConfigService()` — Ensures required SFTP templates exist; adds them if missing.
- `openSftpImpl(tab)` — Core implementation: extract SSH info → clone template → inject args → open new tab.
- `opensftp(tab)` — Public entry point called by hotkey and context menu.

**Constructor-injected services (from Tabby):**

```typescript
constructor(
  private config: ConfigService,
  private app: AppService,
  private profiles: ProfilesService,
  private hostApp: HostAppService,
  private hotkeys: HotkeysService,
  private tabs: TabsService,
  private log: LogService,
)
```

### `src/config.ts`

Extends `ConfigProvider`. The `platformDefaults` property supplies per-platform YAML config (imported via `yaml-loader`). The `defaults` property supplies common profile defaults.

### `src/index.ts`

Registers all providers with Tabby's DI system and calls `service.init()` during module construction.

---

## Build System

### Tech Stack

- **Language:** TypeScript 4.9 (ES2016 target, ES2015 modules)
- **Bundler:** Webpack 5 with `ts-loader`
- **Output format:** UMD (Universal Module Definition) at `dist/index.js`
- **Styles:** SCSS compiled via `sass-loader` → `css-loader` → `style-loader`
- **Templates:** Pug (declared in deps, not currently used in source)
- **Config files:** YAML loaded via `yaml-loader`

### Build Commands

```bash
# Install dependencies and build
yarn && yarn run build

# Or with npm
npm install && npm run build

# Watch mode for development
npm run watch

# Build script (installs deps first)
./build.sh
```

### Webpack Externals

Webpack is configured to **not bundle** the following (they are provided by the Tabby host at runtime):

- `fs`
- `ngx-toastr`
- All `rxjs` and `rxjs/operators` imports
- All `@angular/*` packages
- All `tabby-*` packages (tabby-core, tabby-settings, tabby-terminal, etc.)

**This is critical:** do not add tabby or Angular packages to the bundle. They must remain external.

### TypeScript Configuration

Strict options enabled:
- `noUnusedParameters: true`
- `noImplicitReturns: true`
- `noFallthroughCasesInSwitch: true`
- `noUnusedLocals: true`
- `experimentalDecorators: true` (required for Angular)
- `emitDecoratorMetadata: true` (required for Angular DI)
- `noImplicitAny: false` (explicit any is allowed)

---

## Development Conventions

### Naming

- **Classes:** PascalCase — `SftpTabService`, `SftpTabModule`
- **Methods:** camelCase — `opensftp`, `findFirstSshProfile`
- **Provider class names:** `SftpTab<Role>Provider` pattern
- **Hotkey IDs:** kebab-case string literals — `'open-sftp-tab'`

### Code Style

- Use `async/await` for async operations
- Use RxJS `subscribe()` for event streams (hotkeys, config changes)
- Use `clone-deep` when cloning profile objects to avoid mutation
- Log with the injected `Logger` instance (`this.logger.info/warn/error`)
- Use Angular's `@Injectable()` decorator on services; mark providers with appropriate Tabby provider tokens

### Error Handling

- Return early with `logger.warn()` if required resources (profile, template) are not found
- Do not throw unhandled exceptions in hotkey/context-menu handlers
- Log unexpected states with `logger.info()` for debugging

### Platform Detection

Use `this.hostApp.platform` compared against `Platform` enum values:

```typescript
import { Platform } from 'tabby-core'

if (this.hostApp.platform === Platform.Windows) { ... }
if (this.hostApp.platform === Platform.macOS) { ... }
if (this.hostApp.platform === Platform.Linux) { ... }
```

### SFTP Profile Templates

Platform-specific SFTP binary paths:
- **Linux:** `/usr/bin/sftp`
- **macOS:** `/usr/local/opt/openssh/bin/sftp` (Homebrew OpenSSH)
- **Windows:** `c:\Git\usr\bin\sftp.exe` (Git for Windows)
- **Web:** Not supported (empty config)

---

## Configuration System

Tabby's `ConfigService` merges YAML config from all registered `ConfigProvider` instances. This plugin contributes:

1. **`configDefaults.yaml`** — Common profile structure (loaded for all platforms via `defaults`)
2. **`configDefaults.<platform>.yaml`** — Platform-specific overrides (binary path + default hotkey)

Profile templates use `isTemplate: true` to prevent them from appearing in the profile selection UI for normal users.

The `id` field of each template profile uses the format:
```
local:custom:ssh2sftp_<platform>_template:<UUID>
```

---

## Testing

**There are no automated tests** in this repository. The project has no test framework, test files, or test scripts configured.

When adding features:
- Manual testing requires a running Tabby installation with the plugin installed
- Test against all three platforms (Linux, macOS, Windows) for platform-sensitive changes
- Verify both the hotkey (`Ctrl+Shift+S`) and context menu trigger paths

---

## Publishing

```bash
# Build and publish to npm
npm publish

# The prepublishOnly script runs the build automatically
# Alternatively:
./publish.sh
```

Only the `dist/` directory is distributed in the npm package (configured via `package.json` `main` and `types` fields pointing to `dist/`).

---

## Common Tasks

### Adding a New Platform

1. Create `src/configDefaults.<platform>.yaml` with the correct sftp binary path and hotkey
2. Add a `platformDefaults[Platform.<NewPlatform>]` entry in `src/config.ts`
3. Import the new YAML file in `src/config.ts`

### Adding a New SSH Parameter

In `sftpTab.service.ts`, find the `openSftpImpl` method and add the new SSH option to the `args` array being built before the tab is created.

### Changing the Hotkey

Modify the appropriate `configDefaults.<platform>.yaml` file under the `hotkeys:` key. The hotkey ID `open-sftp-tab` is declared in `src/hotkey.ts` and must match.

### Modifying Context Menu

Edit `src/contextMenu.ts`. The menu item is returned from `getItems(tab, _lastEvent)`. Add ordering/filtering logic here if needed.

---

## Dependencies Reference

| Package | Role |
|---|---|
| `tabby-core` | Core Tabby APIs: AppService, ConfigService, ProfilesService, HostAppService, HotkeysService, TabsService, LogService |
| `tabby-settings` | Settings page integration |
| `tabby-terminal` | Terminal tab types and execution |
| `rxjs` | Observable streams for hotkeys and config |
| `clone-deep` | Deep object cloning for profile instances |

All Tabby and Angular packages are **peer dependencies** — they are provided by the host application, not bundled.
