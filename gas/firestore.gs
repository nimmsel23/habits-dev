// ================================================================
// FIRESTORE REST — Habits Push Reminders GAS
// ================================================================
// Auth via ScriptApp.getOAuthToken() (same Google account as Firebase project)
// 1:1 übernommen aus fuel-dev/gas/firestore.gs — generischer REST-Wrapper,
// keine Domain-Logik hier.

function fsBase_() {
  const project = getProp_(PROP.FIREBASE_PROJECT);
  return 'https://firestore.googleapis.com/v1/projects/' + project + '/databases/(default)/documents';
}

function fsHeaders_() {
  return {
    'Authorization': 'Bearer ' + ScriptApp.getOAuthToken(),
    'Content-Type': 'application/json',
  };
}

function fsGet_(path) {
  const res = UrlFetchApp.fetch(fsBase_() + '/' + path, {
    method: 'get',
    headers: fsHeaders_(),
    muteHttpExceptions: true,
  });
  const code = res.getResponseCode();
  if (code === 404) return null;
  if (code !== 200) throw new Error('Firestore GET ' + path + ' → ' + code + ': ' + res.getContentText());
  return JSON.parse(res.getContentText());
}

function fsList_(collectionPath) {
  const docs = [];
  let pageToken = null;
  do {
    let url = fsBase_() + '/' + collectionPath + '?pageSize=300';
    if (pageToken) url += '&pageToken=' + encodeURIComponent(pageToken);
    const res = UrlFetchApp.fetch(url, { method: 'get', headers: fsHeaders_(), muteHttpExceptions: true });
    const code = res.getResponseCode();
    if (code !== 200) break;
    const data = JSON.parse(res.getContentText());
    if (data.documents) docs.push(...data.documents);
    pageToken = data.nextPageToken || null;
  } while (pageToken);
  return docs;
}

// Listet Dokument-IDs einer Top-Level-Collection, inkl. "missing" Docs
// (Docs die nur als Parent von Subcollections existieren, z.B. fitness/{uid}
// ohne eigene Felder). Nötig um alle User-UIDs zu finden, nicht nur einen.
function fsListIds_(collectionPath) {
  const ids = [];
  let pageToken = null;
  do {
    let url = fsBase_() + '/' + collectionPath + '?pageSize=300&showMissing=true&mask.fieldPaths=_none_';
    if (pageToken) url += '&pageToken=' + encodeURIComponent(pageToken);
    const res = UrlFetchApp.fetch(url, { method: 'get', headers: fsHeaders_(), muteHttpExceptions: true });
    const code = res.getResponseCode();
    if (code !== 200) break;
    const data = JSON.parse(res.getContentText());
    (data.documents || []).forEach((d) => ids.push(d.name.split('/').pop()));
    pageToken = data.nextPageToken || null;
  } while (pageToken);
  return ids;
}

// ── Value helpers (Firestore wire format) ──────────────────────────────────────

function fsRead_(field) {
  if (field == null) return null;
  if ('nullValue' in field) return null;
  if ('booleanValue' in field) return field.booleanValue;
  if ('integerValue' in field) return Number(field.integerValue);
  if ('doubleValue' in field) return field.doubleValue;
  if ('stringValue' in field) return field.stringValue;
  if ('arrayValue' in field) return (field.arrayValue.values || []).map(fsRead_);
  if ('mapValue' in field) return Object.fromEntries(Object.entries(field.mapValue.fields || {}).map(([k, v]) => [k, fsRead_(v)]));
  return null;
}

function fsReadDoc_(doc) {
  if (!doc || !doc.fields) return null;
  return Object.fromEntries(Object.entries(doc.fields).map(([k, v]) => [k, fsRead_(v)]));
}
