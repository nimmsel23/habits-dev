// ================================================================
// TRIGGER SETUP
// ================================================================

function createReminderTrigger() {
  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === 'triggerPushReminders')
    .forEach((t) => ScriptApp.deleteTrigger(t));

  // Alle 15 Minuten — reminderTime ist ein HH:MM-String, 15min-Raster
  // reicht um jede volle Viertelstunde zu treffen.
  ScriptApp.newTrigger('triggerPushReminders')
    .timeBased()
    .everyMinutes(15)
    .create();

  Logger.log('Trigger für triggerPushReminders gesetzt (alle 15 Minuten).');
}

function deleteTriggers() {
  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === 'triggerPushReminders')
    .forEach((t) => ScriptApp.deleteTrigger(t));
  Logger.log('Trigger gelöscht.');
}

function listTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  Logger.log('Aktive Trigger: ' + triggers.length);
  triggers.forEach((t) => Logger.log('  • ' + t.getHandlerFunction() + ' [' + t.getTriggerSource() + ']'));
}
