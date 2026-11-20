/* South Ribble Futsal v4: player view (index.html) and coach view (admin.html). */
(function () {
'use strict';
var MODE = document.body.dataset.mode === 'admin' ? 'admin' : 'player';
var CFG = window.FUTSAL_CONFIG || {};
var TEAM = CFG.TEAM_NAME || 'Futsal Squad';
var DEFAULT_SKILLS = ['Dribbling', 'Passing', 'Shooting', 'First touch', 'Defending', 'Fitness'];
var POSITIONS = ['Goalkeeper', 'Fixo', 'Ala', 'Pivot'];
var DOW_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
var C = { fresh: '#30D158', due: '#FF9F0A', overdue: '#FF453A', never: '#FF453A' };
var LEVEL_LABEL = { fresh: 'Fresh', due: 'Due soon', overdue: 'Overdue', never: 'Not trained yet' };
var W = { fresh: 0, due: 1, overdue: 2, never: 2 };
var ANSWER = { going: 'Yes', maybe: 'Maybe', out: 'No' };
var STATUS_COL = { going: 'var(--green)', maybe: 'var(--orange)', out: 'var(--red)' };
var KIND_LABEL = { warmup: 'Warm-up', drill: 'Drill', game: 'Game' };
var I = {
  home: 'M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5.5v-6h-5v6H4a1 1 0 0 1-1-1z',
  calendar: 'M4 5.5h16v15H4zM4 10h16M8.5 3v4M15.5 3v4',
  training: 'M9 3h6v3H9zM7 4.5H5V21h14V4.5h-2M8.5 11h7M8.5 15h4.5',
  matches: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7l3.5 2.5-1.3 4h-4.4l-1.3-4zM12 3v4M20.5 9.5h-5M3.5 9.5h5M7 19l2.8-5.5M17 19l-2.8-5.5',
  drills: 'M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01',
  me: 'M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM4 21a8 8 0 0 1 16 0',
  coach: 'M3 13h4v8H3zM10 8h4v13h-4zM17 3h4v18h-4z',
  squad: 'M16 20v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 20v-1a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  plus: 'M12 5v14M5 12h14',
  chev: 'M9 6l6 6-6 6',
  chevL: 'M15 6l-6 6 6 6',
  up: 'M6 15l6-6 6 6',
  down: 'M6 9l6 6 6-6',
  x: 'M6 6l12 12M18 6L6 18',
  check: 'M5 12.5l4.5 4.5L19 7',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
  share: 'M12 3v12M8 7l4-4 4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7',
  edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  invite: 'M15 19a6 6 0 0 0-12 0M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M19 8v6M16 11h6',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM4 12h2M18 12h2M12 4v2M12 18v2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M6.3 17.7l1.4-1.4M16.3 7.7l1.4-1.4',
  out: 'M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11',
  play: 'M8 5l11 7-11 7z'
};
var TABS = MODE === 'admin'
  ? [['coach', 'Overview', 'coach'], ['calendar', 'Calendar', 'calendar'], ['training', 'Training', 'training'], ['matches', 'Matches', 'matches'], ['drills', 'Drills', 'drills'], ['players', 'Squad', 'squad', 1]]
  : [['home', 'Home', 'home'], ['calendar', 'Availability', 'calendar'], ['training', 'Training', 'training'], ['matches', 'Matches', 'matches'], ['stats', 'Me', 'me']];
var ROUTES = TABS.map(function (t) { return t[0]; }).concat(['stats', 'players']);
var COURT = '<svg class="lines" viewBox="0 0 400 220" preserveAspectRatio="none" aria-hidden="true" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="1.5"><rect x="12" y="12" width="376" height="196" rx="3"/><line x1="200" y1="12" x2="200" y2="208"/><circle cx="200" cy="110" r="34"/><path d="M12 50a60 60 0 0 1 0 120M388 50a60 60 0 0 0 0 120"/></svg>';

var sb = null;
var S = {
  phase: 'loading', me: null, team: null, email: '', admins: [], invites: [],
  players: {}, avail: {}, days: {}, events: {}, drills: {}, config: null,
  tab: TABS[0][0], selTrain: null, calMonth: null, calDay: null, statPid: null, drillFilter: 'all', libQ: '', pickQ: '', pickSkill: 'all', scope: 'session',
  open: -1, work: {}, mode: {}, sheet: null, busy: false, errMsg: '', loginMode: 'in', pop: null
};

/* ---------- helpers ---------- */
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function pad(n) { return (n < 10 ? '0' : '') + n; }
function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function todayStr() { return ymd(new Date()); }
function parseD(s) { var p = String(s || '').split('-'); return new Date(+p[0], (+p[1] || 1) - 1, +p[2] || 1); }
function fmtD(s) { return s ? parseD(s).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : ''; }
function fmtCourt(s) { if (!s) return ''; var d = parseD(s); return d.toLocaleDateString('en-GB', { weekday: 'long' }) + ' ' + d.getDate() + ' ' + d.toLocaleDateString('en-GB', { month: 'short' }); }
function fmtLong(s) { return s ? parseD(s).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) : ''; }
function addDays(s, n) { var d = parseD(s); d.setDate(d.getDate() + n); return ymd(d); }
function daysSince(s) { return Math.round((parseD(todayStr()) - parseD(s)) / 86400000); }
function daysUntil(s) { return -daysSince(s); }
function fmtTime(t) { if (!t) return ''; var p = String(t).split(':'); var h = +p[0], m = p[1] || '00'; var suf = h >= 12 ? 'pm' : 'am'; var h12 = h % 12 || 12; return h12 + (m !== '00' ? ':' + m : '') + suf; }
function timeRange(e) {
  if (!e.time) return '';
  if (!e.endTime) return fmtTime(e.time);
  var a = fmtTime(e.time), b = fmtTime(e.endTime);
  if (a.slice(-2) === b.slice(-2)) a = a.slice(0, -2);
  return a + '\u2013' + b;
}
function addMins(t, m) { var p = String(t || '19:00').split(':'); var x = (+p[0]) * 60 + (+p[1] || 0) + m; return pad(Math.floor(x / 60) % 24) + ':' + pad(x % 60); }
function svg(d, size, sw) { return '<svg width="' + (size || 24) + '" height="' + (size || 24) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (sw || 1.8) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"></path></svg>'; }
function ic(n, size, sw) { return svg(I[n], size || 20, sw || 2); }
function chev() { return '<span class="chev">' + ic('chev', 16, 2.4) + '</span>'; }
function uuid() { if (window.crypto && crypto.randomUUID) return crypto.randomUUID(); var b = crypto.getRandomValues(new Uint8Array(16)); b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128; var h = Array.prototype.map.call(b, function (x) { return (x + 256).toString(16).slice(1); }).join(''); return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20); }
function initials(n) { var p = String(n || '?').trim().split(/\s+/); return ((p[0] || '?')[0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase(); }
function first(n) { return String(n || '').split(' ')[0]; }
function store(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }
function cfg() { var c = S.config || {}; return { skills: (c.skills && c.skills.length) ? c.skills : DEFAULT_SKILLS, fresh: +c.fresh || 7, overdue: +c.overdue || 14, sessionMins: +c.sessionMins || 90, teamToken: c.teamToken || null, seasonEnd: c.seasonEnd || '2027-06-30', openAccess: c.openAccess !== false }; }
function isCoach() { return MODE === 'admin'; }
function haptic() { try { if (navigator.vibrate) navigator.vibrate(8); } catch (e) {} }
function players() { return Object.keys(S.players).map(function (id) { var p = S.players[id]; return { id: id, name: p.name || 'Unnamed', pos: p.pos || '' }; }).sort(function (a, b) { return a.name.localeCompare(b.name); }); }
function eventsArr() { return Object.keys(S.events).map(function (id) { return Object.assign({ id: id }, S.events[id]); }); }
function byTime(a, b) { return (a.date + a.time).localeCompare(b.date + b.time); }
function openEvents(kind) { var t = todayStr(); return eventsArr().filter(function (e) { return !e.done && (!kind || e.kind === kind) && e.date >= t; }).sort(byTime); }
function overdueOpen(kind) { var t = todayStr(); return eventsArr().filter(function (e) { return !e.done && (!kind || e.kind === kind) && e.date < t; }).sort(byTime); }
function pastEvents(kind) { return eventsArr().filter(function (e) { return e.done && (!kind || e.kind === kind); }).sort(function (a, b) { return byTime(b, a); }); }
function evById(id) { return id && S.events[id] ? Object.assign({ id: id }, S.events[id]) : null; }
function selTraining() { var e = evById(S.selTrain); if (e && !e.done && e.kind === 'training') return e; var o = overdueOpen('training'); if (o.length) return o[o.length - 1]; return openEvents('training')[0] || null; }
function nextEvent() { var o = overdueOpen(); return o[o.length - 1] || openEvents()[0] || null; }
function evTitle(e) { return e.kind === 'match' ? 'vs ' + (e.opponent || 'TBC') : (e.title || 'Training'); }
function evWhere(e) { return [timeRange(e), e.venue].filter(Boolean).join(', '); }
function rsvp(pid, e) { var a = S.avail[pid]; return (e && a && a[e.id]) || null; }
function idsWith(e, st) { return e ? players().filter(function (p) { return rsvp(p.id, e) === st; }).map(function (p) { return p.id; }) : []; }
function goingIds(e) { return idsWith(e, 'going'); }
function openOn(day) { return eventsArr().filter(function (e) { return e.date === day && !e.done; }).sort(byTime); }
function dayStatus(pid, day) {
  var ev = openOn(day);
  for (var i = 0; i < ev.length; i++) { var r = rsvp(pid, ev[i]); if (r) return r; }
  var d = S.days[pid]; return (d && d[day]) || null;
}
function nextStatus(s) { return s == null ? 'going' : s === 'going' ? 'maybe' : s === 'maybe' ? 'out' : null; }
function siteBase() { return location.href.split('#')[0].split('?')[0].replace(/admin(\.html)?$/, ''); }
function teamLink() { if (cfg().openAccess) return siteBase(); var t = cfg().teamToken; return t ? siteBase() + '?t=' + t : ''; }

/* ---------- stats + recommendations ---------- */
function computeStats() {
  var res = {};
  eventsArr().forEach(function (s) {
    if (!s.done || s.kind === 'match') return;
    var dids = (s.drillsDone && s.drillsDone.length) ? s.drillsDone : (s.plan || []);
    var sk = {}; dids.forEach(function (d) { var dr = S.drills[d]; if (dr) (dr.skills || []).forEach(function (k) { sk[k] = 1; }); });
    (s.attended || []).forEach(function (pid) {
      res[pid] = res[pid] || {};
      Object.keys(sk).forEach(function (k) { if (!res[pid][k] || res[pid][k] < s.date) res[pid][k] = s.date; });
    });
  });
  return res;
}
function skillState(pid, skill, stats) {
  var c = cfg(); var d = stats[pid] && stats[pid][skill];
  if (!d) return { level: 'never', days: null, date: null };
  var n = Math.max(0, daysSince(d));
  return { level: n <= c.fresh ? 'fresh' : (n <= c.overdue ? 'due' : 'overdue'), days: n, date: d };
}
function gaps(pids, stats) {
  return cfg().skills.map(function (k) {
    var need = 0, over = 0, w = 0;
    pids.forEach(function (pid) { var st = skillState(pid, k, stats); if (st.level !== 'fresh') need++; if (st.level === 'overdue' || st.level === 'never') over++; w += W[st.level]; });
    return { skill: k, need: need, over: over, weight: w };
  }).sort(function (a, b) { return b.weight - a.weight || b.need - a.need; });
}
function weights(pids, stats) { var wm = {}; gaps(pids, stats).forEach(function (x) { wm[x.skill] = x.weight; }); return wm; }
function drillScore(d, wm) { return (d.skills || []).reduce(function (a, k) { return a + (wm[k] || 0); }, 0); }
function drillsArr() { return Object.keys(S.drills).map(function (id) { return Object.assign({ id: id }, S.drills[id]); }); }
function basisFor(e) { var g = goingIds(e); return g.length ? g : players().map(function (p) { return p.id; }); }
function recommend(mins, pids, stats) {
  var wm = weights(pids, stats);
  var all = drillsArr(); if (!all.length) return [];
  var pick = []; var left = mins;
  function best(kind, limit) {
    return all.filter(function (d) { return (d.kind || 'drill') === kind && pick.indexOf(d.id) < 0 && (+d.mins || 0) <= limit; })
      .sort(function (a, b) { return drillScore(b, wm) - drillScore(a, wm) || (+a.mins) - (+b.mins); })[0];
  }
  var warm = best('warmup', left); if (warm) { pick.push(warm.id); left -= (+warm.mins || 0); }
  var game = best('game', left); if (game) left -= (+game.mins || 0);
  for (var i = 0; i < 12; i++) {
    var d = best('drill', left); if (!d) break;
    if (drillScore(d, wm) <= 0 && i >= 2) break;
    pick.push(d.id); left -= (+d.mins || 0);
    (d.skills || []).forEach(function (k) { wm[k] = (wm[k] || 0) * 0.4; });
  }
  if (game) pick.push(game.id);
  return pick;
}
function trainMode(s) { return S.mode[s.id] || (s.custom ? 'own' : 'auto'); }
function planFor(e, stats) {
  if (isCoach() && trainMode(e) === 'own') {
    if (S.work[e.id]) return { ids: S.work[e.id], saved: false, changed: true, own: true };
    return { ids: e.custom ? (e.plan || []).slice() : [], saved: !!e.custom && (e.plan || []).length > 0, changed: false, own: true };
  }
  if (S.work[e.id]) return { ids: S.work[e.id], saved: false, changed: true };
  if (e.plan && e.plan.length && !(isCoach() && e.custom)) return { ids: e.plan, saved: true, changed: false };
  return { ids: recommend(+e.mins || cfg().sessionMins, basisFor(e), stats), saved: false, changed: false };
}
function planMins(ids) { return ids.reduce(function (a, id) { return a + (+((S.drills[id] || {}).mins) || 0); }, 0); }

/* ---------- data ---------- */
function must(r) { if (r && r.error) throw r.error; return r ? r.data : null; }
function ingest(b) {
  S.players = {}; (b.players || []).forEach(function (p) { S.players[p.id] = { name: p.name, pos: p.pos || '' }; });
  S.events = {}; (b.sessions || []).forEach(function (s) {
    S.events[s.id] = { kind: s.kind || 'training', title: s.title, date: String(s.date).slice(0, 10), time: s.time || '', endTime: s.end_time || '', venue: s.venue || '', mins: s.mins, plan: s.plan || [], custom: !!s.custom, done: !!s.done, attended: s.attended || [], drillsDone: s.drills_done || [],
      opponent: s.opponent || '', homeAway: s.home_away || '', competition: s.competition || '', scoreFor: s.score_for, scoreAgainst: s.score_against };
  });
  S.avail = {}; (b.availability || []).forEach(function (a) { (S.avail[a.player_id] = S.avail[a.player_id] || {})[a.session_id] = a.status; });
  S.days = {}; (b.days || []).forEach(function (a) { (S.days[a.player_id] = S.days[a.player_id] || {})[String(a.day).slice(0, 10)] = a.status; });
  S.drills = {}; (b.drills || []).forEach(function (d) { S.drills[d.id] = { name: d.name, mins: d.mins, kind: d.kind, skills: d.skills || [], setup: d.setup || '', cue: d.cue || '', link: d.link || '', own: !!d.own }; });
  var st = b.settings;
  S.config = st ? { skills: st.skills, fresh: st.fresh, overdue: st.overdue, sessionMins: st.session_mins, teamToken: st.team_token || null, seasonEnd: st.season_end ? String(st.season_end).slice(0, 10) : null, openAccess: st.open_access !== false } : null;
}
async function reload() {
  if (MODE === 'admin') {
    var r = await Promise.all([
      sb.from('players').select('*'),
      sb.from('sessions').select('*'),
      sb.from('availability').select('player_id,session_id,status'),
      sb.from('drills').select('*'),
      sb.from('settings').select('*').eq('id', 1).maybeSingle(),
      sb.rpc('list_admins'),
      sb.from('day_avail').select('player_id,day,status').gte('day', addDays(todayStr(), -7)),
      sb.from('coach_invites').select('email')
    ]);
    ingest({ players: must(r[0]), sessions: must(r[1]), availability: must(r[2]), drills: must(r[3]), settings: must(r[4]), days: (r[6] && !r[6].error && r[6].data) || [] });
    S.admins = (r[5] && !r[5].error && r[5].data) ? r[5].data.map(function (x) { return x.email; }) : [];
    S.invites = (r[7] && !r[7].error && r[7].data) ? r[7].data.map(function (x) { return x.email; }) : [];
  } else {
    var b = must(await sb.rpc('team_bundle', { p_team: S.team }));
    if (!b && S.team) { store('futsal_team', null); S.team = null; b = must(await sb.rpc('team_bundle', { p_team: null })); }
    if (!b) { S.phase = 'nolink'; S.errMsg = 'The squad page is locked. Paste the team link your coach sent you.'; render(true); return; }
    ingest(b);
    if (S.me && !S.players[S.me]) { S.me = null; store('futsal_me', null); }
  }
  S.phase = 'ready'; render();
}
function toast(msg) { var t = document.getElementById('toast'); t.innerHTML = '<div class="toast">' + esc(msg) + '</div>'; clearTimeout(toast._t); toast._t = setTimeout(function () { t.innerHTML = ''; }, 2800); }
async function run(fn, okMsg) {
  if (S.busy) return false;
  S.busy = true;
  try { await fn(); if (okMsg) toast(okMsg); S.busy = false; await reload(); return true; }
  catch (e) { S.busy = false; toast((e && e.message) ? e.message : 'Couldn\u2019t save. Check your connection and try again.'); try { await reload(); } catch (e2) {} return false; }
}
async function saveAnswers(pid, sids, v) {
  sids.forEach(function (sid) { (S.avail[pid] = S.avail[pid] || {})[sid] = v; }); render(true);
  return run(async function () {
    if (MODE === 'admin') {
      return sb.from('availability').upsert(sids.map(function (sid) { return { player_id: pid, session_id: sid, status: v, updated_at: new Date().toISOString() }; })).then(must);
    }
    for (var i = 0; i < sids.length; i++) must(await sb.rpc('team_rsvp', { p_team: S.team, p_player: pid, p_session: sids[i], p_status: v }));
  });
}

/* day answers: saved shortly after the last tap so quick taps feel instant */
var saveQ = {}; var pending = 0;
function setDay(pid, day, v) {
  S.days[pid] = S.days[pid] || {};
  if (v) S.days[pid][day] = v; else delete S.days[pid][day];
  openOn(day).forEach(function (e) { S.avail[pid] = S.avail[pid] || {}; if (v) S.avail[pid][e.id] = v; else delete S.avail[pid][e.id]; });
  var key = pid + '|' + day;
  if (saveQ[key]) clearTimeout(saveQ[key]); else pending++;
  saveQ[key] = setTimeout(function () { flushOne(key); }, 600);
}
function flushOne(key) {
  if (!saveQ[key]) return;
  clearTimeout(saveQ[key]); delete saveQ[key];
  var p = key.split('|'); var pid = p[0], day = p[1];
  var v = (S.days[pid] && S.days[pid][day]) || null;
  pushDay(pid, day, v).catch(function (err) { toast((err && err.message) || 'Couldn\u2019t save that answer. Check your connection.'); reload().catch(function () {}); })
    .then(function () { pending = Math.max(0, pending - 1); });
}
function flushAll() { Object.keys(saveQ).forEach(flushOne); }
async function pushDay(pid, day, v) {
  if (MODE === 'player') { must(await sb.rpc('team_day', { p_team: S.team, p_player: pid, p_day: day, p_status: v })); return; }
  var sids = openOn(day).map(function (e) { return e.id; });
  if (!v) {
    must(await sb.from('day_avail').delete().eq('player_id', pid).eq('day', day));
    for (var i = 0; i < sids.length; i++) must(await sb.from('availability').delete().eq('player_id', pid).eq('session_id', sids[i]));
    return;
  }
  var now = new Date().toISOString();
  must(await sb.from('day_avail').upsert({ player_id: pid, day: day, status: v, updated_at: now }));
  if (sids.length) must(await sb.from('availability').upsert(sids.map(function (sid) { return { player_id: pid, session_id: sid, status: v, updated_at: now }; })));
}

/* ---------- shared pieces ---------- */
function hdr(title, sub, right) { return '<header class="hdr"><div class="col grow">' + (sub ? '<span class="hsub">' + sub + '</span>' : '') + '<h1 class="lt">' + title + '</h1></div>' + (right || '') + '</header>'; }
function cols(a, b) { return '<div class="cols"><div class="colA">' + a + '</div><div class="colB">' + b + '</div></div>'; }
function sec(title, inner, right, note) { return '<section class="sec">' + (title ? '<div class="sec-h"><h2>' + title + '</h2>' + (right || '') + '</div>' : '') + inner + (note ? '<p class="note">' + note + '</p>' : '') + '</section>'; }
function emptyBox(text, extra) { return '<div class="group empty"><span>' + text + '</span>' + (extra || '') + '</div>'; }
function addBtn(t, label, extra) { return '<button class="ibtn blue" data-a="sheet" data-t="' + t + '"' + (extra || '') + ' aria-label="' + esc(label) + '">' + ic('plus', 20, 2.4) + '</button>'; }
function ansSeg(pid, e, cls) {
  var cur = rsvp(pid, e);
  return '<div class="seg ans' + (cls ? ' ' + cls : '') + '" role="group" aria-label="Can you make ' + esc(evTitle(e) + ', ' + fmtD(e.date)) + '?">' + [['going', 'Yes'], ['maybe', 'Maybe'], ['out', 'No']].map(function (o) {
    return '<button type="button" data-a="rsvp" data-pid="' + esc(pid) + '" data-sid="' + esc(e.id) + '" data-v="' + o[0] + '" aria-pressed="' + (cur === o[0]) + '">' + o[1] + '</button>';
  }).join('') + '</div>';
}
function counts(e) { var c = { going: 0, maybe: 0, out: 0, none: 0 }; players().forEach(function (p) { var r = rsvp(p.id, e); c[r || 'none']++; }); return c; }
function pill(st) { return '<span class="pill ' + (st || 'none') + '">' + (st ? ANSWER[st] : 'No answer') + '</span>'; }
function stackBar(c) {
  return '<div class="sbar" role="img" aria-label="' + c.going + ' yes, ' + c.maybe + ' maybe, ' + c.out + ' no, ' + c.none + ' no answer">' +
    (c.going ? '<span style="flex:' + c.going + ';background:var(--green)"></span>' : '') + (c.maybe ? '<span style="flex:' + c.maybe + ';background:var(--orange)"></span>' : '') +
    (c.out ? '<span style="flex:' + c.out + ';background:var(--red)"></span>' : '') + (c.none ? '<span style="flex:' + c.none + ';background:var(--card3)"></span>' : '') + '</div>';
}
function dtile(e) { var d = parseD(e.date); return '<div class="dt' + (e.kind === 'match' ? ' m' : '') + '"><div class="w">' + DOW_SHORT[d.getDay()] + '</div><div class="d">' + d.getDate() + '</div></div>'; }
function result(e) {
  if (e.scoreFor == null || e.scoreAgainst == null) return { label: '\u2013', bg: 'var(--card2)', fg: 'var(--label2)', text: 'No score' };
  var f = +e.scoreFor, a = +e.scoreAgainst;
  return f > a ? { label: 'W', bg: 'var(--green)', fg: '#000', text: f + '\u2013' + a } : f < a ? { label: 'L', bg: 'var(--red)', fg: '#fff', text: f + '\u2013' + a } : { label: 'D', bg: 'var(--orange)', fg: '#000', text: f + '\u2013' + a };
}
function countdown(e) { var n = daysUntil(e.date); return n < 0 ? 'Waiting to be logged' : n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : 'In ' + n + ' days'; }
function hero(e, opts) {
  opts = opts || {};
  var m = e.kind === 'match'; var c = counts(e);
  var h = '<section class="hero' + (m ? ' match' : '') + '">' + (m ? '' : COURT) +
    '<div class="row between"><span class="k">' + esc(opts.kicker || (m ? 'Next match' : 'Next training')) + '</span><span class="k">' + esc(countdown(e)) + '</span></div>' +
    '<div class="col g4"><div class="big">' + esc(m ? evTitle(e) : fmtCourt(e.date)) + '</div><div class="meta">' + esc(m ? [fmtLong(e.date), evWhere(e)].filter(Boolean).join(', ') : (evWhere(e) || 'Time to be confirmed')) + '</div></div>';
  if (opts.answer && S.me) h += '<div class="col g8"><span class="k">Can you make it?</span>' + ansSeg(S.me, e, 'lg') + '</div>';
  h += '<div class="row between"><div class="tally"><span><b>' + c.going + '</b>yes</span><span><b>' + c.maybe + '</b>maybe</span><span><b>' + c.out + '</b>no</span></div>' +
    '<button class="btn sm" data-a="sheet" data-t="who" data-sid="' + esc(e.id) + '">' + (isCoach() ? 'Availability' : 'Who\u2019s coming') + '</button></div></section>';
  return h;
}
function drillMeta(d) { return (+d.mins || 0) + ' min \u00b7 ' + esc((d.skills || []).join(', ')); }

/* ---------- calendar ---------- */
function monthKey(s) { return String(s).slice(0, 7); }
function monthBounds() {
  var f = monthKey(todayStr()); var last = monthKey(cfg().seasonEnd);
  eventsArr().forEach(function (e) { if (!e.done && monthKey(e.date) > last) last = monthKey(e.date); });
  return { first: f, last: last < f ? f : last };
}
function shiftMonth(m, n) { var p = m.split('-'); var d = new Date(+p[0], +p[1] - 1 + n, 1); return d.getFullYear() + '-' + pad(d.getMonth() + 1); }
function calCard(m, b, cellFn) {
  var p = m.split('-'); var y = +p[0], mo = +p[1] - 1;
  var monthName = new Date(y, mo, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  var h = '<section class="calc"><div class="cal-top"><h2>' + esc(monthName) + '</h2><div class="navs"><button data-a="month" data-v="-1" aria-label="Previous month"' + (m <= b.first ? ' disabled' : '') + '>' + ic('chevL', 22, 2.4) + '</button><button data-a="month" data-v="1" aria-label="Next month"' + (m >= b.last ? ' disabled' : '') + '>' + ic('chev', 22, 2.4) + '</button></div></div>';
  h += '<div class="cal" role="grid" aria-label="' + esc(monthName) + '">' + ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(function (d) { return '<div class="dow" aria-hidden="true">' + d + '</div>'; }).join('');
  var firstDow = (new Date(y, mo, 1).getDay() + 6) % 7; var dim = new Date(y, mo + 1, 0).getDate();
  for (var i = 0; i < firstDow; i++) h += '<div></div>';
  for (var d = 1; d <= dim; d++) h += cellFn(y + '-' + pad(mo + 1) + '-' + pad(d), d);
  return h + '</div>';
}
function dayTags(day) {
  var evs = eventsArr().filter(function (e) { return e.date === day; });
  return '<span class="tg">' + evs.slice(0, 2).map(function (e) { return '<i' + (e.kind === 'match' ? ' class="m"' : '') + '></i>'; }).join('') + '</span>';
}
function viewCalendar() {
  if (!isCoach() && !S.me) return viewWho();
  var b = monthBounds(); var m = S.calMonth && S.calMonth >= b.first && S.calMonth <= b.last ? S.calMonth : b.first; S.calMonth = m;
  var today = todayStr(); var mName = new Date(+m.slice(0, 4), +m.slice(5) - 1, 1).toLocaleDateString('en-GB', { month: 'long' });
  var legend = '<div class="legend"><span><i class="dot" style="background:var(--blue)"></i>Training</span><span><i class="dot" style="background:#fff"></i>Match</span>' + (isCoach() ? '<span><b style="color:var(--green);font-size:12px">5</b>players free</span>' : '<span><i class="dot" style="background:var(--green)"></i>Yes</span><span><i class="dot" style="background:var(--orange)"></i>Maybe</span><span><i class="dot" style="background:var(--red)"></i>No</span>') + '</div>';
  if (isCoach()) {
    if (!S.calDay || monthKey(S.calDay) !== m) { var nx = openEvents().filter(function (e) { return monthKey(e.date) === m; })[0]; S.calDay = nx ? nx.date : (monthKey(today) === m ? today : m + '-01'); }
    var cal = calCard(m, b, function (ds, d) {
      var n = players().filter(function (p) { return dayStatus(p.id, ds) === 'going'; }).length;
      var cls = 'day' + (ds === today ? ' today' : '') + (ds === S.calDay ? ' sel' : '');
      return '<button class="' + cls + '" data-a="pickDay" data-day="' + ds + '" aria-label="' + esc(fmtLong(ds) + ', ' + n + ' free') + '"><span class="n">' + d + '</span>' + dayTags(ds) + '<span class="c">' + (n || '') + '</span></button>';
    }) + legend + '</section>';
    return hdr('Calendar', 'Who\u2019s free each day', addBtn('training', 'Add training', ' data-date="' + esc(S.calDay) + '"')) + cols(cal, dayPanel(S.calDay));
  }
  var me = S.me;
  var cal2 = calCard(m, b, function (ds, d) {
    var st = dayStatus(me, ds); var past = ds < today;
    var evs = eventsArr().filter(function (e) { return e.date === ds; });
    var cls = 'day' + (st ? ' ' + st : '') + (ds === today ? ' today' : '') + (past ? ' past' : '') + (S.pop === ds ? ' pop' : '');
    var label = fmtLong(ds) + (evs.length ? ', ' + evs.map(evTitle).join(' and ') : '') + ': ' + (st ? ANSWER[st] : 'no answer') + '. Tap to change.';
    return '<button class="' + cls + '" data-a="cycleDay" data-day="' + ds + '" aria-label="' + esc(label) + '"' + (past ? ' disabled' : '') + '><span class="n">' + d + '</span>' + dayTags(ds) + '</button>';
  }) + legend + '</section>';
  var hint = '<div class="hint"><span class="seqs"><i style="background:var(--green)"></i><i style="background:var(--orange)"></i><i style="background:var(--red)"></i></span><span>Tap a day once for <b style="color:var(--label)">yes</b>, twice for <b style="color:var(--label)">maybe</b>, three times for <b style="color:var(--label)">no</b>. Tap again to clear.</span></div>';
  var evs = openEvents().filter(function (e) { return monthKey(e.date) === m; });
  var todo = evs.filter(function (e) { return e.kind === 'training' && !dayStatus(me, e.date); });
  var right = '';
  if (evs.length) {
    right = sec(esc(mName) + ' sessions', '<div class="group">' + evs.map(function (e) {
      var st = dayStatus(me, e.date);
      return '<button class="cell" data-a="cycleDay" data-day="' + esc(e.date) + '">' + dtile(e) + '<span class="col grow g4"><span class="t1">' + esc(evTitle(e)) + '</span><span class="t2">' + esc(evWhere(e) || fmtD(e.date)) + '</span></span>' + pill(st) + '</button>';
    }).join('') + '</div>', todo.length ? '<button class="btn sm tint" data-a="allyes" data-days="' + esc(todo.map(function (e) { return e.date; }).join(',')) + '">Yes to all ' + todo.length + '</button>' : '<span class="fn">All answered</span>', 'Tap a session to change your answer, the same as on the calendar.');
  } else right = emptyBox('No sessions in ' + esc(mName) + '. You can still mark the days you\u2019re free.');
  var unanswered = openEvents().filter(function (e) { return !dayStatus(me, e.date); }).length;
  return hdr('Availability', unanswered ? plural(unanswered, 'session') + ' to answer' : 'All sessions answered') + cols(hint + cal2, right);
}
function dayPanel(day) {
  var evs = eventsArr().filter(function (e) { return e.date === day; }).sort(byTime);
  var g = { going: [], maybe: [], out: [], none: [] };
  players().forEach(function (p) { g[dayStatus(p.id, day) || 'none'].push(p); });
  var h = '<section class="sec"><div class="sec-h"><h2>' + esc(fmtLong(day)) + '</h2></div>';
  if (evs.length) h += '<div class="group">' + evs.map(function (e) {
    return '<button class="cell" data-a="gotoEv" data-sid="' + esc(e.id) + '">' + dtile(e) + '<span class="col grow g4"><span class="t1">' + esc(evTitle(e)) + '</span><span class="t2">' + esc(evWhere(e) || 'Time to be confirmed') + '</span></span>' + (e.done ? '<span class="pill none">Done</span>' : '') + chev() + '</button>';
  }).join('') + '</div>';
  else h += '<div class="btns"><button class="btn tint" data-a="sheet" data-t="training" data-date="' + esc(day) + '">Add training</button><button class="btn tint" data-a="sheet" data-t="match" data-date="' + esc(day) + '">Add match</button></div>';
  h += '</section>';
  h += sec('Availability', '<div class="group">' + [['going', 'Yes'], ['maybe', 'Maybe'], ['out', 'No'], ['none', 'No answer']].map(function (k) {
    var list = g[k[0]];
    return '<div class="cell stack"><div class="row between"><span class="row g8"><i class="dot" style="background:' + (STATUS_COL[k[0]] || 'var(--card3)') + '"></i><span class="t1">' + k[1] + '</span></span><span class="val num">' + list.length + '</span></div>' +
      (list.length ? '<div class="chips">' + list.map(function (p) { return '<span class="tag">' + esc(p.name) + '</span>'; }).join('') + '</div>' : '') + '</div>';
  }).join('') + '</div>', '', players().length ? 'Players mark days in their Availability tab. Answers on non-training days help you plan extra sessions and matches.' : '');
  return h;
}

/* ---------- install as an app ---------- */
var installEvt = null;
window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); installEvt = e; if (S.phase === 'ready') render(); });
window.addEventListener('appinstalled', function () { installEvt = null; store('futsal_install_hide', '1'); if (S.phase === 'ready') render(true); });
function isStandalone() { return (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true; }
function isIOS() { return /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); }
function inAppBrowser() { return /FBAN|FBAV|Instagram|WhatsApp|Line\/|GSA\//.test(navigator.userAgent); }
function installCard() {
  if (isStandalone() || load('futsal_install_hide')) return '';
  var nm = isCoach() ? 'SR Coach' : 'SR Futsal';
  var top = '<div class="row g12"><span class="ico" aria-hidden="true"></span><div class="col g4 grow"><span class="t1" style="font-weight:600">Add ' + nm + ' to your home screen</span><span class="t2">Opens full screen like any app and remembers you.</span></div></div>';
  if (installEvt) return '<section class="install">' + top + '<div class="btns"><button class="btn fill" data-a="install">Install</button><button class="btn" data-a="installHide">Not now</button></div></section>';
  if (isIOS()) {
    var share = '<span class="shareic">' + svg(I.share, 18, 2) + '</span>';
    return '<section class="install">' + top + (inAppBrowser() ? '<span class="t2">First open this page in Safari: tap the \u22ef menu and choose Open in Safari.</span>' : '') +
      '<ol><li>Tap Share ' + share + ' in Safari</li><li>Tap <b>Add to Home Screen</b></li><li>Tap <b>Add</b></li></ol><button class="btn" data-a="installHide">Done</button></section>';
  }
  return '';
}

/* ---------- player home ---------- */
function viewWho() {
  var ps = players();
  return '<div class="gate">' + installCard() + '<div class="head"><img class="logo" src="logo.jpg" alt=""><span class="hsub">' + esc(TEAM) + '</span><h1 class="lt">Who are you?</h1><span class="t2">Tap your name. This phone will remember you.</span></div>' +
    (ps.length ? '<div class="group">' + ps.map(function (p) { return '<button class="cell ind" data-a="iam" data-pid="' + esc(p.id) + '"><span class="av" aria-hidden="true">' + esc(initials(p.name)) + '</span><span class="col grow g4"><span class="t1">' + esc(p.name) + '</span>' + (p.pos ? '<span class="t2">' + esc(p.pos) + '</span>' : '') + '</span>' + chev() + '</button>'; }).join('') + '</div>' : emptyBox('Your coach hasn\u2019t added the squad yet. Check back soon.')) +
    '<p class="note" style="text-align:center">Not on the list? Ask your coach to add you.</p></div>';
}
function viewHome(stats) {
  if (!S.me) return viewWho();
  var me = S.me; var p = S.players[me];
  var right = '<button class="av me" data-a="notmeAsk" aria-label="Signed in as ' + esc(p.name) + '. Switch player" style="border:0">' + esc(initials(p.name)) + '</button>';
  var h = hdr('Hi ' + esc(first(p.name)), esc(fmtLong(todayStr())), right);
  var nx = nextEvent();
  var a = installCard() + (nx ? hero(nx, { answer: true }) : emptyBox('Nothing scheduled yet. Check back soon.'));
  var soon = openEvents().filter(function (e) { return !nx || e.id !== nx.id; }).slice(0, 4);
  if (soon.length) a += sec('Coming up', '<div class="group">' + soon.map(function (e) {
    return '<button class="cell" data-a="cycleDay" data-day="' + esc(e.date) + '">' + dtile(e) + '<span class="col grow g4"><span class="t1">' + esc(evTitle(e)) + '</span><span class="t2">' + esc(evWhere(e) || fmtD(e.date)) + '</span></span>' + pill(dayStatus(me, e.date)) + '</button>';
  }).join('') + '</div>', '<a class="btn plain" href="#calendar">Calendar</a>', 'Tap a session to switch between yes, maybe and no.');
  var rows = cfg().skills.map(function (k) { return { k: k, st: skillState(me, k, stats) }; }).sort(function (x, y) { return W[y.st.level] - W[x.st.level]; });
  var need = rows.filter(function (r) { return r.st.level !== 'fresh'; });
  var b = sec('Your training', '<a class="group" href="#stats" style="color:inherit">' + '<div class="cell stack"><span class="t2">' + (need.length ? 'Most overdue: <b style="color:var(--label)">' + esc(need.slice(0, 2).map(function (r) { return r.k.toLowerCase(); }).join(' and ')) + '</b>' : 'Every skill is fresh. Nice work.') + '</span>' +
    '<div class="chips">' + rows.map(function (r) { return '<span class="tag" style="color:' + C[r.st.level] + '">' + esc(r.k) + '</span>'; }).join('') + '</div></div><div class="cell"><span class="grow" style="color:var(--blue)">See all your stats</span>' + chev() + '</div></a>');
  return h + cols(a, b);
}

/* ---------- training ---------- */
function trainingChips(sel) {
  var list = overdueOpen('training').concat(openEvents('training')).slice(0, 10);
  if (list.length < 2) return '';
  return '<div class="scroller" role="group" aria-label="Choose a session">' + list.map(function (e) { return '<button class="chip" data-a="pickTrain" data-sid="' + esc(e.id) + '" aria-pressed="' + (sel && e.id === sel.id) + '">' + esc(fmtD(e.date)) + '</button>'; }).join('') + '</div>';
}
function planList(s, pl, focusSkills, own) {
  if (!pl.ids.length) return emptyBox(own ? 'Start building: add drills from your library, or create your own.' : 'No drills in the library yet.');
  var clock = s.time || '19:00';
  var h = '<div class="group plan">' + pl.ids.map(function (id, i) {
    var d = S.drills[id]; if (!d) return ''; var open = S.open === i; var t = clock; clock = addMins(clock, +d.mins || 0);
    var hit = (d.skills || []).some(function (k) { return focusSkills.indexOf(k) >= 0; });
    var head = '<span class="time">' + esc(fmtTime(t)) + '</span><span class="bar' + (hit ? ' f' : '') + '"></span><span class="col grow g4"><span class="t1">' + esc(d.name) + '</span><span class="t2">' + drillMeta(d) + '</span></span>';
    if (own) return '<div class="cellwrap"><div class="cell">' + head + '<span class="ctl"><button class="ibtn" data-a="blk" data-v="up" data-i="' + i + '" aria-label="Move ' + esc(d.name) + ' earlier"' + (i === 0 ? ' disabled' : '') + '>' + ic('up', 16, 2.4) + '</button><button class="ibtn" data-a="blk" data-v="down" data-i="' + i + '" aria-label="Move ' + esc(d.name) + ' later"' + (i === pl.ids.length - 1 ? ' disabled' : '') + '>' + ic('down', 16, 2.4) + '</button><button class="ibtn" data-a="blk" data-v="del" data-i="' + i + '" aria-label="Remove ' + esc(d.name) + '" style="color:var(--red)">' + ic('x', 16, 2.4) + '</button></span></div></div>';
    return '<div class="cellwrap"><button class="cell" type="button" data-a="toggle" data-i="' + i + '" aria-expanded="' + open + '">' + head + '<span class="chev">' + ic(open ? 'up' : 'down', 16, 2.4) + '</span></button>' +
      (open ? '<div class="body">' + (d.setup ? '<span class="desc">' + esc(d.setup) + '</span>' : '') + (d.cue ? '<span><b>Coaching point:</b> ' + esc(d.cue) + '</span>' : '') + (d.link ? '<a href="' + esc(d.link) + '" target="_blank" rel="noopener">Watch the video or diagram</a>' : '') + (!d.setup && !d.cue && !d.link ? '<span>No description yet.</span>' : '') +
        (isCoach() ? '<div class="row g8"><button class="btn sm tint" type="button" data-a="swap" data-i="' + i + '">Swap drill</button><button class="btn sm red" type="button" data-a="removeBlock" data-i="' + i + '">Remove</button></div>' : '') + '</div>' : '') + '</div>';
  }).join('') + '<div class="cellwrap"><div class="cell"><span class="time">' + esc(fmtTime(clock)) + '</span><span class="t2">Finish</span></div></div></div>';
  return h;
}
function viewTraining(stats) {
  var s = selTraining();
  var h = hdr('Training', s ? esc(fmtLong(s.date)) : 'No sessions scheduled', isCoach() ? addBtn('training', 'Add training') : '');
  if (!s) return h + emptyBox(isCoach() ? 'Add your weekly session and a plan is suggested automatically, or build your own.' : 'Your coach hasn\u2019t scheduled the next session yet.', isCoach() ? '<button class="btn fill" data-a="sheet" data-t="training">Add training</button>' : '') + pastTraining();
  h += trainingChips(s);
  var pl = planFor(s, stats); var basis = basisFor(s); var going = goingIds(s);
  var g = gaps(basis, stats); var focus = g.filter(function (x) { return x.need; }).slice(0, 2); var fsk = focus.map(function (x) { return x.skill; });
  var a = hero(s, { answer: !isCoach(), kicker: s.date < todayStr() ? 'Waiting to be logged' : 'Training' });
  if (basis.length) a += sec('Focus', '<div class="focus">' + (focus.length ? '<div class="chips">' + focus.map(function (x) { return '<span class="pill blue" style="font-size:15px;padding:5px 12px">' + esc(x.skill) + '</span>'; }).join('') + '</div><span class="t2">' + focus.map(function (x) { return x.need + ' of ' + basis.length + ' ' + (going.length ? 'coming' : 'players') + ' haven\u2019t trained ' + x.skill.toLowerCase() + ' recently'; }).join('. ') + '.</span>' : '<span class="t2">Everyone is up to date, so this is a balanced session.</span>') + '</div>');
  if (isCoach()) a += '<div class="group"><button class="cell" data-a="sheet" data-t="log" data-sid="' + esc(s.id) + '"><span class="it" style="background:var(--green)">' + ic('check', 18, 2.6) + '</span><span class="grow">Log attendance</span>' + chev() + '</button><button class="cell" data-a="sheet" data-t="editTraining" data-sid="' + esc(s.id) + '"><span class="it" style="background:#636366">' + ic('edit', 16, 2.2) + '</span><span class="grow">Edit this session</span>' + chev() + '</button></div>';
  var mins = planMins(pl.ids); var total = +s.mins || cfg().sessionMins;
  var b = '';
  if (isCoach()) {
    var own = trainMode(s) === 'own';
    b += '<div class="mode"><div class="seg lg" role="group" aria-label="Plan type"><button data-a="mode" data-v="auto" aria-pressed="' + !own + '">Suggested</button><button data-a="mode" data-v="own" aria-pressed="' + own + '">Build my own</button></div></div>';
    var meter = '<div class="col g8"><div class="row between"><span class="t2">' + mins + ' of ' + total + ' min planned</span>' + (mins > total ? '<span class="fn" style="color:var(--orange)">' + (mins - total) + ' min over</span>' : '') + '</div><div class="meter"><i class="' + (mins > total ? 'over' : '') + '" style="width:' + Math.min(100, Math.round(mins / total * 100)) + '%"></i></div></div>';
    if (own) {
      b += sec(pl.saved ? 'Your session' : 'Build your session', meter + planList(s, pl, fsk, true) + '<div class="btns"><button class="btn tint" data-a="sheet" data-t="pick">' + ic('plus', 18, 2.4) + 'Add drills</button><button class="btn tint" data-a="sheet" data-t="drill" data-addto="' + esc(s.id) + '">' + ic('edit', 16, 2.2) + 'New drill</button></div>' +
        '<button class="btn fill" data-a="saveOwn"' + (pl.ids.length && (pl.changed || !pl.saved) ? '' : ' disabled') + '>' + (pl.saved && !pl.changed ? 'Saved' : 'Save session') + '</button>' + (pl.ids.length ? '<button class="btn plain" data-a="clearOwn">Start again</button>' : ''), '', 'Add drills from the library or write your own. Use the arrows to change the order. Players see the plan once it\u2019s saved.');
    } else {
      b += sec(pl.saved ? 'Session plan' : 'Suggested plan', meter + planList(s, pl, fsk, false) +
        (pl.saved && !pl.changed ? '<button class="btn" data-a="resetPlan">Suggest a new plan</button>' : '<button class="btn fill" data-a="savePlan"' + (pl.ids.length ? '' : ' disabled') + '>' + (pl.changed && s.plan && s.plan.length ? 'Save changes' : 'Use this plan') + '</button>'), '', 'Built from what the players coming need most. Tap a drill for details, to swap it, or to remove it.');
    }
  } else {
    b += sec(pl.saved ? 'Session plan' : 'Likely plan', '<p class="t2" style="padding:0 4px">' + mins + ' min of drills' + (pl.saved ? '' : '. Your coach may change it.') + '</p>' + planList(s, pl, fsk, false));
  }
  return h + cols(a, b) + pastTraining();
}
function pastTraining() {
  var past = pastEvents('training').slice(0, 4);
  if (!past.length) return '';
  return sec('Recent sessions', '<div class="group">' + past.map(function (s) {
    return '<div class="cell">' + dtile(s) + '<span class="col grow g4"><span class="t1">' + esc(s.title || 'Training') + '</span><span class="t2">' + plural((s.attended || []).length, 'player') + ', ' + plural((s.drillsDone || s.plan || []).length, 'drill') + '</span></span></div>';
  }).join('') + '</div>');
}

/* ---------- matches ---------- */
function viewMatches() {
  var up = overdueOpen('match').concat(openEvents('match')); var past = pastEvents('match');
  var rec = { W: 0, D: 0, L: 0 }; past.forEach(function (m) { var r = result(m); if (rec[r.label] != null) rec[r.label]++; });
  var h = hdr('Matches', past.length ? 'Won ' + rec.W + ', drew ' + rec.D + ', lost ' + rec.L : 'Fixtures and results', isCoach() ? addBtn('match', 'Add match') : '');
  var a = '';
  if (!up.length) a += emptyBox('No matches scheduled yet.', isCoach() ? '<button class="btn fill" data-a="sheet" data-t="match">Add a match</button>' : '');
  else {
    a += hero(up[0], { answer: !isCoach(), kicker: up[0].homeAway === 'home' ? 'Home match' : up[0].homeAway === 'away' ? 'Away match' : 'Next match' });
    if (isCoach()) a += '<div class="btns"><button class="btn" data-a="sheet" data-t="editMatch" data-sid="' + esc(up[0].id) + '">Edit match</button><button class="btn fill" data-a="sheet" data-t="logMatch" data-sid="' + esc(up[0].id) + '">Enter result</button></div>';
    if (up.length > 1) a += sec('Later fixtures', '<div class="group">' + up.slice(1).map(function (m) {
      var inner = dtile(m) + '<span class="col grow g4"><span class="t1">' + esc(evTitle(m)) + '</span><span class="t2">' + esc([evWhere(m), m.competition].filter(Boolean).join(', ') || fmtD(m.date)) + '</span></span>';
      return isCoach() ? '<button class="cell" data-a="sheet" data-t="editMatch" data-sid="' + esc(m.id) + '">' + inner + chev() + '</button>' : '<button class="cell" data-a="cycleDay" data-day="' + esc(m.date) + '">' + inner + pill(dayStatus(S.me, m.date)) + '</button>';
    }).join('') + '</div>');
  }
  var b = past.length ? sec('Results', '<div class="group">' + past.map(function (m) {
    var r = result(m);
    var inner = '<span class="res" style="background:' + r.bg + ';color:' + r.fg + '">' + r.label + '</span><span class="col grow g4"><span class="t1">' + esc(evTitle(m)) + '</span><span class="t2">' + esc(fmtD(m.date) + (m.competition ? ', ' + m.competition : '')) + '</span></span><span class="score">' + esc(r.text) + '</span>';
    return isCoach() ? '<button class="cell" data-a="sheet" data-t="logMatch" data-sid="' + esc(m.id) + '">' + inner + '</button>' : '<div class="cell">' + inner + '</div>';
  }).join('') + '</div>') : '';
  return h + cols(a, b || emptyBox('Results appear here after each match.'));
}

/* ---------- drills (coach) ---------- */
function drillRow(d, extra) {
  return '<button class="cell lib" data-a="sheet" data-t="drillView" data-did="' + esc(d.id) + '" data-name="' + esc((d.name + ' ' + (d.skills || []).join(' ')).toLowerCase()) + '"><span class="col grow g4"><span class="t1">' + esc(d.name) + '</span><span class="t2">' + drillMeta(d) + '</span></span>' + (extra || '') + chev() + '</button>';
}
function viewDrills(stats) {
  var t = selTraining(); var basis = t ? basisFor(t) : players().map(function (p) { return p.id; });
  var wm = weights(basis, stats); var all = drillsArr();
  var h = hdr('Drills', all.length + ' in your library', addBtn('drill', 'Add a drill'));
  var recs = all.filter(function (d) { return (d.kind || 'drill') === 'drill'; }).sort(function (x, y) { return drillScore(y, wm) - drillScore(x, wm) || x.name.localeCompare(y.name); }).slice(0, 4);
  var top = gaps(basis, stats).filter(function (x) { return x.need; }).slice(0, 2).map(function (x) { return x.skill.toLowerCase(); });
  var b = '';
  if (recs.length && basis.length && top.length) {
    var tplan = t ? planFor(t, stats).ids : [];
    b += sec('Recommended', '<div class="group">' + recs.map(function (d) {
      return '<div class="cell"><button data-a="sheet" data-t="drillView" data-did="' + esc(d.id) + '" class="col grow g4" style="border:0;background:none;text-align:left;color:inherit;padding:0;min-height:44px;justify-content:center"><span class="t1">' + esc(d.name) + '</span><span class="t2">' + drillMeta(d) + '</span></button>' +
        (t ? (tplan.indexOf(d.id) >= 0 ? '<span class="pill blue">In plan</span>' : '<button class="btn sm tint" data-a="addToPlan" data-did="' + esc(d.id) + '">Add</button>') : '') + '</div>';
    }).join('') + '</div>', '', 'The squad most needs ' + esc(top.join(' and ')) + (t ? '. Add puts a drill into the ' + esc(fmtD(t.date)) + ' plan.' : '.'));
  }
  var a = '<div class="search">' + ic('search', 17, 2.2) + '<input type="search" placeholder="Search drills" data-input="libQ" value="' + esc(S.libQ) + '" aria-label="Search drills"></div>';
  a += '<div class="scroller" role="group" aria-label="Filter by skill">' + ['all'].concat(cfg().skills).map(function (k) { return '<button type="button" class="chip" data-a="drillFilter" data-v="' + esc(k) + '" aria-pressed="' + (S.drillFilter === k) + '">' + (k === 'all' ? 'All' : esc(k)) + '</button>'; }).join('') + '</div>';
  var list = all.filter(function (d) { return S.drillFilter === 'all' || (d.skills || []).indexOf(S.drillFilter) >= 0; });
  var any = false;
  [['own', 'Your drills'], ['warmup', 'Warm-ups'], ['drill', 'Drills'], ['game', 'Games']].forEach(function (k) {
    var items = list.filter(function (d) { return k[0] === 'own' ? d.own : (!d.own && (d.kind || 'drill') === k[0]); }).sort(function (x, y) { return x.name.localeCompare(y.name); });
    if (!items.length) return; any = true;
    a += sec(k[1], '<div class="group libgroup">' + items.map(function (d) { return drillRow(d, k[0] === 'own' ? '<span class="tag">' + (KIND_LABEL[d.kind] || 'Drill') + '</span>' : ''); }).join('') + '</div>');
  });
  if (!any) a += emptyBox('No drills for that skill yet.', '<button class="btn tint" data-a="sheet" data-t="drill">Create a drill</button>');
  return h + cols(a, b || sec('Your own drills', emptyBox('Drills you create are kept here and can be added to any session.', '<button class="btn tint" data-a="sheet" data-t="drill">Create a drill</button>')));
}

/* ---------- stats ---------- */
function viewStats(stats) {
  var ps = players();
  if (!isCoach() && !S.me) return viewWho();
  if (!ps.length) return hdr('Player stats') + emptyBox('No players yet.');
  var pid = S.statPid && S.players[S.statPid] ? S.statPid : (S.me && S.players[S.me] ? S.me : ps[0].id); var p = S.players[pid];
  var doneT = eventsArr().filter(function (s) { return s.done && s.kind !== 'match'; }).sort(byTime);
  var trained = doneT.filter(function (s) { return (s.attended || []).indexOf(pid) >= 0; });
  var played = eventsArr().filter(function (s) { return s.done && s.kind === 'match' && (s.attended || []).indexOf(pid) >= 0; }).length;
  var rate = doneT.length ? Math.round(trained.length / doneT.length * 100) + '%' : '\u2013';
  var h = isCoach() ? '<a class="back" href="#players">' + ic('chevL', 22, 2.4) + 'Squad</a>' : '';
  h += '<header class="hdr" style="align-items:center"><div class="row g12 grow"><span class="av lg' + (isCoach() ? '' : ' me') + '" aria-hidden="true">' + esc(initials(p.name)) + '</span><div class="col g4"><h1 class="lt">' + esc(p.name) + '</h1><span class="t2">' + esc(p.pos || 'Player') + '</span></div></div>' +
    (isCoach() ? '<button class="btn sm tint" data-a="sheet" data-t="editPlayer" data-pid="' + esc(pid) + '">Edit</button>' : '<button class="btn sm" data-a="notmeAsk">Switch</button>') + '</header>';
  var a = '<div class="tiles"><div class="tile"><b>' + trained.length + '</b><span>Sessions</span></div><div class="tile"><b>' + rate + '</b><span>Attendance</span></div><div class="tile"><b>' + played + '</b><span>Matches</span></div></div>';
  var last12 = doneT.slice(-12);
  var strip = '<div class="att" role="img" aria-label="Attendance at the last ' + last12.length + ' sessions">';
  for (var i = 0; i < 12 - last12.length; i++) strip += '<i class="e"></i>';
  last12.forEach(function (s) { var y = (s.attended || []).indexOf(pid) >= 0; strip += '<i class="' + (y ? 'y' : '') + '" title="' + esc(fmtD(s.date) + (y ? ': came' : ': missed')) + '"></i>'; });
  a += sec('Last 12 sessions', '<div class="group"><div class="cell stack">' + strip + '</div></div>', '<span class="fn">' + (last12.length ? 'Came to ' + last12.filter(function (s) { return (s.attended || []).indexOf(pid) >= 0; }).length + ' of ' + last12.length : 'None logged yet') + '</span>');
  var c = cfg(); var full = c.overdue + 7;
  var rows = c.skills.map(function (k) { return { k: k, st: skillState(pid, k, stats) }; }).sort(function (x, y) { return (y.st.days == null ? 999 : y.st.days) - (x.st.days == null ? 999 : x.st.days); });
  var b = sec('Skills', '<div class="group">' + rows.map(function (r) {
    var pct = r.st.days == null ? 100 : Math.min(100, Math.round(r.st.days / full * 100));
    return '<div class="skill"><div class="row between"><span class="t1">' + esc(r.k) + '</span><span class="row g8"><span class="fn" style="color:' + C[r.st.level] + ';font-weight:600">' + LEVEL_LABEL[r.st.level] + '</span><span class="num" style="font-weight:600;min-width:34px;text-align:right">' + (r.st.days == null ? '\u2013' : r.st.days + 'd') + '</span></span></div>' +
      '<div class="track" role="img" aria-label="' + esc(r.k + ': ' + (r.st.days == null ? 'not trained yet' : r.st.days + ' days since trained') + ', ' + LEVEL_LABEL[r.st.level]) + '"><div class="fl" style="width:' + pct + '%;background:' + C[r.st.level] + '"></div><span class="tk" style="left:' + Math.round(c.fresh / full * 100) + '%"></span><span class="tk" style="left:' + Math.round(c.overdue / full * 100) + '%"></span></div>' +
      '<span class="fn">' + (r.st.date ? 'Last trained ' + esc(fmtLong(r.st.date)) : 'No session logged with this skill yet') + '</span></div>';
  }).join('') + '</div>', '<span class="fn">Days since trained</span>', 'The marks on each bar show when a skill becomes due (' + c.fresh + ' days) and overdue (' + c.overdue + ' days).');
  return h + cols(a, b);
}

/* ---------- squad (coach) ---------- */
function viewPlayers(stats) {
  var ps = players(); var e = nextEvent();
  var h = hdr('Squad', plural(ps.length, 'player'), addBtn('player', 'Add player'));
  if (!ps.length) return h + emptyBox('Add your squad to get started.', '<button class="btn fill" data-a="sheet" data-t="player">Add players</button>');
  return h + sec('', '<div class="group">' + ps.map(function (p) {
    var over = cfg().skills.filter(function (k) { var l = skillState(p.id, k, stats).level; return l === 'overdue' || l === 'never'; }).length;
    return '<button class="cell ind" data-a="viewPlayer" data-pid="' + esc(p.id) + '"><span class="av" aria-hidden="true">' + esc(initials(p.name)) + '</span><span class="col grow g4"><span class="t1">' + esc(p.name) + '</span><span class="t2">' + esc(p.pos || 'Player') + (over ? ', ' + over + ' skills overdue' : ', all skills fresh') + '</span></span>' + (e ? pill(rsvp(p.id, e)) : '') + chev() + '</button>';
  }).join('') + '</div>', '', e ? 'Answers shown are for ' + esc(evTitle(e).toLowerCase() === 'training' ? 'training' : evTitle(e)) + ' on ' + esc(fmtD(e.date)) + '.' : '');
}

/* ---------- coach overview ---------- */
function viewCoach(stats) {
  var s = selTraining(); var ps = players(); var nm = overdueOpen('match').concat(openEvents('match'))[0];
  var pids = S.scope === 'session' && s ? goingIds(s) : ps.map(function (p) { return p.id; });
  var h = hdr('Overview', esc(TEAM), '<img class="logo sm" src="logo.jpg" alt="">');
  var a = installCard();
  if (!ps.length) a += sec('Get started', '<div class="group"><button class="cell" data-a="sheet" data-t="player"><span class="it" style="background:var(--blue)">' + ic('plus', 18, 2.4) + '</span><span class="grow">Add your players</span>' + chev() + '</button></div>');
  a += s ? hero(s, { kicker: 'Next training' }) : emptyBox('No training scheduled.', '<button class="btn fill" data-a="sheet" data-t="training">Add training</button>');
  if (nm) a += '<div class="group"><a class="cell" href="#matches">' + dtile(nm) + '<span class="col grow g4"><span class="t1">Next match: ' + esc(evTitle(nm)) + '</span><span class="t2">' + goingIds(nm).length + ' said yes, ' + counts(nm).none + ' not answered</span></span>' + chev() + '</a></div>';
  var gap = '<div class="seg" role="group" aria-label="Who to include"><button type="button" data-a="scope" data-v="session" aria-pressed="' + (S.scope === 'session') + '">' + (s ? 'Coming ' + esc(fmtD(s.date)) : 'Next session') + '</button><button type="button" data-a="scope" data-v="squad" aria-pressed="' + (S.scope === 'squad') + '">Whole squad</button></div>';
  if (!pids.length) gap += emptyBox(S.scope === 'session' ? 'Nobody has said yes yet.' : 'No players yet.');
  else {
    var g = gaps(pids, stats); var top = g[0];
    if (top && top.need) gap += '<div class="focus"><span class="t2">Biggest gap</span><span class="big">' + esc(top.skill) + '</span><span class="t2">' + top.need + ' of ' + pids.length + ' haven\u2019t trained it in ' + (cfg().fresh + 1) + '+ days.</span></div>';
    gap += '<div class="group"><div class="bars">' + g.map(function (x) {
      var pct = Math.round(x.need / pids.length * 100); var col = pct >= 50 ? C.overdue : (pct >= 30 ? C.due : C.fresh);
      return '<div class="col g8"><div class="row between"><span style="font-size:15px">' + esc(x.skill) + '</span><span class="fn num" style="font-weight:600;color:' + col + '">' + x.need + ' of ' + pids.length + '</span></div><div class="hbar" role="img" aria-label="' + esc(x.skill) + ': ' + x.need + ' of ' + pids.length + ' need it"><i style="width:' + Math.max(pct, 2) + '%;background:' + col + '"></i></div></div>';
    }).join('') + '</div></div><a href="#training" class="btn fill">Plan training around these gaps</a>';
  }
  a += sec('What\u2019s lacking', gap);
  var link = teamLink();
  var b = sec('Squad link', '<div class="group"><div class="cell stack"><span class="linkbox">' + esc(link) + '</span><div class="btns"><button class="btn tint" data-a="copy" data-link="' + esc(link) + '">Copy link</button>' + (navigator.share ? '<button class="btn tint" data-a="share" data-link="' + esc(link) + '">Share</button>' : '<button class="btn tint" data-a="sheet" data-t="teamLink">More</button>') + '</div></div></div>', '', 'Players open this, tap their name and confirm. Their phone remembers them.');
  b += sec('Manage', '<div class="group">' +
    '<a class="cell" href="#players"><span class="it" style="background:var(--blue)">' + ic('squad', 17, 2) + '</span><span class="grow">Squad</span><span class="val">' + ps.length + '</span>' + chev() + '</a>' +
    '<button class="cell" data-a="sheet" data-t="training"><span class="it" style="background:var(--green)">' + ic('training', 17, 2) + '</span><span class="grow">Add training</span>' + chev() + '</button>' +
    '<button class="cell" data-a="sheet" data-t="match"><span class="it" style="background:var(--orange)">' + ic('matches', 17, 2) + '</span><span class="grow">Add match</span>' + chev() + '</button>' +
    '<button class="cell" data-a="sheet" data-t="coaches"><span class="it" style="background:#5E5CE6">' + ic('invite', 17, 2) + '</span><span class="grow">Coaches</span><span class="val">' + (S.admins.length || '') + '</span>' + chev() + '</button>' +
    '<button class="cell" data-a="sheet" data-t="settings"><span class="it" style="background:#636366">' + ic('gear', 17, 2) + '</span><span class="grow">Settings</span>' + chev() + '</button>' +
    '</div>');
  b += '<div class="group"><button class="cell" data-a="logout"><span class="grow" style="color:var(--red)">Sign out</span><span class="fn">' + esc(S.email) + '</span></button></div>';
  return h + cols(a, b);
}

/* ---------- sheets ---------- */
function posOpts(cur) { return '<option value="">Not set</option>' + POSITIONS.map(function (x) { return '<option' + (x === cur ? ' selected' : '') + '>' + x + '</option>'; }).join(''); }
function field(label, input, stack) { return '<label class="field' + (stack ? ' stack' : '') + '"><span>' + label + '</span>' + input + '</label>'; }
function checkRow(name, value, checked, label, sub) { return '<label class="check"><input class="tick" type="checkbox" name="' + name + '" value="' + esc(value) + '"' + (checked ? ' checked' : '') + '><span class="col g4 grow"><span>' + label + '</span>' + (sub ? '<span class="fn">' + sub + '</span>' : '') + '</span></label>'; }
function sheetHTML(stats) {
  var sh = S.sheet; if (!sh) return '';
  var c = cfg(); var body = ''; var title = '';
  if (sh.t === 'confirmMe') {
    var cp = S.players[sh.pid]; if (!cp) return ''; title = 'Is this you?';
    body = '<div class="col g8" style="align-items:center;text-align:center;padding:8px 0"><span class="av lg me" aria-hidden="true">' + esc(initials(cp.name)) + '</span><h2 style="font-size:28px">' + esc(cp.name) + '</h2>' + (cp.pos ? '<span class="t2">' + esc(cp.pos) + '</span>' : '') + '</div>' +
      '<p class="t2" style="text-align:center">Your answers are saved as ' + esc(first(cp.name)) + '. This phone will remember you.</p>' +
      '<button class="btn fill" data-a="iamYes" data-pid="' + esc(sh.pid) + '">Yes, this is me</button><button class="btn" data-a="close">No, go back</button>';
  } else if (sh.t === 'notme') {
    title = 'Switch player';
    body = '<p class="t2">This phone is set to ' + esc((S.players[S.me] || {}).name || 'you') + '. Switch only if someone else uses this phone.</p><button class="btn red" data-a="notme">Choose a different name</button><button class="btn" data-a="close">Cancel</button>';
  } else if (sh.t === 'who') {
    var we = evById(sh.sid); if (!we) return ''; title = esc(evTitle(we)) + ', ' + esc(fmtD(we.date));
    if (isCoach()) {
      body = '<p class="t2">Set anyone\u2019s answer, for example if they told you in person.</p><div class="group">' + players().map(function (p) { return '<div class="cell stack"><div class="row g12"><span class="av" aria-hidden="true">' + esc(initials(p.name)) + '</span><span class="t1 grow">' + esc(p.name) + '</span></div>' + ansSeg(p.id, we) + '</div>'; }).join('') + '</div>';
    } else {
      body = [['going', 'Yes'], ['maybe', 'Maybe'], ['out', 'No'], [null, 'No answer']].map(function (g) {
        var ids = g[0] ? idsWith(we, g[0]) : players().filter(function (p) { return !rsvp(p.id, we); }).map(function (p) { return p.id; });
        if (!ids.length) return '';
        return '<div class="col g8"><div class="row g8"><i class="dot" style="background:' + (STATUS_COL[g[0]] || 'var(--card3)') + '"></i><h3>' + g[1] + ' (' + ids.length + ')</h3></div><div class="chips">' + ids.map(function (id) { return '<span class="tag">' + esc(S.players[id].name) + (id === S.me ? ' (you)' : '') + '</span>'; }).join('') + '</div></div>';
      }).join('');
    }
  } else if (sh.t === 'player') {
    title = 'Add a player';
    body = '<form data-form="addPlayer" class="form"><div class="fgroup">' + field('Name', '<input type="text" name="name" required maxlength="60" placeholder="Full name" autocomplete="off">') + field('Position', '<select name="pos">' + posOpts('') + '</select>') + '</div><button class="btn fill" type="submit">Add player</button></form><p class="note">The form stays open so you can add the next player straight away.</p>';
  } else if (sh.t === 'editPlayer') {
    var ep = S.players[sh.pid]; if (!ep) return ''; title = 'Edit player';
    body = '<form data-form="editPlayer" data-pid="' + esc(sh.pid) + '" class="form"><div class="fgroup">' + field('Name', '<input type="text" name="name" required maxlength="60" value="' + esc(ep.name) + '">') + field('Position', '<select name="pos">' + posOpts(ep.pos) + '</select>') + '</div><button class="btn fill" type="submit">Save</button></form>' +
      '<button class="btn red" data-a="deletePlayer" data-pid="' + esc(sh.pid) + '">' + (sh.confirm ? 'Tap again to remove ' + esc(ep.name) : 'Remove from squad') + '</button>';
  } else if (sh.t === 'teamLink') {
    title = 'Squad link';
    body = '<p class="t2">Send this to the squad, for example in your WhatsApp group.</p><div class="group"><div class="cell"><span class="linkbox">' + esc(teamLink()) + '</span></div></div><div class="btns"><button class="btn fill" data-a="copy" data-link="' + esc(teamLink()) + '">Copy link</button>' + (navigator.share ? '<button class="btn" data-a="share" data-link="' + esc(teamLink()) + '">Share</button>' : '<span></span>') + '</div>';
  } else if (sh.t === 'coaches') {
    title = 'Coaches';
    body = '<div class="group">' + (S.admins.length ? S.admins.map(function (e) { return '<div class="cell ind"><span class="av me" aria-hidden="true">' + esc(initials(e)) + '</span><span class="grow" style="word-break:break-all">' + esc(e) + '</span>' + (e === S.email ? '<span class="fn">You</span>' : '') + '</div>'; }).join('') : '<div class="cell t2">Couldn\u2019t load the list.</div>') + '</div>' +
      (S.invites.length ? '<div class="col g8"><span class="flabel">Invited, not signed up yet</span><div class="group">' + S.invites.map(function (e) { return '<div class="cell"><span class="grow" style="word-break:break-all">' + esc(e) + '</span><button class="btn sm red" data-a="delInvite" data-email="' + esc(e) + '">Cancel</button></div>'; }).join('') + '</div></div>' : '') +
      '<form data-form="invite" class="form"><div class="col g8"><span class="flabel">Add a coach</span><div class="fgroup">' + field('Email', '<input type="email" name="email" required placeholder="coach@example.com" autocomplete="off">') + '</div></div><button class="btn fill" type="submit">Invite coach</button></form>' +
      '<div class="group"><div class="cell stack"><span class="t1" style="font-weight:600">What they do next</span><ol style="margin:0;padding-left:20px;color:var(--label2);font-size:15px;line-height:1.5"><li>Open <b style="color:var(--label)">' + esc(siteBase() + 'admin.html') + '</b></li><li>Tap <b style="color:var(--label)">New coach</b>, enter this email and choose a password</li><li>Tap the link in the confirmation email</li></ol></div></div>';
  } else if (sh.t === 'training' || sh.t === 'editTraining') {
    var es = sh.t === 'editTraining' ? evById(sh.sid) : null; title = es ? 'Edit training' : 'Add training';
    var lastT = openEvents('training').slice(-1)[0] || pastEvents('training')[0];
    var dflt = es || { date: sh.date || todayStr(), time: (lastT && lastT.time) || '19:00', endTime: (lastT && lastT.endTime) || '20:30', venue: (lastT && lastT.venue) || '', title: 'Training' };
    body = '<form data-form="training" class="form"' + (es ? ' data-sid="' + esc(es.id) + '"' : '') + '><div class="fgroup">' + field('Name', '<input type="text" name="title" maxlength="40" value="' + esc(dflt.title || 'Training') + '">') + field('Date', '<input type="date" name="date" required value="' + esc(dflt.date) + '">') + field('Starts', '<input type="time" name="time" value="' + esc(dflt.time || '') + '">') + field('Ends', '<input type="time" name="endTime" value="' + esc(dflt.endTime || '') + '">') + field('Venue', '<input type="text" name="venue" maxlength="40" value="' + esc(dflt.venue || '') + '">') + '</div>' +
      (es ? '' : '<div class="fgroup">' + field('Repeat', '<select name="repeat"><option value="once">Just this date</option><option value="season">Every week until the season ends</option></select>') + field('Plan', '<select name="plan"><option value="auto">Suggest one for me</option><option value="own">I\u2019ll build my own</option></select>') + '</div>') +
      '<button class="btn fill" type="submit">' + (es ? 'Save' : 'Add training') + '</button></form>' +
      (es ? '<button class="btn red" data-a="deleteEvent" data-sid="' + esc(es.id) + '">' + (sh.confirm ? 'Tap again to delete this session' : 'Delete this session') + '</button>' : '');
  } else if (sh.t === 'match' || sh.t === 'editMatch') {
    var em = sh.t === 'editMatch' ? evById(sh.sid) : null; title = em ? 'Edit match' : 'Add match';
    var dm = em || { date: sh.date || todayStr(), time: '', endTime: '', venue: '', opponent: '', homeAway: '', competition: '' };
    body = '<form data-form="match" class="form"' + (em ? ' data-sid="' + esc(em.id) + '"' : '') + '><div class="fgroup">' + field('Opponent', '<input type="text" name="opponent" required maxlength="50" value="' + esc(dm.opponent) + '" placeholder="Team name">') + field('Date', '<input type="date" name="date" required value="' + esc(dm.date) + '">') + field('Kick-off', '<input type="time" name="time" value="' + esc(dm.time) + '">') +
      field('Home or away', '<select name="homeAway"><option value="">Not set</option><option value="home"' + (dm.homeAway === 'home' ? ' selected' : '') + '>Home</option><option value="away"' + (dm.homeAway === 'away' ? ' selected' : '') + '>Away</option></select>') + field('Venue', '<input type="text" name="venue" maxlength="50" value="' + esc(dm.venue) + '">') + field('Competition', '<input type="text" name="competition" maxlength="50" value="' + esc(dm.competition) + '" placeholder="League, cup, friendly">') + '</div><button class="btn fill" type="submit">' + (em ? 'Save' : 'Add match') + '</button></form>' +
      (em ? '<button class="btn red" data-a="deleteEvent" data-sid="' + esc(em.id) + '">' + (sh.confirm ? 'Tap again to delete this match' : 'Delete this match') + '</button>' : '');
  } else if (sh.t === 'log') {
    var ls = evById(sh.sid); if (!ls) return ''; title = 'Log attendance';
    var plan = planFor(ls, stats).ids; var going = goingIds(ls);
    body = '<form data-form="log" data-sid="' + esc(ls.id) + '" class="form"><p class="t2">' + esc(fmtLong(ls.date)) + '. Tick who came and the drills you ran. Everyone\u2019s skill stats update from this.</p>' +
      '<div class="col g8"><span class="flabel">Who came</span><div class="fgroup">' + players().map(function (p) { return checkRow('att', p.id, going.indexOf(p.id) >= 0, esc(p.name)); }).join('') + '</div></div>' +
      '<div class="col g8"><span class="flabel">Drills you ran</span><div class="fgroup">' + drillsArr().sort(function (x, y) { return (plan.indexOf(x.id) < 0) - (plan.indexOf(y.id) < 0) || x.name.localeCompare(y.name); }).map(function (d) { return checkRow('drill', d.id, plan.indexOf(d.id) >= 0, esc(d.name), esc((d.skills || []).join(', '))); }).join('') + '</div></div>' +
      '<button class="btn fill" type="submit">Save attendance</button></form>';
  } else if (sh.t === 'logMatch') {
    var lm = evById(sh.sid); if (!lm) return ''; title = 'Result';
    var att = lm.done ? (lm.attended || []) : goingIds(lm);
    body = '<form data-form="logMatch" data-sid="' + esc(lm.id) + '" class="form"><p class="t2">' + esc(evTitle(lm)) + ', ' + esc(fmtLong(lm.date)) + '</p><div class="fgroup">' + field(esc(TEAM), '<input type="number" name="for" min="0" max="99" required value="' + esc(lm.scoreFor == null ? '' : lm.scoreFor) + '" inputmode="numeric" placeholder="0">') + field(esc(lm.opponent || 'Opponent'), '<input type="number" name="against" min="0" max="99" required value="' + esc(lm.scoreAgainst == null ? '' : lm.scoreAgainst) + '" inputmode="numeric" placeholder="0">') + '</div>' +
      '<div class="col g8"><span class="flabel">Who played</span><div class="fgroup">' + players().map(function (p) { return checkRow('att', p.id, att.indexOf(p.id) >= 0, esc(p.name)); }).join('') + '</div></div>' +
      '<button class="btn fill" type="submit">Save result</button></form>' + (lm.done ? '<button class="btn" data-a="sheet" data-t="editMatch" data-sid="' + esc(lm.id) + '">Edit match details</button>' : '');
  } else if (sh.t === 'drillView') {
    var dv = S.drills[sh.did]; if (!dv) return ''; title = esc(dv.name);
    var t = selTraining(); var inPlan = t && planFor(t, stats).ids.indexOf(sh.did) >= 0;
    body = '<div class="chips"><span class="pill blue">' + (KIND_LABEL[dv.kind] || 'Drill') + '</span><span class="pill none">' + (+dv.mins || 0) + ' min</span>' + (dv.skills || []).map(function (k) { return '<span class="tag">' + esc(k) + '</span>'; }).join('') + (dv.own ? '<span class="tag">Yours</span>' : '') + '</div>' +
      (dv.setup ? '<div class="col g8"><h3>How it works</h3><p class="desc t2" style="line-height:1.55">' + esc(dv.setup) + '</p></div>' : '') +
      (dv.cue ? '<div class="col g8"><h3>Coaching point</h3><p class="t2" style="line-height:1.55">' + esc(dv.cue) + '</p></div>' : '') +
      (dv.link ? '<a class="btn tint" href="' + esc(dv.link) + '" target="_blank" rel="noopener">' + ic('play', 16, 2) + 'Watch the video or diagram</a>' : '') +
      (t ? (inPlan ? '<button class="btn" disabled>In the ' + esc(fmtD(t.date)) + ' plan</button>' : '<button class="btn fill" data-a="addToPlan" data-did="' + esc(sh.did) + '">Add to ' + esc(fmtD(t.date)) + '</button>') : '') + '<button class="btn" data-a="sheet" data-t="drill" data-did="' + esc(sh.did) + '">Edit drill</button>';
  } else if (sh.t === 'drill') {
    var dr = sh.did ? S.drills[sh.did] : null; title = dr ? 'Edit drill' : 'New drill'; dr = dr || { name: '', mins: 15, kind: 'drill', skills: [], setup: '', cue: '', link: '' };
    body = '<form data-form="drill" class="form"' + (sh.did ? ' data-did="' + esc(sh.did) + '"' : '') + (sh.addto ? ' data-addto="' + esc(sh.addto) + '"' : '') + '><div class="fgroup">' + field('Name', '<input type="text" name="name" required maxlength="60" value="' + esc(dr.name) + '" placeholder="For example, 3v2 overload">') + field('Minutes', '<input type="number" name="mins" min="5" max="60" step="5" value="' + esc(dr.mins) + '" inputmode="numeric">') + field('Type', '<select name="kind">' + [['warmup', 'Warm-up'], ['drill', 'Drill'], ['game', 'Game']].map(function (k) { return '<option value="' + k[0] + '"' + ((dr.kind || 'drill') === k[0] ? ' selected' : '') + '>' + k[1] + '</option>'; }).join('') + '</select>') + '</div>' +
      '<div class="col g8"><span class="flabel">Skills it trains</span><div class="chips" style="padding:0 4px">' + c.skills.map(function (k) { return '<label class="chip"><input type="checkbox" name="skills" value="' + esc(k) + '"' + ((dr.skills || []).indexOf(k) >= 0 ? ' checked' : '') + '>' + esc(k) + '</label>'; }).join('') + '</div></div>' +
      '<div class="fgroup">' + field('How it works', '<textarea name="setup" maxlength="1500" rows="5" placeholder="Setup, rules and progressions">' + esc(dr.setup || '') + '</textarea>', true) + field('Coaching point', '<input type="text" name="cue" maxlength="200" value="' + esc(dr.cue || '') + '" placeholder="The one thing to watch for">', true) + field('Video or diagram link', '<input type="text" inputmode="url" name="link" maxlength="500" placeholder="https://" value="' + esc(dr.link || '') + '">', true) + '</div>' +
      '<button class="btn fill" type="submit">' + (sh.addto ? 'Save and add to session' : 'Save drill') + '</button></form>' +
      (sh.did ? '<button class="btn red" data-a="deleteDrill" data-did="' + esc(sh.did) + '">' + (sh.confirm ? 'Tap again to delete this drill' : 'Delete this drill') + '</button>' : '');
  } else if (sh.t === 'pick') {
    var pt = selTraining(); if (!pt) return ''; title = 'Add drills';
    var cur = planFor(pt, stats).ids; var q = S.pickQ.toLowerCase();
    var all = drillsArr().filter(function (d) { return S.pickSkill === 'all' || (d.skills || []).indexOf(S.pickSkill) >= 0; });
    body = '<div class="search">' + ic('search', 17, 2.2) + '<input type="search" placeholder="Search drills" data-input="pickQ" value="' + esc(S.pickQ) + '" aria-label="Search drills"></div>' +
      '<div class="scroller">' + ['all'].concat(c.skills).map(function (k) { return '<button type="button" class="chip" data-a="pickSkill" data-v="' + esc(k) + '" aria-pressed="' + (S.pickSkill === k) + '">' + (k === 'all' ? 'All' : esc(k)) + '</button>'; }).join('') + '</div>' +
      [['own', 'Your drills'], ['warmup', 'Warm-ups'], ['drill', 'Drills'], ['game', 'Games']].map(function (k) {
        var items = all.filter(function (d) { return k[0] === 'own' ? d.own : (!d.own && (d.kind || 'drill') === k[0]); }).sort(function (x, y) { return x.name.localeCompare(y.name); });
        if (!items.length) return '';
        return '<div class="col g8 pkgroup"><span class="flabel">' + k[1] + '</span><div class="group">' + items.map(function (d) {
          var nm2 = (d.name + ' ' + (d.skills || []).join(' ')).toLowerCase(); var on = cur.indexOf(d.id) >= 0;
          return '<button class="cell pk' + (on ? ' on' : '') + '" data-a="pickAdd" data-did="' + esc(d.id) + '" data-name="' + esc(nm2) + '"' + (q && nm2.indexOf(q) < 0 ? ' hidden' : '') + ' aria-pressed="' + on + '"><span class="col grow g4"><span class="t1">' + esc(d.name) + '</span><span class="t2">' + drillMeta(d) + '</span></span><span class="tk">' + ic('check', 15, 3) + '</span></button>';
        }).join('') + '</div></div>';
      }).join('') +
      '<button class="btn tint" data-a="sheet" data-t="drill" data-addto="' + esc(pt.id) + '">' + ic('plus', 18, 2.4) + 'Create a new drill</button><button class="btn fill" data-a="close">Done</button>';
  } else if (sh.t === 'settings') {
    title = 'Settings';
    body = '<form data-form="settings" class="form"><div class="col g8"><span class="flabel">Skill tracking</span><div class="fgroup">' + field('Due after', '<input type="number" name="fresh" min="1" max="60" value="' + c.fresh + '" inputmode="numeric"><span class="l2">days</span>') + field('Overdue after', '<input type="number" name="overdue" min="2" max="90" value="' + c.overdue + '" inputmode="numeric"><span class="l2">days</span>') + field('Skills tracked', '<textarea name="skills" rows="2">' + esc(c.skills.join(', ')) + '</textarea>', true) + '</div><span class="note">Separate skills with commas. Renaming a skill starts its history again.</span></div>' +
      '<div class="col g8"><span class="flabel">Season</span><div class="fgroup">' + field('Session length', '<input type="number" name="sessionMins" min="30" max="180" step="5" value="' + c.sessionMins + '" inputmode="numeric"><span class="l2">min</span>') + field('Season ends', '<input type="date" name="seasonEnd" value="' + esc(c.seasonEnd) + '">') + '</div></div>' +
      '<div class="fgroup"><label class="field"><span class="grow" style="width:auto">Open squad link</span><input class="switch" type="checkbox" name="openAccess"' + (c.openAccess ? ' checked' : '') + '></label></div><span class="note" style="margin-top:-14px">On: players only need the website address. Off: they need the private team link.</span>' +
      '<button class="btn fill" type="submit">Save settings</button></form>';
  }
  return '<div class="scrim" data-a="close"><div class="sheet" role="dialog" aria-modal="true" aria-label="' + title + '"><div class="sheet-h"><h2>' + title + '</h2><button class="ibtn" data-a="close" aria-label="Close">' + ic('x', 16, 2.6) + '</button></div>' + body + '</div></div>';
}

/* ---------- gate screens ---------- */
function screen(html) { document.body.classList.remove('side'); document.getElementById('tabs').innerHTML = ''; document.getElementById('sheet').innerHTML = ''; document.getElementById('app').innerHTML = html; }
function gateHead(title, sub) { return '<div class="head"><img class="logo" src="logo.jpg" alt=""><span class="hsub">' + esc(TEAM) + '</span><h1 class="lt">' + title + '</h1>' + (sub ? '<p class="t2">' + sub + '</p>' : '') + '</div>'; }
function viewGate() {
  if (S.phase === 'setup') return screen('<div class="gate">' + gateHead('Almost there', 'Add your Supabase project URL and publishable key to config.js, then upload the site again.') + '</div>');
  if (S.phase === 'error') return screen('<div class="gate">' + gateHead('Can\u2019t connect', esc(S.errMsg || 'Check your connection, then try again.')) + '<button class="btn fill" data-a="retry">Try again</button></div>');
  if (S.phase === 'nolink') return screen('<form class="gate" data-form="teamcode">' + gateHead('Open the team link', esc(S.errMsg || 'Open the link your coach shared, or paste it below.')) + '<div class="fgroup">' + field('Link', '<input type="text" name="code" required autocomplete="off" placeholder="https://">') + '</div><button class="btn fill" type="submit">Continue</button></form>');
  if (S.phase === 'notadmin') return screen('<div class="gate">' + gateHead('Not a coach yet', esc(S.email) + ' is signed in but hasn\u2019t been invited as a coach. Ask a coach to invite this email in Overview, Coaches.') + '<button class="btn" data-a="logout">Sign out</button></div>');
  if (S.phase === 'setpw') return screen('<form class="gate" data-form="setpw">' + gateHead('Set your password', esc(S.email) + ': choose the password you\u2019ll use for the coach app.') + '<input type="email" name="username" value="' + esc(S.email) + '" autocomplete="username" hidden><div class="fgroup">' + field('Password', '<input type="password" name="pw" required minlength="8" autocomplete="new-password" placeholder="At least 8 characters">') + field('Confirm', '<input type="password" name="pw2" required minlength="8" autocomplete="new-password">') + '</div><button class="btn fill" type="submit">Save password</button></form>');
  if (S.phase === 'login') {
    var nw = S.loginMode === 'new';
    return screen('<form class="gate" data-form="' + (nw ? 'signup' : 'login') + '">' + gateHead(nw ? 'New coach' : 'Coach sign in', nw ? 'Use the email a coach invited. You\u2019ll get an email to confirm it.' : '') +
      '<div class="seg lg" role="group" aria-label="Sign in or create a login"><button type="button" data-a="loginMode" data-v="in" aria-pressed="' + !nw + '">Sign in</button><button type="button" data-a="loginMode" data-v="new" aria-pressed="' + nw + '">New coach</button></div>' +
      (S.errMsg ? '<div class="hint">' + esc(S.errMsg) + '</div>' : '') +
      '<div class="fgroup">' + field('Email', '<input type="email" name="email" required autocomplete="username" placeholder="you@example.com">') + field('Password', '<input type="password" name="password" required ' + (nw ? 'minlength="8" autocomplete="new-password" placeholder="At least 8 characters"' : 'autocomplete="current-password"') + '>') + '</div>' +
      '<button class="btn fill" type="submit">' + (nw ? 'Create login' : 'Sign in') + '</button>' + (nw ? '' : '<button class="btn plain" type="button" data-a="forgot">Forgot password?</button>') + '</form>');
  }
  return screen('<div class="gate"><p class="t2" style="text-align:center">Loading\u2026</p></div>');
}

/* ---------- render ---------- */
function typing() { var a = document.activeElement; return a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && a.type !== 'checkbox' && a.type !== 'radio'; }
document.addEventListener('focusout', function () { setTimeout(function () { if (S.pending && !typing()) { S.pending = false; render(); } }, 0); });
function renderMain(stats) {
  var showTabs = isCoach() || S.me;
  document.body.classList.toggle('side', !!showTabs);
  var activeTab = S.tab === 'stats' && isCoach() ? 'players' : S.tab;
  document.getElementById('tabs').innerHTML = showTabs ? '<div class="in"><div class="brand"><img class="logo sm" src="logo.jpg" alt=""><span>' + esc(TEAM) + (isCoach() ? '<br><span class="fn">Coach</span>' : '') + '</span></div>' + TABS.map(function (t) { return '<a href="#' + t[0] + '"' + (t[3] ? ' class="donly"' : '') + (activeTab === t[0] ? ' aria-current="page"' : '') + '>' + svg(I[t[2]], 25, 1.8) + '<span>' + t[1] + '</span></a>'; }).join('') + '</div>' : '';
  var views = { home: viewHome, calendar: viewCalendar, training: viewTraining, matches: viewMatches, drills: viewDrills, stats: viewStats, coach: viewCoach, players: viewPlayers };
  var v = views[S.tab] || (isCoach() ? viewCoach : viewHome);
  if (!isCoach() && !S.me) v = viewWho;
  if (!isCoach() && (S.tab === 'drills' || S.tab === 'players' || S.tab === 'coach')) v = viewHome;
  var y = window.scrollY;
  document.getElementById('app').innerHTML = v(stats);
  window.scrollTo(0, y);
}
function render(force) {
  if (S.phase !== 'ready') return viewGate();
  if (!force && typing()) { S.pending = true; return; }
  var stats = computeStats();
  renderMain(stats);
  var key = JSON.stringify(S.sheet); var host = document.getElementById('sheet');
  if (force || key !== S.sheetKey || !host.querySelector('form')) {
    var sc = host.querySelector('.sheet'); var top = sc && key === S.sheetKey ? sc.scrollTop : 0;
    host.innerHTML = sheetHTML(stats); S.sheetKey = key;
    var sc2 = host.querySelector('.sheet'); if (sc2 && top) sc2.scrollTop = top;
  }
}
function route() {
  var h = (location.hash || '').replace('#', '');
  if (/access_token|error_description/.test(h)) return;
  S.tab = ROUTES.indexOf(h) >= 0 ? h : TABS[0][0]; S.open = -1; S.sheet = null; window.scrollTo(0, 0); render(true);
}
window.addEventListener('hashchange', route);

/* ---------- events ---------- */
function openSheet(t, extra) { S.sheet = Object.assign({ t: t }, extra || {}); render(true); }
function closeSheet() { S.sheet = null; render(true); }
function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () { toast('Link copied'); }, function () { toast('Couldn\u2019t copy. Press and hold the link to copy it.'); });
  } else toast('Press and hold the link to copy it.');
}
function ownWork(t, stats) { var pl = planFor(t, stats); return pl.ids.slice(); }
document.addEventListener('click', function (e) {
  var el = e.target.closest('[data-a]'); if (!el) return;
  var a = el.dataset.a;
  if (a === 'close') { if (el.classList.contains('scrim') && e.target !== el) return; closeSheet(); return; }
  if (el.tagName === 'A') return;
  e.preventDefault();
  var stats = computeStats(); var t = selTraining();
  if (a === 'retry') { location.reload(); }
  else if (a === 'logout') { sb.auth.signOut().then(function () { S.phase = 'login'; render(); }); }
  else if (a === 'loginMode') { S.loginMode = el.dataset.v; S.errMsg = ''; render(); }
  else if (a === 'forgot') {
    var em = (document.querySelector('input[name=email]') || {}).value || '';
    if (!/@/.test(em)) { toast('Type your email above, then tap Forgot password.'); return; }
    sb.auth.resetPasswordForEmail(em.trim(), { redirectTo: location.origin + location.pathname }).then(function (r) { toast(r.error ? (r.error.message || 'Couldn\u2019t send the email.') : 'Check your email for a link to set a new password.'); });
  }
  else if (a === 'install') { if (installEvt) { installEvt.prompt(); installEvt.userChoice.then(function () { installEvt = null; render(true); }); } }
  else if (a === 'installHide') { store('futsal_install_hide', '1'); render(true); }
  else if (a === 'iam') { openSheet('confirmMe', { pid: el.dataset.pid }); }
  else if (a === 'iamYes') { S.sheet = null; S.me = el.dataset.pid; store('futsal_me', S.me); S.tab = 'home'; if (location.hash && location.hash !== '#home') location.hash = '#home'; render(true); }
  else if (a === 'notmeAsk') { openSheet('notme'); }
  else if (a === 'notme') { flushAll(); S.sheet = null; S.me = null; store('futsal_me', null); S.tab = 'home'; render(true); }
  else if (a === 'rsvp') { haptic(); saveAnswers(el.dataset.pid, [el.dataset.sid], el.dataset.v); }
  else if (a === 'cycleDay') {
    if (!S.me) return; var day = el.dataset.day; if (day < todayStr()) return;
    var nv = nextStatus(dayStatus(S.me, day)); haptic(); S.pop = day; setDay(S.me, day, nv); render(true);
    clearTimeout(S.popT); S.popT = setTimeout(function () { S.pop = null; }, 400);
  }
  else if (a === 'allyes') { var ds = (el.dataset.days || '').split(',').filter(Boolean); ds.forEach(function (d) { setDay(S.me, d, 'going'); }); haptic(); render(true); toast('Yes to ' + plural(ds.length, 'session')); }
  else if (a === 'month') { S.calMonth = shiftMonth(S.calMonth, +el.dataset.v); S.calDay = null; render(true); }
  else if (a === 'pickDay') { S.calDay = el.dataset.day; render(true); }
  else if (a === 'gotoEv') { var ev = evById(el.dataset.sid); if (!ev) return; if (ev.kind === 'match') location.hash = '#matches'; else { S.selTrain = ev.id; location.hash = '#training'; } }
  else if (a === 'pickTrain') { S.selTrain = el.dataset.sid; S.open = -1; render(true); }
  else if (a === 'drillFilter') { S.drillFilter = el.dataset.v; render(true); }
  else if (a === 'pickSkill') { S.pickSkill = el.dataset.v; render(true); }
  else if (a === 'scope') { S.scope = el.dataset.v; render(true); }
  else if (a === 'toggle') { var ix = +el.dataset.i; S.open = S.open === ix ? -1 : ix; render(true); }
  else if (a === 'sheet') { openSheet(el.dataset.t, { pid: el.dataset.pid, did: el.dataset.did, sid: el.dataset.sid, date: el.dataset.date, addto: el.dataset.addto }); }
  else if (a === 'viewPlayer') { S.statPid = el.dataset.pid; S.sheet = null; if (S.tab === 'stats') render(true); else location.hash = '#stats'; }
  else if (a === 'copy') { copyText(el.dataset.link); }
  else if (a === 'share') { navigator.share({ title: TEAM, text: TEAM + ': tap your name, then mark the days you can play', url: el.dataset.link }).catch(function () {}); }
  else if (a === 'mode' && t) { S.mode[t.id] = el.dataset.v; delete S.work[t.id]; S.open = -1; render(true); }
  else if (a === 'blk' && t) {
    var arr = ownWork(t, stats); var bi = +el.dataset.i; var v = el.dataset.v;
    if (v === 'up' && bi > 0) { var x1 = arr[bi - 1]; arr[bi - 1] = arr[bi]; arr[bi] = x1; }
    else if (v === 'down' && bi < arr.length - 1) { var x2 = arr[bi + 1]; arr[bi + 1] = arr[bi]; arr[bi] = x2; }
    else if (v === 'del') arr.splice(bi, 1);
    S.work[t.id] = arr; render(true);
  }
  else if (a === 'pickAdd' && t) {
    S.mode[t.id] = 'own';
    var w = ownWork(t, stats); var did = el.dataset.did; var at = w.indexOf(did);
    if (at >= 0) w.splice(at, 1); else w.push(did);
    S.work[t.id] = w; haptic();
    el.classList.toggle('on', at < 0); el.setAttribute('aria-pressed', String(at < 0));
    renderMain(computeStats());
  }
  else if (a === 'saveOwn' && t) {
    var ids0 = ownWork(t, stats); if (!ids0.length) { toast('Add at least one drill.'); return; }
    run(function () { return sb.from('sessions').update({ plan: ids0, custom: true }).eq('id', t.id).then(must); }, 'Session saved').then(function (ok) { if (ok) { delete S.work[t.id]; S.mode[t.id] = 'own'; render(true); } });
  }
  else if (a === 'clearOwn' && t) { S.work[t.id] = []; render(true); }
  else if (a === 'addToPlan') {
    if (!t) { toast('Add a training session first.'); return; }
    var pids = planFor(t, stats).ids.slice(); if (pids.indexOf(el.dataset.did) < 0) {
      var gi = pids.findIndex(function (x) { return (S.drills[x] || {}).kind === 'game'; });
      if (gi >= 0) pids.splice(gi, 0, el.dataset.did); else pids.push(el.dataset.did);
    }
    var asOwn = trainMode(t) === 'own';
    run(function () { return sb.from('sessions').update({ plan: pids, custom: asOwn }).eq('id', t.id).then(must); }, 'Added to the ' + fmtD(t.date) + ' plan').then(function (ok) { if (ok) { delete S.work[t.id]; render(true); } });
  }
  else if (a === 'swap' && t) {
    var cur = planFor(t, stats).ids.slice(); var i2 = +el.dataset.i; var dd = S.drills[cur[i2]]; if (!dd) return;
    var wm = weights(basisFor(t), stats);
    var alts = drillsArr().filter(function (x) { return (x.kind || 'drill') === (dd.kind || 'drill') && (x.id === cur[i2] || cur.indexOf(x.id) < 0); }).sort(function (a2, b2) { return drillScore(b2, wm) - drillScore(a2, wm) || a2.name.localeCompare(b2.name); });
    if (alts.length < 2) { toast('Nothing else of that type to swap in. Add more in Drills.'); return; }
    var k = alts.findIndex(function (x) { return x.id === cur[i2]; }); cur[i2] = alts[(k + 1) % alts.length].id; S.work[t.id] = cur; render(true);
  }
  else if (a === 'removeBlock' && t) { var c2 = planFor(t, stats).ids.slice(); c2.splice(+el.dataset.i, 1); S.work[t.id] = c2; S.open = -1; render(true); }
  else if (a === 'savePlan' && t) { var ids2 = planFor(t, stats).ids.slice(); run(function () { return sb.from('sessions').update({ plan: ids2, custom: false }).eq('id', t.id).then(must); }, 'Plan saved').then(function (ok) { if (ok) { delete S.work[t.id]; render(true); } }); }
  else if (a === 'resetPlan' && t) { run(function () { return sb.from('sessions').update({ plan: [], custom: false }).eq('id', t.id).then(must); }, 'New plan suggested'); }
  else if (a === 'delInvite') { var de = el.dataset.email; run(function () { return sb.from('coach_invites').delete().eq('email', de).then(must); }, 'Invite cancelled'); }
  else if (a === 'deletePlayer') {
    if (!S.sheet.confirm) { S.sheet.confirm = true; render(true); return; }
    var dp = el.dataset.pid; run(function () { return sb.from('players').delete().eq('id', dp).then(must); }, 'Player removed').then(function (ok) { if (ok) { closeSheet(); if (S.tab === 'stats') location.hash = '#players'; } });
  }
  else if (a === 'deleteEvent') {
    if (!S.sheet.confirm) { S.sheet.confirm = true; render(true); return; }
    var dsid = el.dataset.sid; run(function () { return sb.from('sessions').delete().eq('id', dsid).then(must); }, 'Deleted').then(function (ok) { if (ok) { S.selTrain = null; closeSheet(); } });
  }
  else if (a === 'deleteDrill') {
    if (!S.sheet.confirm) { S.sheet.confirm = true; render(true); return; }
    var dl = el.dataset.did; Object.keys(S.work).forEach(function (k2) { S.work[k2] = S.work[k2].filter(function (x) { return x !== dl; }); });
    run(function () { return sb.from('drills').delete().eq('id', dl).then(must); }, 'Drill deleted').then(function (ok) { if (ok) closeSheet(); });
  }
});
document.addEventListener('input', function (e) {
  var k = e.target.dataset && e.target.dataset.input; if (!k) return;
  var q = e.target.value.toLowerCase().trim(); S[k] = e.target.value;
  var sel = k === 'pickQ' ? '#sheet .pk' : '#app .lib';
  document.querySelectorAll(sel).forEach(function (r) { r.hidden = !!q && r.dataset.name.indexOf(q) < 0; });
  document.querySelectorAll(k === 'pickQ' ? '#sheet .pkgroup' : '#app .libgroup').forEach(function (g) { var sec2 = g.closest('.sec') || g; sec2.hidden = !g.querySelector('[data-name]:not([hidden])'); });
});
document.addEventListener('submit', function (e) {
  var f = e.target; var t = f.dataset.form; if (!t) return; e.preventDefault();
  var fd = new FormData(f); function g(n) { return String(fd.get(n) || '').trim(); }
  if (t === 'setpw') {
    var pw = String(fd.get('pw') || ''), pw2 = String(fd.get('pw2') || '');
    if (pw.length < 8) { toast('Use at least 8 characters.'); return; }
    if (pw !== pw2) { toast('The two passwords don\u2019t match.'); return; }
    var b2 = f.querySelector('button[type=submit]'); b2.disabled = true;
    sb.auth.updateUser({ password: pw }).then(function (r) { b2.disabled = false; if (r.error) { toast(r.error.message || 'Couldn\u2019t save the password.'); return; } toast('Password saved'); S.needPassword = false; startAdmin(); });
    return;
  }
  if (t === 'teamcode') {
    var m = g('code').match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    if (!m) { toast('That doesn\u2019t look like the team link. Copy the whole link your coach sent.'); return; }
    store('futsal_team', m[0]); location.href = location.pathname + '?t=' + m[0];
    return;
  }
  if (t === 'login') {
    var btn = f.querySelector('button[type=submit]'); btn.disabled = true;
    sb.auth.signInWithPassword({ email: g('email'), password: String(fd.get('password') || '') }).then(function (r) { btn.disabled = false; if (r.error) { toast(r.error.message || 'Sign in failed'); return; } S.errMsg = ''; startAdmin(); });
  }
  else if (t === 'signup') {
    var pw3 = String(fd.get('password') || ''); if (pw3.length < 8) { toast('Use at least 8 characters.'); return; }
    var btn2 = f.querySelector('button[type=submit]'); btn2.disabled = true;
    sb.auth.signUp({ email: g('email'), password: pw3, options: { emailRedirectTo: location.origin + location.pathname } }).then(function (r) {
      btn2.disabled = false;
      if (r.error) { toast(/not allowed|disabled/i.test(r.error.message || '') ? 'New coach logins are switched off. Ask a coach to invite you.' : (r.error.message || 'Couldn\u2019t create the login.')); return; }
      if (r.data && r.data.session) { startAdmin(); return; }
      S.loginMode = 'in'; S.errMsg = 'Check your email and tap the confirmation link, then sign in here.'; render();
    });
  }
  else if (t === 'invite') {
    var ie = g('email').toLowerCase(); if (!/@/.test(ie)) return;
    run(function () { return sb.from('coach_invites').upsert({ email: ie }).then(must); }, ie + ' invited').then(function (ok) { if (ok) render(true); });
  }
  else if (t === 'addPlayer') {
    var nm = g('name'); if (!nm) return;
    run(function () { return sb.from('players').insert({ name: nm, pos: g('pos') }).then(must); }, nm + ' added').then(function (ok) { if (ok) { var fo = document.querySelector('#sheet form[data-form=addPlayer]'); if (fo) { fo.reset(); var inp = fo.querySelector('input[name=name]'); if (inp) inp.focus(); } } });
  }
  else if (t === 'editPlayer') {
    var pid = f.dataset.pid;
    run(function () { return sb.from('players').update({ name: g('name'), pos: g('pos') }).eq('id', pid).then(must); }, 'Saved').then(function (ok) { if (ok) closeSheet(); });
  }
  else if (t === 'training') {
    var st = g('time'), en = g('endTime');
    var mins = 90; if (st && en) { var a1 = st.split(':'), b1 = en.split(':'); mins = Math.max(30, ((+b1[0]) * 60 + (+b1[1])) - ((+a1[0]) * 60 + (+a1[1]))); }
    var data = { kind: 'training', title: g('title') || 'Training', date: g('date'), time: st, end_time: en, venue: g('venue'), mins: mins };
    if (!data.date) return; var sid = f.dataset.sid || null; var season = g('repeat') === 'season'; var wantOwn = g('plan') === 'own';
    var dates = [data.date]; if (season) { var end = cfg().seasonEnd; dates = []; for (var dd = data.date; dd <= end && dates.length < 60; dd = addDays(dd, 7)) dates.push(dd); }
    var existing = {}; eventsArr().forEach(function (x) { if (x.kind === 'training') existing[x.date] = 1; });
    run(function () {
      if (sid) return sb.from('sessions').update(data).eq('id', sid).then(must);
      var rows = dates.filter(function (d) { return !season || !existing[d]; }).map(function (d) { return Object.assign({}, data, { date: d }); });
      if (!rows.length) return Promise.resolve();
      return sb.from('sessions').insert(rows).select('id').then(function (r) { var d = must(r); sid = d && d[0] && d[0].id; });
    }, f.dataset.sid ? 'Session updated' : (season ? 'Weekly sessions added until the end of the season' : 'Training added')).then(function (ok) {
      if (!ok) return;
      if (sid) S.selTrain = sid;
      if (!f.dataset.sid && sid && wantOwn) { S.mode[sid] = 'own'; S.sheet = null; if (S.tab !== 'training') location.hash = '#training'; else render(true); return; }
      closeSheet();
    });
  }
  else if (t === 'match') {
    var md = { kind: 'match', title: 'Match', opponent: g('opponent'), date: g('date'), time: g('time'), venue: g('venue'), home_away: g('homeAway'), competition: g('competition'), mins: 60 };
    if (!md.date || !md.opponent) return; var msid = f.dataset.sid || null;
    run(function () { return (msid ? sb.from('sessions').update(md).eq('id', msid) : sb.from('sessions').insert(md)).then(must); }, msid ? 'Match updated' : 'Match added').then(function (ok) { if (ok) closeSheet(); });
  }
  else if (t === 'log') {
    var sid2 = f.dataset.sid; var att = fd.getAll('att').map(String); var drs = fd.getAll('drill').map(String);
    if (!drs.length) { toast('Tick at least one drill.'); return; }
    run(function () { return sb.from('sessions').update({ done: true, attended: att, drills_done: drs, plan: drs }).eq('id', sid2).then(must); }, 'Attendance saved. Stats updated.').then(function (ok) { if (ok) { delete S.work[sid2]; S.selTrain = null; closeSheet(); } });
  }
  else if (t === 'logMatch') {
    var sid3 = f.dataset.sid; var att3 = fd.getAll('att').map(String);
    var sf = parseInt(g('for'), 10), sa = parseInt(g('against'), 10);
    if (isNaN(sf) || isNaN(sa)) { toast('Enter both scores.'); return; }
    run(function () { return sb.from('sessions').update({ done: true, attended: att3, score_for: sf, score_against: sa }).eq('id', sid3).then(must); }, 'Result saved').then(function (ok) { if (ok) closeSheet(); });
  }
  else if (t === 'drill') {
    var sk = fd.getAll('skills').map(String); if (!sk.length) { toast('Pick at least one skill.'); return; }
    var link = g('link'); if (link && !/^https?:\/\//i.test(link)) link = 'https://' + link;
    var d = { name: g('name'), mins: +g('mins') || 15, kind: g('kind') || 'drill', skills: sk, setup: g('setup'), cue: g('cue'), link: link }; var did = f.dataset.did; var addto = f.dataset.addto; var newId = null;
    if (!did) d.own = true;
    run(function () { return (did ? sb.from('drills').update(d).eq('id', did) : sb.from('drills').insert(d).select('id')).then(function (r) { var x = must(r); newId = did || (x && x[0] && x[0].id); }); }, addto ? 'Drill saved and added' : 'Drill saved').then(function (ok) {
      if (!ok) return;
      var tt = addto && evById(addto);
      if (tt && newId) { S.selTrain = tt.id; S.mode[tt.id] = 'own'; var w2 = ownWork(tt, computeStats()); if (w2.indexOf(newId) < 0) w2.push(newId); S.work[tt.id] = w2; S.sheet = null; if (S.tab !== 'training') location.hash = '#training'; else render(true); return; }
      closeSheet();
    });
  }
  else if (t === 'settings') {
    var fr = Math.max(1, +g('fresh') || 7); var ov = Math.max(fr + 1, +g('overdue') || 14);
    var skills = g('skills').split(',').map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 12);
    var upd = { fresh: fr, overdue: ov, session_mins: +g('sessionMins') || 90, skills: skills.length ? skills : DEFAULT_SKILLS }; if (g('seasonEnd')) upd.season_end = g('seasonEnd'); upd.open_access = fd.get('openAccess') != null;
    run(function () { return sb.from('settings').update(upd).eq('id', 1).then(must); }, 'Settings saved').then(function (ok) { if (ok) closeSheet(); });
  }
});
document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && S.sheet) closeSheet(); });

