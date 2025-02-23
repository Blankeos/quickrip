# quickrip

> [!WARNING]
> Status: Not Done. Still working on it, but I can download audio no problem atm.

A tool for ripping audio from YouTube (more in the future). Using a genuinely great tool called [yt-dlp](https://github.com/yt-dlp/yt-dlp).
The goal is a very thin wrapper around yt-dlp and be an actually useful GUI for non-programming people (i.e. video editors).

**Benefits**:

- Lightweight and easy to use
- Safe and Private (I don't store data, even if you download sus videos).
- No ads (other services have annoying ads, this doesn't)
- Performant by default (Built with Rust + SolidJS, though it doesn't matter that much)
- Fastest downloads you'll ever get (It's just your computer your internet, no middle-man server to proxy with, so it's faster).

**Technologies Used**:

- Tauri (Rust)
- SolidJS
- Vike (Filesystem Routing) - `vite build` will build static.
- TailwindCSS
- Extra things for DevX:
  - Prettier + prettier-plugin-tailwindcss
  - Bun - Faster package manager 🥳

## Getting Started

- `brew install ffmpeg`
- `bun install` - installs all dependencies
- `bun tauri dev` - start the server

## Building for Production

- `bun tauri build`.
  - Installer is saved here: `./src-tauri/target/release/bundle/dmg/tauri-solid_0.0.0_aarch64.dmg`
  - Binary is saved here: `./src-tauri/target/release/bundle/macos/tauri-solid.app/Contents/MacOS/tauri-solid` (You can run this without installing with `bun preview-mac`)
