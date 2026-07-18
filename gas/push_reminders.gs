// ================================================================
// PUSH REMINDERS (HABITS) — Habits GAS
// ================================================================
// Analog zu fuel-dev/gas/push_reminders.gs (Supplements), aber gegen das
// Habits-Datenmodell: fitness/{uid}/habits + fitness/{uid}/habitRecords.
// Habits haben (anders als Supplements) kein eigenes schedule-Feld — jeder
// Habit gilt als täglich fällig. Reminder-Zeit ist ein einzelner
// HH:MM-String pro User (fitness/{uid}/settings/push.reminderTime), keine
// vier Tageszeit-Slots wie bei Fuel.

// Einstiegspunkt für den Time-Driven Trigger (alle 15 Minuten)
function triggerPushReminders() {
  const now = new Date();
  const nowHHMM = Utilities.formatDate(now, Session.getScriptTimeZone(), 'HH:mm');

  Logger.log('Check Habit-Reminders für: ' + nowHHMM);
  checkAndSendReminders_(nowHHMM, now);
}

function checkAndSendReminders_(nowHHMM, nowObj) {
  const uids = fsListIds_('fitness');
  if (!uids || uids.length === 0) {
    Logger.log('Keine User unter fitness/ gefunden.');
    return;
  }

  uids.forEach((uid) => {
    try {
      checkRemindersForUser_(uid, nowHHMM, nowObj);
    } catch (e) {
      Logger.log('Fehler bei User ' + uid + ': ' + e.message);
    }
  });
}

function checkRemindersForUser_(uid, nowHHMM, nowObj) {
  // 1. Push-Settings laden — enabled, habit-Typ aktiv, reminderTime matched?
  const pushDoc = fsGet_('fitness/' + uid + '/settings/push');
  if (!pushDoc) return;
  const push = fsReadDoc_(pushDoc);
  if (!push || !push.enabled || !push.token) return;
  if (push.types && push.types.habit === false) return;
  if (!push.reminderTime || push.reminderTime !== nowHHMM) return;

  // 2. Alle Habits des Users laden
  const habitDocs = fsList_('fitness/' + uid + '/habits');
  const habits = habitDocs
    .map((d) => ({ uuid: d.name.split('/').pop(), ...fsReadDoc_(d) }))
    .filter((h) => !h.deleted);
  if (habits.length === 0) return;

  // 3. Heutige Records laden, DONE-Habits rausfiltern
  const todayStr = Utilities.formatDate(nowObj, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const doneIds = {};
  habits.forEach((h) => {
    const recordDoc = fsGet_('fitness/' + uid + '/habitRecords/' + h.uuid + '_' + todayStr);
    if (recordDoc) {
      const record = fsReadDoc_(recordDoc);
      if (record && record.completion === 'DONE') doneIds[h.uuid] = true;
    }
  });

  const openHabits = habits.filter((h) => !doneIds[h.uuid]);
  if (openHabits.length === 0) {
    Logger.log(uid + ' -> Alle Habits heute erledigt.');
    return;
  }

  const names = openHabits.map((h) => h.name).join(', ');
  Logger.log(uid + ' -> Offen: ' + names);
  sendFcmNotification_(push.token, 'Habit-Reminder', 'Noch offen: ' + names);
}

function sendFcmNotification_(fcmToken, title, body) {
  const project = getProp_(PROP.FIREBASE_PROJECT);
  const fcmUrl = 'https://fcm.googleapis.com/v1/projects/' + project + '/messages:send';

  const payload = {
    message: {
      token: fcmToken,
      notification: {
        title: title,
        body: body,
      },
      webpush: {
        fcm_options: {
          link: '/habits',
        },
      },
    },
  };

  const res = UrlFetchApp.fetch(fcmUrl, {
    method: 'post',
    headers: {
      'Authorization': 'Bearer ' + ScriptApp.getOAuthToken(),
      'Content-Type': 'application/json',
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });

  if (res.getResponseCode() !== 200) {
    Logger.log('FCM Sende-Fehler: ' + res.getContentText());
  } else {
    Logger.log('Push gesendet an Token: ' + fcmToken.substring(0, 10) + '...');
  }
}

// Manueller Testlauf für einen bestimmten User (im GAS-Editor ausführen)
function testCheckForUid(uid) {
  const now = new Date();
  const nowHHMM = Utilities.formatDate(now, Session.getScriptTimeZone(), 'HH:mm');
  checkRemindersForUser_(uid, nowHHMM, now);
}