/* ---------- boot ---------- */
async function startAdmin() {
  try {
    var u = await sb.auth.getUser();
    if (!u.data || !u.data.user) {
      if (S.linkError) { S.errMsg = 'That email link has expired or was already used. Tap Forgot password to get a new one.'; try { history.replaceState(null, '', location.pathname); } catch (e) {} }
      S.phase = 'login'; render(); return;
    }
    S.email = u.data.user.email || '';
    if (/access_token|error_description/.test(location.hash)) { try { history.replaceState(null, '', location.pathname); } catch (e) {} }
    if (S.needPassword) { S.phase = 'setpw'; render(); return; }
    var isA = must(await sb.rpc('is_admin'));
    if (!isA) { S.phase = 'notadmin'; render(); return; }
    await reload();
  } catch (e) { S.phase = 'error'; S.errMsg = e && e.message; render(); }
}
async function startPlayer() {
  var params = new URLSearchParams(location.search);
  var tok = params.get('t') || load('futsal_team');
  if (tok && !/^[0-9a-f-]{36}$/i.test(tok)) tok = null;
  if (tok) store('futsal_team', tok);
  S.team = tok || null; S.me = load('futsal_me');
  try { await reload(); } catch (e) { S.phase = 'error'; S.errMsg = e && e.message; render(); }
}
function refreshQuietly() {
  if (S.phase !== 'ready' || S.sheet || S.busy || pending || typing() || document.visibilityState !== 'visible') return;
  reload().catch(function () {});
}
document.title = TEAM + (MODE === 'admin' ? ' Coach' : '');
if ('serviceWorker' in navigator && location.protocol === 'https:') { window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); }); }
if (!window.supabase || !CFG.SUPABASE_URL || /YOUR-/.test(CFG.SUPABASE_URL + CFG.SUPABASE_KEY)) {
  S.phase = window.supabase ? 'setup' : 'error'; if (!window.supabase) S.errMsg = 'Couldn\u2019t load the app. Check your connection and refresh.'; render();
} else {
  var authHash = location.hash || '';
  S.needPassword = /type=(invite|recovery|magiclink)/.test(authHash);
  S.linkError = /error_description=([^&]+)/.exec(authHash);
  sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_KEY);
  sb.auth.onAuthStateChange(function (ev) { if (ev === 'PASSWORD_RECOVERY') { S.needPassword = true; S.phase = 'setpw'; render(); } });
  var h0 = (location.hash || '').replace('#', ''); if (ROUTES.indexOf(h0) >= 0) S.tab = h0;
  if (MODE === 'admin') startAdmin(); else startPlayer();
  setInterval(refreshQuietly, 30000);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') flushAll(); else refreshQuietly(); });
  window.addEventListener('pagehide', flushAll);
}
})();
