use tauri::AppHandle;
use tauri_plugin_notification::NotificationExt;

// 显示系统通知的函数
#[tauri::command]
pub fn send_water_reminder(app_handle: AppHandle, title: &str, body: &str) {
  app_handle
    .notification()
    .builder()
    .title(title)
    .body(body)
    .show()
    .expect("failed to show notification");
}