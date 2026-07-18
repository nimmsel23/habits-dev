// ================================================================
// CONFIG — Habits Push Reminders GAS
// ================================================================

const PROP = {
  FIREBASE_PROJECT: 'FIREBASE_PROJECT',
};

const DEFAULTS = {
  FIREBASE_PROJECT: 'fitness-aos',
};

function getProp_(key) {
  const val = PropertiesService.getScriptProperties().getProperty(key);
  return val != null ? val : (DEFAULTS[key] || null);
}

function setupProperties() {
  Logger.log('Script Properties setzen via: File → Project properties → Script properties');
  Logger.log('Optional (hat Default): FIREBASE_PROJECT (Default: fitness-aos)');
}
