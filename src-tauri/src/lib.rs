use chrono::Timelike;
// 导入命令模块
mod commands;
use commands::send_water_reminder;
use tauri_plugin_notification::NotificationExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_global_shortcut::Builder::new().build())
     .plugin(tauri_plugin_notification::init())
    .setup(|app| {
      // 注册全局快捷键
      let app_handle = app.handle();
      // 在JavaScript端注册全局快捷键

      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      // 启动提醒线程
        let app_handle = app.handle().clone();
        std::thread::spawn(move || {
          // 每分钟检查一次是否到整点
          loop {
            let now = chrono::Local::now();
            if now.minute() == 0 && now.second() == 0 {
              send_water_reminder(app_handle.clone(), "喝水提醒", "现在是整点，该喝水了！");
            }
            std::thread::sleep(std::time::Duration::from_secs(60));
          }
        });

      Ok(())
    })
    .invoke_handler(tauri::generate_handler![send_water_reminder])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

// 命令函数已移至commands.rs模块中
