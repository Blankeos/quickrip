// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust123!", name)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            download_ytdlp,
            get_ytdlp_path,
            download_video
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

use reqwest;
use std::env;
use std::fs;
use tauri;

#[tauri::command]
async fn download_ytdlp() -> Result<String, String> {
    let base_url = "https://github.com/yt-dlp/yt-dlp/releases/latest/download";

    // Determine OS and set appropriate filename
    let (filename, url) = match env::consts::OS {
        "windows" => ("yt-dlp.exe", format!("{}/yt-dlp.exe", base_url)),
        "macos" => ("yt-dlp", format!("{}/yt-dlp_macos", base_url)),
        "linux" => ("yt-dlp", format!("{}/yt-dlp", base_url)),
        _ => return Err("Unsupported operating system".to_string()),
    };

    // Get the current executable's directory
    let current_exe_path = env::current_exe().map_err(|e| e.to_string())?;
    let current_dir = current_exe_path
        .parent()
        .ok_or("Cannot determine current directory")?;

    // Create the full path for saving the file
    let save_path = current_dir.join(filename);

    // Download the file
    let response = reqwest::get(&url).await.map_err(|e| e.to_string())?;

    let bytes = response.bytes().await.map_err(|e| e.to_string())?;

    // Save the file
    fs::write(&save_path, bytes).map_err(|e| e.to_string())?;

    // Make the file executable on Unix-like systems
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let mut perms = fs::metadata(&save_path)
            .map_err(|e| e.to_string())?
            .permissions();
        perms.set_mode(0o755);
        fs::set_permissions(&save_path, perms).map_err(|e| e.to_string())?;
    }

    println!("Successfully downloaded {} to {:?}", filename, save_path);

    Ok(format!(
        "Successfully downloaded {} to {:?}",
        filename, save_path
    ))
}

#[tauri::command]
fn get_ytdlp_path() -> Option<String> {
    let filename = match env::consts::OS {
        "windows" => "yt-dlp.exe",
        "macos" => "yt-dlp",
        "linux" => "yt-dlp",
        _ => return None,
    };

    // Get the current executable's directory
    let current_exe_path = match env::current_exe().map_err(|e| e.to_string()) {
        Ok(curr_path) => curr_path,
        Err(_) => return None,
    };

    let current_dir = match current_exe_path.parent() {
        Some(p) => p,
        None => return None,
    };

    let save_path = current_dir.join(filename);

    let save_path_string = match save_path.as_os_str().to_str() {
        Some(s) => s.to_owned(),
        None => return None,
    };

    if !std::path::Path::new(&save_path_string).exists() {
        return None;
    }

    return Some(save_path_string);
}

use std::process::Command;

#[tauri::command]
async fn download_video(url: &str) -> Result<String, String> {
    let ytdlp_path = get_ytdlp_path().ok_or("yt-dlp not found")?;

    if url.is_empty() {
        return Err("URL is empty".to_string());
    }
    println!("{:#?} is downloading...", url);

    let output = Command::new(ytdlp_path)
        .args(["-x", "--audio-format", "mp3", url])
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok("Download completed successfully".to_string())
    } else {
        let error = String::from_utf8_lossy(&output.stderr);
        Err(format!("Download failed: {}", error))
    }
}
