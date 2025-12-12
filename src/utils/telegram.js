// src/utils/telegram.js
export const TelegramWebApp = window.Telegram?.WebApp;

export const initTelegramWebApp = () => {
  if (TelegramWebApp) {
    TelegramWebApp.ready();
    TelegramWebApp.expand();
    
    // Apply Telegram theme
    document.documentElement.style.setProperty(
      '--tg-theme-bg-color', 
      TelegramWebApp.themeParams.bg_color
    );
  }
};

export const getTelegramUser = () => {
  if (TelegramWebApp) {
    return TelegramWebApp.initDataUnsafe.user;
  }
  return null;
};

export const closeTelegramWebApp = () => {
  if (TelegramWebApp) {
    TelegramWebApp.close();
  }
};