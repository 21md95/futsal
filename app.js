/* Futsal Squad v3: player view (index.html) and coach view (admin.html). */
(function () {
'use strict';
var MODE = document.body.dataset.mode === 'admin' ? 'admin' : 'player';
var CFG = window.FUTSAL_CONFIG || {};
var TEAM = CFG.TEAM_NAME || 'Futsal Squad';
var DEFAULT_SKILLS = ['Dribbling', 'Passing', 'Shooting', 'First touch', 'Defending', 'Fitness'];
var POSITIONS = ['Goalkeeper', 'Fixo', 'Ala', 'Pivot'];
var DOW_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
var C = { fresh: '#8DB0FF', due: '#FFB020', overdue: '#FF5A5F', never: '#FF5A5F' };
var LEVEL_LABEL = { fresh: 'Fresh', due: 'Due soon', overdue: 'Overdue', never: 'Not trained yet' };
var W = { fresh: 0, due: 1, overdue: 2, never: 2 };
var ANSWER = { going: 'Yes', maybe: 'Maybe', out: 'No' };
var ICONS = {
  home: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  squad: 'M16 20v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 20v-1a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  training: 'M9 3h6v3H9zM7 4.5H5V21h14V4.5h-2M8 11h8M8 15h5',
  matches: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7l3.5 2.5-1.3 4h-4.4l-1.3-4zM12 3v4M20.5 9.5h-5M3.5 9.5h5M7 19l2.8-5.5M17 19l-2.8-5.5',
  drills: 'M4 6h16M4 12h16M4 18h10',
  stats: 'M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10',
  coach: 'M4 20V11M10 20V4M16 20v-8M2 20h20'
};
var TABS = MODE === 'admin'
  ? [['coach', 'Overview'], ['calendar', 'Availability'], ['training', 'Training'], ['matches', 'Matches'], ['drills', 'Drills']]
  : [['home', 'Home'], ['calendar', 'Calendar'], ['training', 'Training'], ['matches', 'Matches'], ['stats', 'Me']];
var ROUTES = TABS.map(function (t) { return t[0]; }).concat(['stats', 'players']);
var COURT = '<svg class="lines" viewBox="0 0 400 220" preserveAspectRatio="none" aria-hidden="true" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="2"><rect x="12" y="12" width="376" height="196" rx="2"/><line x1="200" y1="12" x2="200" y2="208"/><circle cx="200" cy="110" r="34"/><circle cx="200" cy="110" r="2.5" fill="#fff" fill-opacity=".3"/><path d="M12 50a60 60 0 0 1 0 120M388 50a60 60 0 0 0 0 120"/></svg>';

var sb = null;
var S = {
  phase: 'loading', me: null, team: null, email: '', admins: [],
  players: {}, avail: {}, events: {}, drills: {}, config: null,
  tab: TABS[0][0], selSid: null, selTrain: null, calMonth: null, calSid: null, statPid: null, drillFilter: 'all', scope: 'session',
  open: -1, work: {}, sheet: null, busy: false, errMsg: ''
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
  return a + '–' + b;
}
function addMins(t, m) { var p = String(t || '19:00').split(':'); var x = (+p[0]) * 60 + (+p[1] || 0) + m; return pad(Math.floor(x / 60) % 24) + ':' + pad(x % 60); }
function svg(d, size, sw) { return '<svg width="' + (size || 24) + '" height="' + (size || 24) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (sw || 1.8) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"></path></svg>'; }
function uuid() { if (window.crypto && crypto.randomUUID) return crypto.randomUUID(); var b = crypto.getRandomValues(new Uint8Array(16)); b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128; var h = Array.prototype.map.call(b, function (x) { return (x + 256).toString(16).slice(1); }).join(''); return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20); }
function initials(n) { var p = String(n || '?').trim().split(/\s+/); return ((p[0] || '?')[0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase(); }
function first(n) { return String(n || '').split(' ')[0]; }
function store(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }
function cfg() { var c = S.config || {}; return { skills: (c.skills && c.skills.length) ? c.skills : DEFAULT_SKILLS, fresh: +c.fresh || 7, overdue: +c.overdue || 14, sessionMins: +c.sessionMins || 90, teamToken: c.teamToken || null, seasonEnd: c.seasonEnd || '2027-06-30', openAccess: c.openAccess !== false }; }
function isCoach() { return MODE === 'admin'; }
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
function planFor(e, stats) {
  if (S.work[e.id]) return { ids: S.work[e.id], saved: false, changed: true };
  if (e.plan && e.plan.length) return { ids: e.plan, saved: true, changed: false };
  return { ids: recommend(+e.mins || cfg().sessionMins, basisFor(e), stats), saved: false, changed: false };
}

/* ---------- data ---------- */
function must(r) { if (r.error) throw r.error; return r.data; }
function ingest(b) {
  S.players = {}; (b.players || []).forEach(function (p) { S.players[p.id] = { name: p.name, pos: p.pos || '' }; });
  S.events = {}; (b.sessions || []).forEach(function (s) {
    S.events[s.id] = { kind: s.kind || 'training', title: s.title, date: String(s.date).slice(0, 10), time: s.time || '', endTime: s.end_time || '', venue: s.venue || '', mins: s.mins, plan: s.plan || [], done: !!s.done, attended: s.attended || [], drillsDone: s.drills_done || [],
      opponent: s.opponent || '', homeAway: s.home_away || '', competition: s.competition || '', scoreFor: s.score_for, scoreAgainst: s.score_against };
  });
  S.avail = {}; (b.availability || []).forEach(function (a) { (S.avail[a.player_id] = S.avail[a.player_id] || {})[a.session_id] = a.status; });
  S.drills = {}; (b.drills || []).forEach(function (d) { S.drills[d.id] = { name: d.name, mins: d.mins, kind: d.kind, skills: d.skills || [], setup: d.setup || '', cue: d.cue || '', link: d.link || '' }; });
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
      sb.rpc('list_admins')
    ]);
    ingest({ players: must(r[0]), sessions: must(r[1]), availability: must(r[2]), drills: must(r[3]), settings: must(r[4]) });
    S.admins = (r[5] && !r[5].error && r[5].data) ? r[5].data.map(function (x) { return x.email; }) : [];
  } else {
    var b = must(await sb.rpc('team_bundle', { p_team: S.team }));
    if (!b && S.team) { store('futsal_team', null); S.team = null; b = must(await sb.rpc('team_bundle', { p_team: null })); }
    if (!b) { S.phase = 'nolink'; S.errMsg = 'The squad page is locked. Paste the team link your coach sent you.'; render(true); return; }
    ingest(b);
    if (S.me && !S.players[S.me]) { S.me = null; store('futsal_me', null); }
  }
  S.phase = 'ready'; render();
}
function toast(msg) { var t = document.getElementById('toast'); t.innerHTML = '<div class="toast">' + esc(msg) + '</div>'; clearTimeout(toast._t); toast._t = setTimeout(function () { t.innerHTML = ''; }, 3200); }
async function run(fn, okMsg) {
  if (S.busy) return false;
  S.busy = true;
  try { await fn(); if (okMsg) toast(okMsg); S.busy = false; await reload(); return true; }
  catch (e) { S.busy = false; toast((e && e.message) ? e.message : 'Couldn’t save. Check your connection and try again.'); try { await reload(); } catch (e2) {} return false; }
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

/* ---------- shared pieces ---------- */
function yn(pid, e, small) {
  var cur = rsvp(pid, e);
  return '<div class="yn' + (small ? ' sm' : '') + '" role="group" aria-label="Can you make ' + esc(evTitle(e) + ', ' + fmtD(e.date)) + '?">' + [['going', 'Yes'], ['maybe', 'Maybe'], ['out', 'No']].map(function (o) {
    return '<button type="button" data-a="rsvp" data-pid="' + esc(pid) + '" data-sid="' + esc(e.id) + '" data-v="' + o[0] + '" aria-pressed="' + (cur === o[0]) + '">' + o[1] + '</button>';
  }).join('') + '</div>';
}
function counts(e) { var c = { going: 0, maybe: 0, out: 0, none: 0 }; players().forEach(function (p) { var r = rsvp(p.id, e); c[r || 'none']++; }); return c; }
function pill(st) { return '<span class="pill ' + (st || 'none') + '">' + (st ? ANSWER[st] : 'No answer') + '</span>'; }
function stackBar(c) {
  return '<div class="stack" role="img" aria-label="' + c.going + ' yes, ' + c.maybe + ' maybe, ' + c.out + ' no, ' + c.none + ' no answer">' +
    (c.going ? '<span style="flex:' + c.going + ';background:var(--blue)"></span>' : '') + (c.maybe ? '<span style="flex:' + c.maybe + ';background:var(--maybe)"></span>' : '') +
    (c.out ? '<span style="flex:' + c.out + ';background:var(--no)"></span>' : '') + (c.none ? '<span style="flex:' + c.none + ';background:var(--raised)"></span>' : '') + '</div>';
}
function legendAnswers() { return '<div class="legend"><span><i class="dot" style="background:var(--blue)"></i>Yes</span><span><i class="dot" style="background:var(--maybe)"></i>Maybe</span><span><i class="dot" style="background:var(--no)"></i>No</span><span><i class="dot" style="border:1.5px solid var(--muted)"></i>Not answered</span></div>'; }
function datebox(e) { var d = parseD(e.date); return '<div class="datebox' + (e.kind === 'match' ? ' match' : '') + '"><div class="w">' + DOW_SHORT[d.getDay()] + '</div><div class="d">' + d.getDate() + '</div></div>'; }
function result(e) {
  if (e.scoreFor == null || e.scoreAgainst == null) return { label: '–', bg: 'var(--raised)', fg: 'var(--muted)', text: 'No score' };
  var f = +e.scoreFor, a = +e.scoreAgainst;
  return f > a ? { label: 'W', bg: 'var(--blue)', fg: '#fff', text: f + '–' + a } : f < a ? { label: 'L', bg: 'var(--no)', fg: '#000', text: f + '–' + a } : { label: 'D', bg: 'var(--maybe)', fg: '#000', text: f + '–' + a };
}
function countdown(e) { var n = daysUntil(e.date); return n < 0 ? 'Waiting to be logged' : n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : 'In ' + n + ' days'; }

/* the court card: next training or match */
function courtCard(e, opts) {
  opts = opts || {};
  var isMatch = e.kind === 'match'; var c = counts(e);
  var h = '<section class="court' + (isMatch ? ' match' : '') + ' on-court">' + (isMatch ? '' : COURT) +
    '<div class="row between" style="align-items:flex-start"><span class="kicker">' + esc(opts.kicker || (isMatch ? 'Next match' : 'Next training')) + '</span><span class="kicker">' + esc(countdown(e)) + '</span></div>' +
    '<div class="col" style="gap:6px"><div class="when">' + esc(isMatch ? evTitle(e) : fmtCourt(e.date)) + '</div><div class="meta">' + esc(isMatch ? [fmtLong(e.date), evWhere(e)].filter(Boolean).join(', ') : evWhere(e) || 'Time to be confirmed') + '</div></div>';
  if (opts.answer && S.me) h += '<div class="col" style="gap:8px"><span class="kicker">Can you make it?</span>' + yn(S.me, e) + '</div>';
  h += '<div class="row between"><div class="tally"><span><b>' + c.going + '</b>yes</span><span><b>' + c.maybe + '</b>maybe</span><span><b>' + c.out + '</b>no</span></div>' +
    '<button class="btn sm ' + (isMatch ? 'primary' : 'white') + '" data-a="sheet" data-t="who" data-sid="' + esc(e.id) + '">' + (isCoach() ? 'Availability' : 'Who’s coming') + '</button></div></section>';
  return h;
}

/* ---------- calendar ---------- */
function monthKey(s) { return String(s).slice(0, 7); }
function monthBounds() {
  var first = monthKey(todayStr());
  var last = monthKey(cfg().seasonEnd);
  eventsArr().forEach(function (e) { if (!e.done && monthKey(e.date) > last) last = monthKey(e.date); });
  return { first: first, last: last < first ? first : last };
}
function shiftMonth(m, n) { var p = m.split('-'); var d = new Date(+p[0], +p[1] - 1 + n, 1); return d.getFullYear() + '-' + pad(d.getMonth() + 1); }
function viewCalendar() {
  if (!isCoach() && !S.me) return viewWho();
  var b = monthBounds(); var m = S.calMonth && S.calMonth >= b.first && S.calMonth <= b.last ? S.calMonth : b.first; S.calMonth = m;
  var p = m.split('-'); var y = +p[0], mo = +p[1] - 1;
  var monthName = new Date(y, mo, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  var evs = eventsArr().filter(function (e) { return monthKey(e.date) === m && (!e.done || isCoach()); }).sort(byTime);
  var byDay = {}; evs.forEach(function (e) { (byDay[e.date] = byDay[e.date] || []).push(e); });
  var today = todayStr();
  var h = '<header class="top"><div class="col"><h1>' + (isCoach() ? 'Availability' : 'Your calendar') + '</h1><span class="sub">' + (isCoach() ? 'Who can make each session and match' : 'Answer for every session until the end of June') + '</span></div></header>';
  if (!isCoach()) {
    var unanswered = openEvents().filter(function (e) { return !rsvp(S.me, e); }).length;
    if (unanswered) h += '<div class="banner">' + plural(unanswered, 'session') + ' still need an answer from you.</div>';
  }
  h += '<section class="panel"><div class="cal-head"><button class="iconbtn" data-a="month" data-v="-1" aria-label="Previous month"' + (m <= b.first ? ' disabled' : '') + '>' + svg('M15 6l-6 6 6 6', 20, 2) + '</button><h2>' + esc(monthName) + '</h2><button class="iconbtn" data-a="month" data-v="1" aria-label="Next month"' + (m >= b.last ? ' disabled' : '') + '>' + svg('M9 6l6 6-6 6', 20, 2) + '</button></div>';
  h += '<div class="cal" role="grid" aria-label="' + esc(monthName) + '">' + ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(function (d) { return '<div class="dow" aria-hidden="true">' + d + '</div>'; }).join('');
  var firstDow = (new Date(y, mo, 1).getDay() + 6) % 7; var dim = new Date(y, mo + 1, 0).getDate();
  for (var i = 0; i < firstDow; i++) h += '<div></div>';
  for (var d = 1; d <= dim; d++) {
    var ds = y + '-' + pad(mo + 1) + '-' + pad(d); var list = byDay[ds] || [];
    var cls = 'cell' + (list.length ? ' ev' : '') + (ds === today ? ' today' : '') + (ds < today ? ' past' : '') + (list.some(function (e) { return e.id === S.calSid; }) ? ' sel' : '');
    var mark = '';
    if (list.length) {
      if (isCoach()) mark = '<span class="cnt"' + (list[0].done ? ' style="color:var(--muted)"' : '') + '>' + (list[0].done ? (list[0].attended || []).length : goingIds(list[0]).length) + '</span>';
      else mark = '<span class="mk ' + (rsvp(S.me, list[0]) || '') + '"></span>';
      if (list.some(function (e) { return e.kind === 'match'; })) mark += '<span class="mx" title="Match"></span>';
    }
    var label = fmtLong(ds) + (list.length ? ': ' + list.map(function (e) { return evTitle(e) + (isCoach() ? ', ' + goingIds(e).length + ' yes' : ', ' + (rsvp(S.me, e) ? ANSWER[rsvp(S.me, e)] : 'not answered')); }).join('; ') : '');
    h += list.length ? '<button class="' + cls + '" data-a="calday" data-sid="' + esc(list[0].id) + '" aria-label="' + esc(label) + '">' + d + mark + '</button>' : '<div class="' + cls + '" aria-label="' + esc(label) + '">' + d + '</div>';
  }
  h += '</div>' + (isCoach() ? '<div class="legend"><span><b style="font-family:var(--display);color:var(--blue-hi)">5</b>said yes (grey: came, for past sessions)</span><span><i class="dot" style="background:#fff"></i>Match</span></div>' : legendAnswers()) + '</section>';
  // list for the month
  var openEvs = evs.filter(function (e) { return !e.done; });
  if (!evs.length) h += '<div class="panel empty">Nothing scheduled in ' + esc(monthName.split(' ')[0]) + '.' + (isCoach() ? '<br><br><button class="btn primary" data-a="sheet" data-t="training">Add training</button>' : '') + '</div>';
  else {
    h += '<section class="section"><div class="section-head"><h2>' + esc(monthName.split(' ')[0]) + '</h2>';
    if (!isCoach()) {
      var todo = openEvs.filter(function (e) { return !rsvp(S.me, e); });
      h += todo.length ? '<button class="btn sm primary" data-a="allyes" data-ids="' + esc(todo.map(function (e) { return e.id; }).join(',')) + '">Yes to the other ' + todo.length + '</button>' : '<span class="small muted">All answered</span>';
    }
    h += '</div><div class="panel flush divide">' + evs.map(function (e) {
      var c = counts(e);
      return '<div class="ev-row' + (e.id === S.calSid ? ' hl' : '') + '" id="ev-' + esc(e.id) + '"><div class="row">' + datebox(e) + '<div class="col" style="flex:1;min-width:0"><span style="font-weight:600;font-size:16px">' + esc(evTitle(e)) + '</span><span class="small muted">' + esc(evWhere(e) || fmtD(e.date)) + '</span></div>' +
        (isCoach() ? (e.done ? '<span class="small muted">' + (e.attended || []).length + ' came</span>' : '<button class="btn sm" data-a="sheet" data-t="who" data-sid="' + esc(e.id) + '">' + c.going + ' yes</button>') : (e.done ? '<span class="small muted">Done</span>' : '')) + '</div>' +
        (!isCoach() && !e.done ? yn(S.me, e, true) : '') + (isCoach() && !e.done ? stackBar(c) : '') + '</div>';
    }).join('') + '</div></section>';
  }
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
  var appName = isCoach() ? 'the coach app' : 'the app';
  if (installEvt) return '<section class="install"><h3>Put ' + appName + ' on your home screen</h3><span class="muted small">It opens full screen like any other app, and remembers you.</span><div class="grid2"><button class="btn primary" data-a="install">Install app</button><button class="btn ghost" style="color:#000;border-color:#D5DCE8" data-a="installHide">Not now</button></div></section>';
  if (isIOS()) {
    var share = '<span class="shareic">' + svg('M12 3v12M8 7l4-4 4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7', 20, 2) + '</span>';
    return '<section class="install"><h3>Put ' + appName + ' on your home screen</h3>' +
      (inAppBrowser() ? '<span class="muted small">First open this page in Safari: tap the menu (\u22ef or the compass) and choose Open in Safari.</span>' : '') +
      '<ol><li>Tap the Share button ' + share + ' at the bottom of Safari</li><li>Scroll down and tap <b>Add to Home Screen</b></li><li>Tap <b>Add</b></li></ol><span class="muted small">Then open Futsal from your home screen. It opens full screen and remembers you.</span><button class="btn ghost" style="color:#000;border-color:#D5DCE8" data-a="installHide">Done, hide this</button></section>';
  }
  return '';
}

/* ---------- player home ---------- */
function viewWho() {
  var ps = players();
  return installCard() + '<header class="col" style="gap:8px"><img class="logo" src="logo.jpg" alt=""><span class="sub muted">' + esc(TEAM) + '</span><h1>Who are you?</h1><span class="small muted">Tap your name once. This phone will remember you.</span></header>' +
    (ps.length ? '<div class="panel flush divide">' + ps.map(function (p) { return '<button class="rowitem" data-a="iam" data-pid="' + esc(p.id) + '"><span class="av" aria-hidden="true">' + esc(initials(p.name)) + '</span><span class="col" style="flex:1;gap:1px"><span style="font-weight:600;font-size:17px">' + esc(p.name) + '</span>' + (p.pos ? '<span class="small muted">' + esc(p.pos) + '</span>' : '') + '</span>' + svg('M9 6l6 6-6 6', 18, 2) + '</button>'; }).join('') + '</div>' : '<div class="panel empty">Your coach hasn’t added the squad yet. Check back soon.</div>') +
    '<span class="small muted" style="text-align:center">Not on the list? Ask your coach to add you.</span>';
}
function viewHome(stats) {
  if (!S.me) return viewWho();
  var me = S.me; var p = S.players[me]; var h = '';
  h += '<header class="top"><div class="col"><span class="sub">' + esc(fmtLong(todayStr())) + '</span><h1>Hey ' + esc(first(p.name)) + '</h1></div><button class="btn link sm" data-a="notme">Not you?</button></header>';
  h += installCard();
  var nx = nextEvent();
  if (nx) h += courtCard(nx, { answer: true, kicker: nx.kind === 'match' ? 'Next match' : 'Next training' });
  else h += '<div class="panel empty">Nothing scheduled yet. Check back soon.</div>';
  var soon = openEvents().filter(function (e) { return !nx || e.id !== nx.id; }).slice(0, 3);
  if (soon.length) {
    h += '<section class="section"><div class="section-head"><h2>Coming up</h2><a class="btn link sm" href="#calendar">Full calendar</a></div><div class="panel flush divide">' + soon.map(function (e) {
      return '<div class="ev-row"><div class="row">' + datebox(e) + '<div class="col" style="flex:1;min-width:0"><span style="font-weight:600">' + esc(evTitle(e)) + '</span><span class="small muted">' + esc(evWhere(e) || fmtD(e.date)) + '</span></div></div>' + yn(me, e, true) + '</div>';
    }).join('') + '</div></section>';
  }
  var rows = cfg().skills.map(function (k) { return { k: k, st: skillState(me, k, stats) }; }).sort(function (a, b) { return W[b.st.level] - W[a.st.level]; });
  var need = rows.filter(function (r) { return r.st.level !== 'fresh'; });
  h += '<a class="panel" href="#stats" style="text-decoration:none;color:#fff"><div class="section-head"><h3>Your training</h3>' + svg('M9 6l6 6-6 6', 18, 2) + '</div>' +
    (need.length ? '<span class="soft">Most overdue: <b>' + esc(need.slice(0, 2).map(function (r) { return r.k.toLowerCase(); }).join(' and ')) + '</b>.</span>' : '<span class="soft">Every skill is fresh. Nice work.</span>') +
    '<div class="row" style="gap:6px;flex-wrap:wrap">' + rows.map(function (r) { return '<span class="tag" style="border-color:' + C[r.st.level] + ';color:' + C[r.st.level] + '">' + esc(r.k) + '</span>'; }).join('') + '</div></a>';
  return h;
}

/* ---------- training ---------- */
function trainingChips(sel) {
  var list = overdueOpen('training').concat(openEvents('training')).slice(0, 10);
  if (list.length < 2) return '';
  return '<div class="scroller" role="group" aria-label="Choose a session">' + list.map(function (e) { return '<button class="chip" data-a="pickTrain" data-sid="' + esc(e.id) + '" aria-pressed="' + (sel && e.id === sel.id) + '">' + esc(fmtD(e.date)) + '</button>'; }).join('') + '</div>';
}
function viewTraining(stats) {
  var s = selTraining();
  var h = '<header class="top"><div class="col"><h1>Training</h1><span class="sub">' + (s ? 'Session plan built from what the squad needs most' : 'No sessions scheduled') + '</span></div>' + (isCoach() ? '<button class="btn sm" data-a="sheet" data-t="training">Add</button>' : '') + '</header>';
  if (!s) return h + '<div class="panel empty">' + (isCoach() ? 'Add your weekly session and a plan is suggested automatically.<br><br><button class="btn primary" data-a="sheet" data-t="training">Add training</button>' : 'Your coach hasn’t scheduled the next session yet.') + '</div>' + pastTraining();
  h += trainingChips(s);
  h += courtCard(s, { answer: !isCoach(), kicker: s.date < todayStr() ? 'Waiting to be logged' : 'Training' });
  var pl = planFor(s, stats); var basis = basisFor(s); var going = goingIds(s);
  var g = gaps(basis, stats); var focus = g.filter(function (x) { return x.need; }).slice(0, 2);
  if (basis.length) {
    h += '<section class="panel"><h3>Focus</h3>' + (focus.length ? '<div class="row" style="gap:8px;flex-wrap:wrap">' + focus.map(function (x) { return '<span class="tag blue">' + esc(x.skill) + '</span>'; }).join('') + '</div><span class="soft small">' + focus.map(function (x) { return x.need + ' of ' + basis.length + ' ' + (going.length ? 'coming' : 'players') + ' haven’t trained ' + x.skill.toLowerCase() + ' recently'; }).join('. ') + '.</span>' : '<span class="soft small">Everyone is up to date, so this is a balanced session.</span>') + '</section>';
  }
  var mins = pl.ids.reduce(function (a, id) { return a + (+((S.drills[id] || {}).mins) || 0); }, 0);
  h += '<section class="section"><div class="section-head"><h2>' + (pl.saved ? 'Session plan' : 'Suggested plan') + '</h2><span class="small muted">' + mins + ' of ' + (+s.mins || cfg().sessionMins) + ' min</span></div>';
  if (!pl.ids.length) h += '<div class="panel empty">No drills in the library yet.</div>';
  else {
    var clock = s.time || '19:00'; var fsk = focus.map(function (x) { return x.skill; });
    h += '<ol class="tl">' + pl.ids.map(function (id, i) {
      var d = S.drills[id]; if (!d) return ''; var open = S.open === i; var t = clock; clock = addMins(clock, +d.mins || 0);
      var hit = (d.skills || []).some(function (k) { return fsk.indexOf(k) >= 0; });
      return '<li><span class="clock">' + esc(fmtTime(t)) + '</span><span class="rail"><i class="' + (hit ? 'focus' : '') + '"></i></span><div class="card"><button type="button" data-a="toggle" data-i="' + i + '" aria-expanded="' + open + '"><span class="col" style="flex:1;gap:2px"><span style="font-weight:600;font-size:16px">' + esc(d.name) + '</span><span class="small muted">' + (+d.mins || 0) + ' min, ' + esc((d.skills || []).join(', ').toLowerCase()) + '</span></span>' + svg(open ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6', 18, 2) + '</button>' +
        (open ? '<div class="body">' + (d.setup ? '<span class="desc">' + esc(d.setup) + '</span>' : '') + (d.cue ? '<span><b style="color:#fff">Coaching point:</b> ' + esc(d.cue) + '</span>' : '') + (d.link ? '<a href="' + esc(d.link) + '" target="_blank" rel="noopener">Watch the video or diagram</a>' : '') +
          (isCoach() ? '<div class="row" style="gap:8px"><button class="btn sm" type="button" data-a="swap" data-i="' + i + '">Swap drill</button><button class="btn sm ghost" type="button" data-a="removeBlock" data-i="' + i + '">Remove</button></div>' : '') + '</div>' : '') + '</div></li>';
    }).join('') + '<li class="end"><span class="clock">' + esc(fmtTime(clock)) + '</span><span class="rail"><i></i></span><span class="small muted" style="padding-top:2px">Finish</span></li></ol>';
  }
  h += '</section>';
  if (isCoach()) {
    h += '<div class="grid2">' + (pl.saved && !pl.changed ? '<button class="btn" data-a="resetPlan">Suggest a new plan</button>' : '<button class="btn primary" data-a="savePlan"' + (pl.ids.length ? '' : ' disabled') + '>' + (pl.changed && s.plan && s.plan.length ? 'Save changes' : 'Use this plan') + '</button>') +
      '<button class="btn' + (pl.saved && !pl.changed ? ' primary' : '') + '" data-a="sheet" data-t="log" data-sid="' + esc(s.id) + '">Log attendance</button></div>' +
      '<button class="btn ghost" data-a="sheet" data-t="editTraining" data-sid="' + esc(s.id) + '">Edit this session</button>';
  }
  return h + pastTraining();
}
function pastTraining() {
  var past = pastEvents('training').slice(0, 4);
  if (!past.length) return '';
  return '<section class="section"><h2>Recent sessions</h2><div class="panel flush divide">' + past.map(function (s) {
    return '<div class="rowitem">' + datebox(s) + '<span class="col" style="flex:1"><span style="font-weight:600">' + esc(s.title || 'Training') + '</span><span class="small muted">' + plural((s.attended || []).length, 'player') + ', ' + plural((s.drillsDone || s.plan || []).length, 'drill') + '</span></span></div>';
  }).join('') + '</div></section>';
}

/* ---------- matches ---------- */
function viewMatches() {
  var up = overdueOpen('match').concat(openEvents('match')); var past = pastEvents('match');
  var rec = { W: 0, D: 0, L: 0 }; past.forEach(function (m) { var r = result(m); if (rec[r.label] != null) rec[r.label]++; });
  var h = '<header class="top"><div class="col"><h1>Matches</h1><span class="sub">' + (past.length ? 'Played ' + past.length + ': won ' + rec.W + ', drew ' + rec.D + ', lost ' + rec.L : 'Fixtures and results') + '</span></div>' + (isCoach() ? '<button class="btn sm primary" data-a="sheet" data-t="match">Add match</button>' : '') + '</header>';
  if (!up.length) h += '<div class="panel empty">No matches scheduled yet.' + (isCoach() ? '<br><br><button class="btn primary" data-a="sheet" data-t="match">Add a match</button>' : '') + '</div>';
  else {
    h += courtCard(up[0], { answer: !isCoach(), kicker: up[0].homeAway === 'home' ? 'Home match' : up[0].homeAway === 'away' ? 'Away match' : 'Next match' });
    if (isCoach()) h += '<div class="grid2"><button class="btn" data-a="sheet" data-t="editMatch" data-sid="' + esc(up[0].id) + '">Edit match</button><button class="btn primary" data-a="sheet" data-t="logMatch" data-sid="' + esc(up[0].id) + '">Enter result</button></div>';
    if (up.length > 1) {
      h += '<section class="section"><h2>Later fixtures</h2><div class="panel flush divide">' + up.slice(1).map(function (m) {
        return '<div class="ev-row"><div class="row">' + datebox(m) + '<div class="col" style="flex:1;min-width:0"><span style="font-weight:600">' + esc(evTitle(m)) + '</span><span class="small muted">' + esc([evWhere(m), m.competition].filter(Boolean).join(', ') || fmtD(m.date)) + '</span></div>' + (isCoach() ? '<button class="btn sm" data-a="sheet" data-t="editMatch" data-sid="' + esc(m.id) + '">Edit</button>' : '') + '</div>' + (!isCoach() && S.me ? yn(S.me, m, true) : '') + '</div>';
      }).join('') + '</div></section>';
    }
  }
  if (past.length) {
    h += '<section class="section"><h2>Results</h2><div class="panel flush divide">' + past.map(function (m) {
      var r = result(m);
      var inner = '<span class="res" style="background:' + r.bg + ';color:' + r.fg + '">' + r.label + '</span><span class="col" style="flex:1;min-width:0"><span style="font-weight:600">' + esc(evTitle(m)) + '</span><span class="small muted">' + esc(fmtD(m.date) + (m.competition ? ', ' + m.competition : '')) + '</span></span><span class="score">' + esc(r.text) + '</span>';
      return isCoach() ? '<button class="rowitem" data-a="sheet" data-t="logMatch" data-sid="' + esc(m.id) + '">' + inner + '</button>' : '<div class="rowitem">' + inner + '</div>';
    }).join('') + '</div></section>';
  }
  return h;
}

/* ---------- drills (coach) ---------- */
function viewDrills(stats) {
  var t = selTraining(); var basis = t ? basisFor(t) : players().map(function (p) { return p.id; });
  var wm = weights(basis, stats); var all = drillsArr();
  var h = '<header class="top"><div class="col"><h1>Drills</h1><span class="sub">' + all.length + ' in your library</span></div><button class="btn sm primary" data-a="sheet" data-t="drill">Add drill</button></header>';
  var recs = all.filter(function (d) { return (d.kind || 'drill') === 'drill'; }).sort(function (a, b) { return drillScore(b, wm) - drillScore(a, wm) || a.name.localeCompare(b.name); }).slice(0, 4);
  var top = gaps(basis, stats).filter(function (x) { return x.need; }).slice(0, 2).map(function (x) { return x.skill.toLowerCase(); });
  if (recs.length && basis.length && top.length) {
    var tplan = t ? planFor(t, stats).ids : [];
    h += '<section class="whitecard"><h3 style="color:#000">Recommended' + (t ? ' for ' + esc(fmtD(t.date)) : '') + '</h3><span class="muted small">The squad most needs ' + esc(top.join(' and ')) + '.</span><div class="col" style="gap:6px;margin-top:6px">' + recs.map(function (d) {
      return '<div class="row" style="background:#EEF2F8;border-radius:12px;padding:8px 10px 8px 12px"><button data-a="sheet" data-t="drillView" data-did="' + esc(d.id) + '" class="col" style="flex:1;gap:1px;border:0;background:transparent;text-align:left;color:#000;padding:0;min-height:44px;justify-content:center"><span style="font-weight:600">' + esc(d.name) + '</span><span class="small" style="color:#4A5568">' + (+d.mins || 0) + ' min, ' + esc((d.skills || []).join(', ').toLowerCase()) + '</span></button>' +
        (t ? (tplan.indexOf(d.id) >= 0 ? '<span class="small" style="font-weight:600;color:var(--blue)">In plan</span>' : '<button class="btn sm primary" data-a="addToPlan" data-did="' + esc(d.id) + '">Add</button>') : '') + '</div>';
    }).join('') + '</div></section>';
  }
  h += '<div class="chips" role="group" aria-label="Filter by skill">' + ['all'].concat(cfg().skills).map(function (k) { return '<button type="button" class="chip" data-a="drillFilter" data-v="' + esc(k) + '" aria-pressed="' + (S.drillFilter === k) + '">' + (k === 'all' ? 'All' : esc(k)) + '</button>'; }).join('') + '</div>';
  var list = all.filter(function (d) { return S.drillFilter === 'all' || (d.skills || []).indexOf(S.drillFilter) >= 0; });
  [['warmup', 'Warm-ups'], ['drill', 'Drills'], ['game', 'Games']].forEach(function (k) {
    var items = list.filter(function (d) { return (d.kind || 'drill') === k[0]; }).sort(function (a, b) { return a.name.localeCompare(b.name); });
    if (!items.length) return;
    h += '<section class="section"><h2>' + k[1] + '</h2><div class="panel flush divide">' + items.map(function (d) {
      return '<button class="rowitem" data-a="sheet" data-t="drillView" data-did="' + esc(d.id) + '"><span class="col" style="flex:1;gap:2px;min-width:0"><span style="font-weight:600">' + esc(d.name) + '</span><span class="small muted">' + (+d.mins || 0) + ' min, ' + esc((d.skills || []).join(', ').toLowerCase()) + '</span></span>' + svg('M9 6l6 6-6 6', 18, 2) + '</button>';
    }).join('') + '</div></section>';
  });
  if (!list.length) h += '<div class="panel empty">No drills for that skill yet.</div>';
  return h;
}

/* ---------- stats ---------- */
function viewStats(stats) {
  var ps = players();
  if (!isCoach() && !S.me) return viewWho();
  if (!ps.length) return '<header class="top"><h1>Player stats</h1></header><div class="panel empty">No players yet.</div>';
  var pid = S.statPid && S.players[S.statPid] ? S.statPid : (S.me && S.players[S.me] ? S.me : ps[0].id); var p = S.players[pid];
  var doneT = eventsArr().filter(function (s) { return s.done && s.kind !== 'match'; }).sort(byTime);
  var trained = doneT.filter(function (s) { return (s.attended || []).indexOf(pid) >= 0; });
  var played = eventsArr().filter(function (s) { return s.done && s.kind === 'match' && (s.attended || []).indexOf(pid) >= 0; }).length;
  var rate = doneT.length ? Math.round(trained.length / doneT.length * 100) + '%' : '–';
  var h = '';
  if (isCoach()) h += '<label class="f"><span>Player</span><select data-change="statPid">' + ps.map(function (x) { return '<option value="' + esc(x.id) + '"' + (x.id === pid ? ' selected' : '') + '>' + esc(x.name) + '</option>'; }).join('') + '</select></label>';
  h += '<header class="row" style="gap:14px"><span class="av me" aria-hidden="true" style="width:64px;height:64px;font-size:26px">' + esc(initials(p.name)) + '</span><div class="col" style="flex:1;gap:2px"><h1 style="font-size:34px">' + esc(p.name) + '</h1><span class="sub muted">' + esc(p.pos || 'Player') + '</span></div>' +
    (isCoach() ? '<button class="iconbtn" aria-label="Edit player" data-a="sheet" data-t="editPlayer" data-pid="' + esc(pid) + '">' + svg('M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z', 20) + '</button>' : '<button class="btn link sm" data-a="notme">Not you?</button>') + '</header>';
  h += '<div class="kpis"><div class="kpi"><b>' + trained.length + '</b><span>Sessions trained</span></div><div class="kpi"><b>' + rate + '</b><span>Attendance</span></div><div class="kpi"><b>' + played + '</b><span>Matches played</span></div></div>';
  var last12 = doneT.slice(-12);
  h += '<section class="panel"><div class="section-head"><h3>Last 12 sessions</h3><span class="small muted">' + (last12.length ? 'Came to ' + last12.filter(function (s) { return (s.attended || []).indexOf(pid) >= 0; }).length + ' of ' + last12.length : 'None logged yet') + '</span></div><div class="att" role="img" aria-label="Attendance at the last ' + last12.length + ' sessions">';
  for (var i = 0; i < 12 - last12.length; i++) h += '<i class="empty"></i>';
  last12.forEach(function (s) { var y = (s.attended || []).indexOf(pid) >= 0; h += '<i class="' + (y ? 'y' : '') + '" title="' + esc(fmtD(s.date) + (y ? ': came' : ': missed')) + '"></i>'; });
  h += '</div></section>';
  var c = cfg(); var full = c.overdue + 7;
  var rows = c.skills.map(function (k) { return { k: k, st: skillState(pid, k, stats) }; }).sort(function (a, b) { return (b.st.days == null ? 999 : b.st.days) - (a.st.days == null ? 999 : a.st.days); });
  h += '<section class="section"><div class="section-head"><h2>Skills</h2><span class="small muted">Days since last trained</span></div><div class="panel flush divide">' + rows.map(function (r) {
    var pct = r.st.days == null ? 100 : Math.min(100, Math.round(r.st.days / full * 100));
    return '<div class="skill"><div class="row between"><span class="name">' + esc(r.k) + '</span><span class="row" style="gap:8px"><span class="small" style="color:' + C[r.st.level] + ';font-weight:600">' + LEVEL_LABEL[r.st.level] + '</span><span class="val" style="color:' + C[r.st.level] + '">' + (r.st.days == null ? '–' : r.st.days + 'd') + '</span></span></div>' +
      '<div class="track" role="img" aria-label="' + esc(r.k + ': ' + (r.st.days == null ? 'not trained yet' : r.st.days + ' days since trained') + ', ' + LEVEL_LABEL[r.st.level]) + '"><div class="fill" style="width:' + pct + '%;background:' + C[r.st.level] + '"></div><span class="tick" style="left:' + Math.round(c.fresh / full * 100) + '%"></span><span class="tick" style="left:' + Math.round(c.overdue / full * 100) + '%"></span></div>' +
      '<span class="xs muted">' + (r.st.date ? 'Last trained ' + esc(fmtLong(r.st.date)) : 'No session logged with this skill yet') + '</span></div>';
  }).join('') + '</div><span class="xs muted">The two marks on each bar show when a skill turns due (' + c.fresh + ' days) and overdue (' + c.overdue + ' days).</span></section>';
  return h;
}

/* ---------- players list (coach) ---------- */
function viewPlayers(stats) {
  var ps = players(); var e = nextEvent();
  var h = '<header class="top"><div class="col"><h1>Players</h1><span class="sub">' + plural(ps.length, 'player') + ' in the squad</span></div><button class="btn sm primary" data-a="sheet" data-t="player">Add player</button></header>';
  if (!ps.length) return h + '<div class="panel empty">Add your squad to get started.</div>';
  h += '<div class="panel flush divide">' + ps.map(function (p) {
    var over = cfg().skills.filter(function (k) { var l = skillState(p.id, k, stats).level; return l === 'overdue' || l === 'never'; }).length;
    return '<button class="rowitem" data-a="viewPlayer" data-pid="' + esc(p.id) + '"><span class="av" aria-hidden="true">' + esc(initials(p.name)) + '</span><span class="col" style="flex:1;gap:1px;min-width:0"><span style="font-weight:600">' + esc(p.name) + '</span><span class="small muted">' + esc(p.pos || 'Player') + (over ? ', ' + over + ' skills overdue' : ', all skills fresh') + '</span></span>' + (e ? pill(rsvp(p.id, e)) : '') + '</button>';
  }).join('') + '</div>';
  return h;
}

/* ---------- coach overview ---------- */
function viewCoach(stats) {
  var s = selTraining(); var ps = players(); var nm = overdueOpen('match').concat(openEvents('match'))[0];
  var pids = S.scope === 'session' && s ? goingIds(s) : ps.map(function (p) { return p.id; });
  var h = '<header class="top"><div class="row" style="gap:12px"><img class="logo sm" src="logo.jpg" alt=""><div class="col"><span class="sub">Coach view</span><h1>' + esc(TEAM) + '</h1></div></div><button class="btn link sm" data-a="logout">Sign out</button></header>';
  h += installCard();
  if (!ps.length) h += '<section class="panel"><h3>Get started</h3><span class="soft small">Add your players, then send the team link to the squad.</span><div class="grid2"><button class="btn primary" data-a="sheet" data-t="player">Add players</button><button class="btn" data-a="sheet" data-t="teamLink">Team link</button></div></section>';
  if (s) h += courtCard(s, { kicker: 'Next training' }); else h += '<div class="panel empty">No training scheduled.<br><br><button class="btn primary" data-a="sheet" data-t="training">Add training</button></div>';
  if (nm) h += '<a class="panel" href="#matches" style="text-decoration:none;color:#fff;flex-direction:row;align-items:center">' + datebox(nm) + '<span class="col" style="flex:1"><span style="font-weight:600">Next match: ' + esc(evTitle(nm)) + '</span><span class="small muted">' + goingIds(nm).length + ' said yes, ' + counts(nm).none + ' not answered</span></span>' + svg('M9 6l6 6-6 6', 18, 2) + '</a>';
  h += '<section class="section"><div class="section-head"><h2>What’s lacking</h2></div><div class="toggle2" role="group" aria-label="Who to include"><button type="button" data-a="scope" data-v="session" aria-pressed="' + (S.scope === 'session') + '">' + (s ? 'Coming ' + fmtD(s.date) : 'Next session') + '</button><button type="button" data-a="scope" data-v="squad" aria-pressed="' + (S.scope === 'squad') + '">Whole squad</button></div>';
  if (!pids.length) h += '<div class="panel empty">' + (S.scope === 'session' ? 'Nobody has said yes yet.' : 'No players yet.') + '</div>';
  else {
    var g = gaps(pids, stats); var top = g[0];
    if (top && top.need) h += '<div class="whitecard"><span class="small muted">Biggest gap</span><span class="big">' + esc(top.skill) + '</span><span class="small muted">' + top.need + ' of ' + pids.length + ' haven’t trained it in ' + (cfg().fresh + 1) + '+ days.</span></div>';
    h += '<div class="panel">' + g.map(function (x) {
      var pct = Math.round(x.need / pids.length * 100); var col = pct >= 50 ? C.overdue : (pct >= 30 ? C.due : C.fresh);
      return '<div class="col" style="gap:6px"><div class="row between"><span style="font-weight:500">' + esc(x.skill) + '</span><span class="small" style="font-weight:600;color:' + col + '">' + x.need + ' of ' + pids.length + '</span></div><div class="bar" role="img" aria-label="' + esc(x.skill) + ': ' + x.need + ' of ' + pids.length + ' need it"><div style="width:' + pct + '%;background:' + col + '"></div></div></div>';
    }).join('') + '</div>';
    h += '<a href="#training" class="btn primary" style="min-height:52px">Plan training around these gaps</a>';
  }
  h += '</section>';
  h += '<section class="panel"><h3>Squad link</h3><span class="soft small">' + (cfg().openAccess ? 'Send this address to the squad. Players tap their name and confirm, then their phone remembers them.' : 'Send this link to the squad. Each player taps their name the first time.') + '</span>' + (teamLink() ? '<div class="linkbox">' + esc(teamLink()) + '</div><div class="grid2"><button class="btn primary" data-a="copy" data-link="' + esc(teamLink()) + '">Copy link</button>' + (navigator.share ? '<button class="btn" data-a="share" data-link="' + esc(teamLink()) + '">Share</button>' : '<button class="btn" data-a="sheet" data-t="teamLink">More</button>') + '</div>' : '') + '</section>';
  h += '<section class="section"><h2>Manage</h2><div class="grid2"><a class="btn" href="#players">Players (' + ps.length + ')</a><button class="btn" data-a="sheet" data-t="training">Add training</button><button class="btn" data-a="sheet" data-t="match">Add match</button><button class="btn" data-a="sheet" data-t="coaches">Coaches</button></div><button class="btn ghost" data-a="sheet" data-t="settings">Settings</button></section>';
  return h;
}

/* ---------- sheets ---------- */
function posOpts(cur) { return '<option value="">Not set</option>' + POSITIONS.map(function (x) { return '<option' + (x === cur ? ' selected' : '') + '>' + x + '</option>'; }).join(''); }
function sheetHTML(stats) {
  var sh = S.sheet; if (!sh) return '';
  var c = cfg(); var body = ''; var title = '';
  if (sh.t === 'confirmMe') {
    var cp = S.players[sh.pid]; if (!cp) return ''; title = 'Is this you?';
    body = '<div class="row" style="gap:14px"><span class="av me" aria-hidden="true" style="width:64px;height:64px;font-size:26px">' + esc(initials(cp.name)) + '</span><div class="col"><span class="disp" style="font-size:32px">' + esc(cp.name) + '</span>' + (cp.pos ? '<span class="muted">' + esc(cp.pos) + '</span>' : '') + '</div></div>' +
      '<span class="soft small">Your answers will be saved as ' + esc(first(cp.name)) + '. This phone will remember you next time.</span>' +
      '<button class="btn primary" data-a="iamYes" data-pid="' + esc(sh.pid) + '" style="min-height:52px">Yes, this is me</button><button class="btn ghost" data-a="close">No, go back</button>';
  } else if (sh.t === 'who') {
    var we = evById(sh.sid); if (!we) return ''; title = esc(evTitle(we)) + ', ' + esc(fmtD(we.date));
    if (isCoach()) {
      body = '<span class="small muted">Tap to set anyone’s answer.</span><div class="panel flush divide">' + players().map(function (p) { return '<div class="ev-row"><div class="row"><span class="av" aria-hidden="true" style="width:34px;height:34px;font-size:15px">' + esc(initials(p.name)) + '</span><span style="font-weight:600;flex:1">' + esc(p.name) + '</span></div>' + yn(p.id, we, true) + '</div>'; }).join('') + '</div>';
    } else {
      body = [['going', 'Yes'], ['maybe', 'Maybe'], ['out', 'No'], [null, 'Not answered']].map(function (g) {
        var ids = g[0] ? idsWith(we, g[0]) : players().filter(function (p) { return !rsvp(p.id, we); }).map(function (p) { return p.id; });
        if (!ids.length) return '';
        return '<div class="col" style="gap:8px"><h3>' + g[1] + ' (' + ids.length + ')</h3><div class="chips">' + ids.map(function (id) { return '<span class="chip">' + esc(S.players[id].name) + (id === S.me ? ' (you)' : '') + '</span>'; }).join('') + '</div></div>';
      }).join('');
    }
  } else if (sh.t === 'player') {
    title = 'Add a player';
    body = '<form data-form="addPlayer" class="col" style="gap:12px"><label class="f"><span>Name</span><input type="text" name="name" required maxlength="60"></label><label class="f"><span>Position (optional)</span><select name="pos">' + posOpts('') + '</select></label><button class="btn primary" type="submit">Add player</button></form><span class="small muted">The form stays open so you can add the next player straight away. Players choose their own name from the team link.</span>';
  } else if (sh.t === 'editPlayer') {
    var ep = S.players[sh.pid]; if (!ep) return ''; title = 'Edit player';
    body = '<form data-form="editPlayer" data-pid="' + esc(sh.pid) + '" class="col" style="gap:12px"><label class="f"><span>Name</span><input type="text" name="name" required maxlength="60" value="' + esc(ep.name) + '"></label><label class="f"><span>Position</span><select name="pos">' + posOpts(ep.pos) + '</select></label><button class="btn primary" type="submit">Save</button></form>' +
      '<button class="btn danger" data-a="deletePlayer" data-pid="' + esc(sh.pid) + '">' + (sh.confirm ? 'Tap again to remove ' + esc(ep.name) : 'Remove from squad') + '</button>';
  } else if (sh.t === 'teamLink') {
    title = 'Team link';
    body = '<span class="soft small">Send this one link to the squad, for example in your WhatsApp group. Each player taps their name the first time and their phone remembers them.</span>' + (teamLink() ? '<div class="linkbox">' + esc(teamLink()) + '</div><div class="grid2"><button class="btn primary" data-a="copy" data-link="' + esc(teamLink()) + '">Copy link</button>' + (navigator.share ? '<button class="btn" data-a="share" data-link="' + esc(teamLink()) + '">Share</button>' : '<span></span>') + '</div>' : '') +
      '<button class="btn danger" data-a="newTeamLink">' + (sh.confirm ? 'Tap again: the old link will stop working' : 'Make a new team link') + '</button><span class="small muted">Only make a new link if the old one has been shared outside the squad.</span>';
  } else if (sh.t === 'coaches') {
    title = 'Coaches';
    body = '<span class="small muted">These logins can use the coach view.</span><div class="panel flush divide">' + (S.admins.length ? S.admins.map(function (e) { return '<div class="rowitem"><span class="av me" aria-hidden="true">' + esc(initials(e)) + '</span><span style="font-weight:600;word-break:break-all">' + esc(e) + (e === S.email ? ' <span class="small muted">(you)</span>' : '') + '</span></div>'; }).join('') : '<div class="rowitem small muted">Couldn’t load the list.</div>') + '</div>' +
      '<div class="banner">To add a coach, create their login in Supabase (Authentication, then Users, then Add user, then Create new user, with Auto confirm ticked). Every login there is a coach. They can set their own password with Forgot password on the coach sign-in page.</div>';
  } else if (sh.t === 'training' || sh.t === 'editTraining') {
    var es = sh.t === 'editTraining' ? evById(sh.sid) : null; title = es ? 'Edit training' : 'Add training';
    var lastT = openEvents('training').slice(-1)[0] || pastEvents('training')[0];
    var dflt = es || { date: todayStr(), time: (lastT && lastT.time) || '19:00', endTime: (lastT && lastT.endTime) || '20:30', venue: (lastT && lastT.venue) || '', title: 'Training' };
    body = '<form data-form="training" class="col" style="gap:12px"' + (es ? ' data-sid="' + esc(es.id) + '"' : '') + '><label class="f"><span>Name</span><input type="text" name="title" maxlength="40" value="' + esc(dflt.title || 'Training') + '"></label><label class="f"><span>Date</span><input type="date" name="date" required value="' + esc(dflt.date) + '"></label><div class="grid2"><label class="f"><span>Starts</span><input type="time" name="time" value="' + esc(dflt.time || '') + '"></label><label class="f"><span>Ends</span><input type="time" name="endTime" value="' + esc(dflt.endTime || '') + '"></label></div><label class="f"><span>Venue</span><input type="text" name="venue" maxlength="40" value="' + esc(dflt.venue || '') + '"></label>' +
      (es ? '' : '<label class="f"><span>Repeat</span><select name="repeat"><option value="once">Just this date</option><option value="season">Every week until the end of the season</option></select></label>') +
      '<button class="btn primary" type="submit">' + (es ? 'Save' : 'Add training') + '</button></form>' +
      (es ? '<button class="btn danger" data-a="deleteEvent" data-sid="' + esc(es.id) + '">' + (sh.confirm ? 'Tap again to delete this session' : 'Delete this session') + '</button>' : '<span class="small muted">To record a session that already happened, pick its date, then use Log attendance.</span>');
  } else if (sh.t === 'match' || sh.t === 'editMatch') {
    var em = sh.t === 'editMatch' ? evById(sh.sid) : null; title = em ? 'Edit match' : 'Add match';
    var dm = em || { date: todayStr(), time: '', endTime: '', venue: '', opponent: '', homeAway: '', competition: '' };
    body = '<form data-form="match" class="col" style="gap:12px"' + (em ? ' data-sid="' + esc(em.id) + '"' : '') + '><label class="f"><span>Opponent</span><input type="text" name="opponent" required maxlength="50" value="' + esc(dm.opponent) + '"></label><div class="grid2"><label class="f"><span>Date</span><input type="date" name="date" required value="' + esc(dm.date) + '"></label><label class="f"><span>Kick-off</span><input type="time" name="time" value="' + esc(dm.time) + '"></label></div><div class="grid2"><label class="f"><span>Home or away</span><select name="homeAway"><option value="">Not set</option><option value="home"' + (dm.homeAway === 'home' ? ' selected' : '') + '>Home</option><option value="away"' + (dm.homeAway === 'away' ? ' selected' : '') + '>Away</option></select></label><label class="f"><span>Venue</span><input type="text" name="venue" maxlength="50" value="' + esc(dm.venue) + '"></label></div><label class="f"><span>Competition (optional)</span><input type="text" name="competition" maxlength="50" value="' + esc(dm.competition) + '" placeholder="League, cup, friendly"></label><button class="btn primary" type="submit">' + (em ? 'Save' : 'Add match') + '</button></form>' +
      (em ? '<button class="btn danger" data-a="deleteEvent" data-sid="' + esc(em.id) + '">' + (sh.confirm ? 'Tap again to delete this match' : 'Delete this match') + '</button>' : '');
  } else if (sh.t === 'log') {
    var ls = evById(sh.sid); if (!ls) return ''; title = 'Log attendance';
    var plan = planFor(ls, stats).ids; var going = goingIds(ls);
    body = '<form data-form="log" data-sid="' + esc(ls.id) + '" class="col" style="gap:14px"><span class="soft small">' + esc(fmtLong(ls.date)) + '. Tick who came and the drills you ran. Everyone’s skill stats update from this.</span>' +
      '<h3>Who came</h3><div class="col" style="gap:6px">' + players().map(function (p) { return '<label class="check"><input type="checkbox" name="att" value="' + esc(p.id) + '"' + (going.indexOf(p.id) >= 0 ? ' checked' : '') + '>' + esc(p.name) + '</label>'; }).join('') + '</div>' +
      '<h3>Drills you ran</h3><div class="col" style="gap:6px">' + drillsArr().sort(function (a, b) { return (plan.indexOf(a.id) < 0) - (plan.indexOf(b.id) < 0) || a.name.localeCompare(b.name); }).map(function (d) { return '<label class="check"><input type="checkbox" name="drill" value="' + esc(d.id) + '"' + (plan.indexOf(d.id) >= 0 ? ' checked' : '') + '><span class="col" style="gap:1px"><span>' + esc(d.name) + '</span><span class="small muted">' + esc((d.skills || []).join(', ').toLowerCase()) + '</span></span></label>'; }).join('') + '</div>' +
      '<button class="btn primary" type="submit">Save attendance</button></form>';
  } else if (sh.t === 'logMatch') {
    var lm = evById(sh.sid); if (!lm) return ''; title = 'Result: ' + esc(evTitle(lm));
    var att = lm.done ? (lm.attended || []) : goingIds(lm);
    body = '<form data-form="logMatch" data-sid="' + esc(lm.id) + '" class="col" style="gap:14px"><span class="soft small">' + esc(fmtLong(lm.date)) + '</span><div class="grid2"><label class="f"><span>' + esc(TEAM) + '</span><input type="number" name="for" min="0" max="99" required value="' + esc(lm.scoreFor == null ? '' : lm.scoreFor) + '" inputmode="numeric"></label><label class="f"><span>' + esc(lm.opponent || 'Opponent') + '</span><input type="number" name="against" min="0" max="99" required value="' + esc(lm.scoreAgainst == null ? '' : lm.scoreAgainst) + '" inputmode="numeric"></label></div>' +
      '<h3>Who played</h3><div class="col" style="gap:6px">' + players().map(function (p) { return '<label class="check"><input type="checkbox" name="att" value="' + esc(p.id) + '"' + (att.indexOf(p.id) >= 0 ? ' checked' : '') + '>' + esc(p.name) + '</label>'; }).join('') + '</div>' +
      '<button class="btn primary" type="submit">Save result</button></form>' + (lm.done ? '<button class="btn ghost" data-a="sheet" data-t="editMatch" data-sid="' + esc(lm.id) + '">Edit match details</button>' : '');
  } else if (sh.t === 'drillView') {
    var dv = S.drills[sh.did]; if (!dv) return ''; title = esc(dv.name);
    var t = selTraining(); var inPlan = t && planFor(t, stats).ids.indexOf(sh.did) >= 0;
    body = '<div class="row" style="gap:6px;flex-wrap:wrap"><span class="tag">' + (dv.kind === 'warmup' ? 'Warm-up' : dv.kind === 'game' ? 'Game' : 'Drill') + '</span><span class="tag">' + (+dv.mins || 0) + ' min</span>' + (dv.skills || []).map(function (k) { return '<span class="tag blue">' + esc(k) + '</span>'; }).join('') + '</div>' +
      (dv.setup ? '<div class="col" style="gap:6px"><h3>How it works</h3><span class="desc soft" style="line-height:1.55">' + esc(dv.setup) + '</span></div>' : '') +
      (dv.cue ? '<div class="col" style="gap:6px"><h3>Coaching point</h3><span class="soft" style="line-height:1.55">' + esc(dv.cue) + '</span></div>' : '') +
      (dv.link ? '<a class="btn" href="' + esc(dv.link) + '" target="_blank" rel="noopener">Watch the video or diagram</a>' : '') +
      '<div class="grid2">' + (t ? (inPlan ? '<button class="btn" disabled>In the ' + esc(fmtD(t.date)) + ' plan</button>' : '<button class="btn primary" data-a="addToPlan" data-did="' + esc(sh.did) + '">Add to ' + esc(fmtD(t.date)) + '</button>') : '<span></span>') + '<button class="btn" data-a="sheet" data-t="drill" data-did="' + esc(sh.did) + '">Edit drill</button></div>';
  } else if (sh.t === 'drill') {
    var dr = sh.did ? S.drills[sh.did] : null; title = dr ? 'Edit drill' : 'Add a drill'; dr = dr || { name: '', mins: 15, kind: 'drill', skills: [], setup: '', cue: '', link: '' };
    body = '<form data-form="drill" class="col" style="gap:12px"' + (sh.did ? ' data-did="' + esc(sh.did) + '"' : '') + '><label class="f"><span>Name</span><input type="text" name="name" required maxlength="60" value="' + esc(dr.name) + '"></label><div class="grid2"><label class="f"><span>Minutes</span><input type="number" name="mins" min="5" max="60" step="5" value="' + esc(dr.mins) + '"></label><label class="f"><span>Type</span><select name="kind">' + [['warmup', 'Warm-up'], ['drill', 'Drill'], ['game', 'Game']].map(function (k) { return '<option value="' + k[0] + '"' + ((dr.kind || 'drill') === k[0] ? ' selected' : '') + '>' + k[1] + '</option>'; }).join('') + '</select></label></div>' +
      '<fieldset style="border:0;padding:0;margin:0" class="col"><legend class="small muted" style="font-weight:500;margin-bottom:6px">Skills it trains</legend><div class="chips">' + c.skills.map(function (k) { return '<label class="chip"><input type="checkbox" name="skills" value="' + esc(k) + '"' + ((dr.skills || []).indexOf(k) >= 0 ? ' checked' : '') + '>' + esc(k) + '</label>'; }).join('') + '</div></fieldset>' +
      '<label class="f"><span>How it works: setup and rules</span><textarea name="setup" maxlength="1500" rows="5">' + esc(dr.setup || '') + '</textarea></label><label class="f"><span>Coaching point</span><input type="text" name="cue" maxlength="200" value="' + esc(dr.cue || '') + '"></label><label class="f"><span>Video or diagram link (optional)</span><input type="text" inputmode="url" name="link" maxlength="500" placeholder="https://" value="' + esc(dr.link || '') + '"></label><button class="btn primary" type="submit">Save drill</button></form>' +
      (sh.did ? '<button class="btn danger" data-a="deleteDrill" data-did="' + esc(sh.did) + '">' + (sh.confirm ? 'Tap again to delete this drill' : 'Delete this drill') + '</button>' : '');
  } else if (sh.t === 'settings') {
    title = 'Settings';
    body = '<form data-form="settings" class="col" style="gap:12px"><div class="grid2"><label class="f"><span>Due after (days)</span><input type="number" name="fresh" min="1" max="60" value="' + c.fresh + '"></label><label class="f"><span>Overdue after (days)</span><input type="number" name="overdue" min="2" max="90" value="' + c.overdue + '"></label></div><div class="grid2"><label class="f"><span>Session length (min)</span><input type="number" name="sessionMins" min="30" max="180" step="5" value="' + c.sessionMins + '"></label><label class="f"><span>Season ends</span><input type="date" name="seasonEnd" value="' + esc(c.seasonEnd) + '"></label></div><label class="check"><input type="checkbox" name="openAccess"' + (c.openAccess ? ' checked' : '') + '>Players only need the website address (no team link)</label><label class="f"><span>Skills tracked, separated by commas</span><textarea name="skills">' + esc(c.skills.join(', ')) + '</textarea></label><button class="btn primary" type="submit">Save settings</button></form><span class="small muted">Renaming a skill starts its history again, so re-tag any drills that used the old name.</span>';
  }
  return '<div class="scrim" data-a="close"><div class="sheet" role="dialog" aria-modal="true" aria-label="' + title + '"><div class="row between" style="align-items:flex-start"><h2>' + title + '</h2><button class="iconbtn" data-a="close" aria-label="Close">' + svg('M6 6l12 12M18 6L6 18', 20, 2) + '</button></div>' + body + '</div></div>';
}

/* ---------- gate screens ---------- */
function screen(html) { document.getElementById('tabs').innerHTML = ''; document.getElementById('sheet').innerHTML = ''; document.getElementById('app').innerHTML = html; }
function viewGate() {
  if (S.phase === 'setup') return screen('<div class="panel login"><h2>Almost there</h2><p class="soft small">Add your Supabase project URL and publishable key to config.js, then upload the site again.</p></div>');
  if (S.phase === 'error') return screen('<div class="panel login"><h2>Can’t reach the squad data</h2><p class="soft small">' + esc(S.errMsg || 'Check your connection, then try again.') + '</p><button class="btn primary" data-a="retry">Try again</button></div>');
  if (S.phase === 'nolink') return screen('<form class="panel login" data-form="teamcode"><span class="muted">' + esc(TEAM) + '</span><h2>Open the team link</h2><p class="soft small">' + esc(S.errMsg || 'Open the link your coach shared with the squad, or paste it below. Your phone will remember you after that.') + '</p><label class="f"><span>Team link</span><input type="text" name="code" required autocomplete="off" placeholder="https://"></label><button class="btn primary" type="submit">Continue</button></form>');
  if (S.phase === 'notadmin') return screen('<div class="panel login"><h2>Not a coach account</h2><p class="soft small">' + esc(S.email) + ' is signed in but isn’t set up as a coach.</p><button class="btn" data-a="logout">Sign out</button></div>');
  if (S.phase === 'setpw') return screen('<form class="panel login" data-form="setpw"><span class="muted">' + esc(TEAM) + '</span><h2>Set your password</h2><p class="soft small">' + esc(S.email) + ': choose the password you’ll use to sign in to the coach page.</p><input type="email" name="username" value="' + esc(S.email) + '" autocomplete="username" hidden><label class="f"><span>New password</span><input type="password" name="pw" required minlength="8" autocomplete="new-password"></label><label class="f"><span>Confirm password</span><input type="password" name="pw2" required minlength="8" autocomplete="new-password"></label><button class="btn primary" type="submit">Save password</button></form>');
  if (S.phase === 'login') return screen('<form class="panel login" data-form="login"><img class="logo" src="logo.jpg" alt=""><span class="muted">' + esc(TEAM) + '</span><h1 style="font-size:34px">Coach sign in</h1>' + (S.errMsg ? '<div class="banner">' + esc(S.errMsg) + '</div>' : '') + '<label class="f"><span>Email</span><input type="email" name="email" required autocomplete="username"></label><label class="f"><span>Password</span><input type="password" name="password" required autocomplete="current-password"></label><button class="btn primary" type="submit">Sign in</button><button class="btn ghost" type="button" data-a="forgot">Forgot password?</button></form>');
  return screen('<div class="empty">Loading…</div>');
}

/* ---------- render ---------- */
function typing() { var a = document.activeElement; return a && a.closest && a.closest('form') && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && a.type !== 'checkbox'; }
document.addEventListener('focusout', function () { setTimeout(function () { if (S.pending && !typing()) { S.pending = false; render(); } }, 0); });
function render(force) {
  if (S.phase !== 'ready') return viewGate();
  if (!force && typing()) { S.pending = true; return; }
  var showTabs = isCoach() || S.me;
  var activeTab = S.tab === 'players' ? 'coach' : (S.tab === 'stats' && isCoach() ? 'coach' : S.tab);
  document.getElementById('tabs').innerHTML = showTabs ? '<div class="in">' + TABS.map(function (t) { return '<a href="#' + t[0] + '"' + (activeTab === t[0] ? ' aria-current="page"' : '') + '>' + svg(ICONS[t[0] === 'stats' ? 'stats' : t[0]]) + '<span>' + t[1] + '</span></a>'; }).join('') + '</div>' : '';
  var stats = computeStats();
  var views = { home: viewHome, calendar: viewCalendar, training: viewTraining, matches: viewMatches, drills: viewDrills, stats: viewStats, coach: viewCoach, players: viewPlayers };
  var v = views[S.tab] || (isCoach() ? viewCoach : viewHome);
  if (!isCoach() && !S.me) v = viewWho;
  if (!isCoach() && (S.tab === 'drills' || S.tab === 'players' || S.tab === 'coach')) v = viewHome;
  var y = window.scrollY;
  document.getElementById('app').innerHTML = v(stats);
  var key = JSON.stringify(S.sheet); var host = document.getElementById('sheet');
  if (force || key !== S.sheetKey || !host.querySelector('form')) { host.innerHTML = sheetHTML(stats); S.sheetKey = key; }
  window.scrollTo(0, y);
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
    navigator.clipboard.writeText(text).then(function () { toast('Link copied'); }, function () { toast('Couldn’t copy. Press and hold the link to copy it.'); });
  } else toast('Press and hold the link to copy it.');
}
document.addEventListener('click', function (e) {
  var el = e.target.closest('[data-a]'); if (!el) return;
  var a = el.dataset.a;
  if (a === 'close') { if (el.classList.contains('scrim') && e.target !== el) return; closeSheet(); return; }
  if (el.tagName === 'A') return;
  e.preventDefault();
  var stats = computeStats(); var t = selTraining();
  if (a === 'retry') { location.reload(); }
  else if (a === 'logout') { sb.auth.signOut().then(function () { S.phase = 'login'; render(); }); }
  else if (a === 'forgot') {
    var em = (document.querySelector('input[name=email]') || {}).value || '';
    if (!/@/.test(em)) { toast('Type your email above, then tap Forgot password.'); return; }
    sb.auth.resetPasswordForEmail(em.trim(), { redirectTo: location.origin + location.pathname }).then(function (r) { toast(r.error ? (r.error.message || 'Couldn’t send the email.') : 'Check your email for a link to set a new password.'); });
  }
  else if (a === 'install') { if (installEvt) { installEvt.prompt(); installEvt.userChoice.then(function () { installEvt = null; render(true); }); } }
  else if (a === 'installHide') { store('futsal_install_hide', '1'); render(true); }
  else if (a === 'iam') { openSheet('confirmMe', { pid: el.dataset.pid }); }
  else if (a === 'iamYes') { S.sheet = null; S.me = el.dataset.pid; store('futsal_me', S.me); S.tab = 'home'; if (location.hash && location.hash !== '#home') location.hash = '#home'; render(true); }
  else if (a === 'notme') { S.me = null; store('futsal_me', null); S.tab = 'home'; render(true); }
  else if (a === 'rsvp') { saveAnswers(el.dataset.pid, [el.dataset.sid], el.dataset.v); }
  else if (a === 'allyes') { var ids = (el.dataset.ids || '').split(',').filter(Boolean); saveAnswers(S.me, ids, 'going').then(function (ok) { if (ok) toast('Answered yes to ' + plural(ids.length, 'session')); }); }
  else if (a === 'month') { S.calMonth = shiftMonth(S.calMonth, +el.dataset.v); S.calSid = null; render(true); }
  else if (a === 'calday') { S.calSid = el.dataset.sid; render(true); var row = document.getElementById('ev-' + S.calSid); if (row) row.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  else if (a === 'pickTrain') { S.selTrain = el.dataset.sid; S.open = -1; render(true); }
  else if (a === 'drillFilter') { S.drillFilter = el.dataset.v; render(true); }
  else if (a === 'scope') { S.scope = el.dataset.v; render(true); }
  else if (a === 'toggle') { var ix = +el.dataset.i; S.open = S.open === ix ? -1 : ix; render(true); }
  else if (a === 'sheet') { openSheet(el.dataset.t, { pid: el.dataset.pid, did: el.dataset.did, sid: el.dataset.sid }); }
  else if (a === 'viewPlayer') { S.statPid = el.dataset.pid; S.sheet = null; if (S.tab === 'stats') render(true); else location.hash = '#stats'; }
  else if (a === 'copy') { copyText(el.dataset.link); }
  else if (a === 'share') { navigator.share({ title: TEAM, text: TEAM + ': tap to say if you can make each session', url: el.dataset.link }).catch(function () {}); }
  else if (a === 'newTeamLink') {
    if (!S.sheet.confirm) { S.sheet.confirm = true; render(true); return; }
    run(function () { return sb.from('settings').update({ team_token: uuid() }).eq('id', 1).then(must); }, 'New team link made. Send it to the squad.').then(function () { S.sheet = { t: 'teamLink' }; render(true); });
  }
  else if (a === 'addToPlan') {
    if (!t) { toast('Add a training session first.'); return; }
    var pids = planFor(t, stats).ids.slice(); if (pids.indexOf(el.dataset.did) < 0) {
      var gi = pids.findIndex(function (x) { return (S.drills[x] || {}).kind === 'game'; });
      if (gi >= 0) pids.splice(gi, 0, el.dataset.did); else pids.push(el.dataset.did);
    }
    run(function () { return sb.from('sessions').update({ plan: pids }).eq('id', t.id).then(must); }, 'Added to the ' + fmtD(t.date) + ' plan').then(function (ok) { if (ok) { delete S.work[t.id]; render(true); } });
  }
  else if (a === 'swap' && t) {
    var cur = planFor(t, stats).ids.slice(); var i2 = +el.dataset.i; var dd = S.drills[cur[i2]]; if (!dd) return;
    var wm = weights(basisFor(t), stats);
    var alts = drillsArr().filter(function (x) { return (x.kind || 'drill') === (dd.kind || 'drill') && (x.id === cur[i2] || cur.indexOf(x.id) < 0); }).sort(function (a2, b2) { return drillScore(b2, wm) - drillScore(a2, wm) || a2.name.localeCompare(b2.name); });
    if (alts.length < 2) { toast('Nothing else of that type to swap in. Add more in Drills.'); return; }
    var k = alts.findIndex(function (x) { return x.id === cur[i2]; }); cur[i2] = alts[(k + 1) % alts.length].id; S.work[t.id] = cur; render(true);
  }
  else if (a === 'removeBlock' && t) { var c2 = planFor(t, stats).ids.slice(); c2.splice(+el.dataset.i, 1); S.work[t.id] = c2; S.open = -1; render(true); }
  else if (a === 'savePlan' && t) { var ids2 = planFor(t, stats).ids.slice(); run(function () { return sb.from('sessions').update({ plan: ids2 }).eq('id', t.id).then(must); }, 'Plan saved').then(function (ok) { if (ok) { delete S.work[t.id]; render(true); } }); }
  else if (a === 'resetPlan' && t) { run(function () { return sb.from('sessions').update({ plan: [] }).eq('id', t.id).then(must); }, 'New plan suggested'); }
  else if (a === 'deletePlayer') {
    if (!S.sheet.confirm) { S.sheet.confirm = true; render(true); return; }
    var dp = el.dataset.pid; run(function () { return sb.from('players').delete().eq('id', dp).then(must); }, 'Player removed').then(function (ok) { if (ok) { closeSheet(); if (S.tab === 'stats') location.hash = '#players'; } });
  }
  else if (a === 'deleteEvent') {
    if (!S.sheet.confirm) { S.sheet.confirm = true; render(true); return; }
    var ds = el.dataset.sid; run(function () { return sb.from('sessions').delete().eq('id', ds).then(must); }, 'Deleted').then(function (ok) { if (ok) { S.selTrain = null; closeSheet(); } });
  }
  else if (a === 'deleteDrill') {
    if (!S.sheet.confirm) { S.sheet.confirm = true; render(true); return; }
    var dl = el.dataset.did; run(function () { return sb.from('drills').delete().eq('id', dl).then(must); }, 'Drill deleted').then(function (ok) { if (ok) closeSheet(); });
  }
});
document.addEventListener('change', function (e) {
  var k = e.target.dataset && e.target.dataset.change; if (!k) return;
  if (k === 'statPid') S.statPid = e.target.value;
  render(true);
});
document.addEventListener('submit', function (e) {
  var f = e.target; var t = f.dataset.form; if (!t) return; e.preventDefault();
  var fd = new FormData(f); function g(n) { return String(fd.get(n) || '').trim(); }
  if (t === 'setpw') {
    var pw = String(fd.get('pw') || ''), pw2 = String(fd.get('pw2') || '');
    if (pw.length < 8) { toast('Use at least 8 characters.'); return; }
    if (pw !== pw2) { toast('The two passwords don’t match.'); return; }
    var b2 = f.querySelector('button[type=submit]'); b2.disabled = true;
    sb.auth.updateUser({ password: pw }).then(function (r) { b2.disabled = false; if (r.error) { toast(r.error.message || 'Couldn’t save the password.'); return; } toast('Password saved'); S.needPassword = false; startAdmin(); });
    return;
  }
  if (t === 'teamcode') {
    var m = g('code').match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    if (!m) { toast('That doesn’t look like the team link. Copy the whole link your coach sent.'); return; }
    store('futsal_team', m[0]); location.href = location.pathname + '?t=' + m[0];
    return;
  }
  if (t === 'login') {
    var btn = f.querySelector('button[type=submit]'); btn.disabled = true;
    sb.auth.signInWithPassword({ email: g('email'), password: String(fd.get('password') || '') }).then(function (r) { btn.disabled = false; if (r.error) { toast(r.error.message || 'Sign in failed'); return; } S.errMsg = ''; startAdmin(); });
  }
  else if (t === 'addPlayer') {
    var nm = g('name'); if (!nm) return;
    run(function () { return sb.from('players').insert({ name: nm, pos: g('pos') }).then(must); }, nm + ' added').then(function (ok) { if (ok) { f.reset(); var inp = f.querySelector('input[name=name]'); if (inp) inp.focus(); } });
  }
  else if (t === 'editPlayer') {
    var pid = f.dataset.pid;
    run(function () { return sb.from('players').update({ name: g('name'), pos: g('pos') }).eq('id', pid).then(must); }, 'Saved').then(function (ok) { if (ok) closeSheet(); });
  }
  else if (t === 'training') {
    var st = g('time'), en = g('endTime');
    var mins = 90; if (st && en) { var a1 = st.split(':'), b1 = en.split(':'); mins = Math.max(30, ((+b1[0]) * 60 + (+b1[1])) - ((+a1[0]) * 60 + (+a1[1]))); }
    var data = { kind: 'training', title: g('title') || 'Training', date: g('date'), time: st, end_time: en, venue: g('venue'), mins: mins };
    if (!data.date) return; var sid = f.dataset.sid || null; var season = g('repeat') === 'season';
    var dates = [data.date]; if (season) { var end = cfg().seasonEnd; dates = []; for (var dd = data.date; dd <= end && dates.length < 60; dd = addDays(dd, 7)) dates.push(dd); }
    var existing = {}; eventsArr().forEach(function (x) { if (x.kind === 'training') existing[x.date] = 1; });
    run(function () {
      if (sid) return sb.from('sessions').update(data).eq('id', sid).then(must);
      var rows = dates.filter(function (d) { return !season || !existing[d]; }).map(function (d) { return Object.assign({}, data, { date: d }); });
      if (!rows.length) return Promise.resolve();
      return sb.from('sessions').insert(rows).select('id').then(function (r) { var d = must(r); sid = d && d[0] && d[0].id; });
    }, f.dataset.sid ? 'Session updated' : (season ? 'Weekly sessions added until the end of the season' : 'Training added')).then(function (ok) { if (ok) { if (sid) S.selTrain = sid; closeSheet(); } });
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
    var d = { name: g('name'), mins: +g('mins') || 15, kind: g('kind') || 'drill', skills: sk, setup: g('setup'), cue: g('cue'), link: link }; var did = f.dataset.did;
    run(function () { return (did ? sb.from('drills').update(d).eq('id', did) : sb.from('drills').insert(d)).then(must); }, 'Drill saved').then(function (ok) { if (ok) closeSheet(); });
  }
  else if (t === 'settings') {
    var fr = Math.max(1, +g('fresh') || 7); var ov = Math.max(fr + 1, +g('overdue') || 14);
    var skills = g('skills').split(',').map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 12);
    var upd = { fresh: fr, overdue: ov, session_mins: +g('sessionMins') || 90, skills: skills.length ? skills : DEFAULT_SKILLS }; if (g('seasonEnd')) upd.season_end = g('seasonEnd'); upd.open_access = fd.get('openAccess') != null;
    run(function () { return sb.from('settings').update(upd).eq('id', 1).then(must); }, 'Settings saved').then(function (ok) { if (ok) closeSheet(); });
  }
});

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
  var fromUrl = params.get('t');
  var tok = fromUrl || load('futsal_team');
  if (tok && !/^[0-9a-f-]{36}$/i.test(tok)) tok = null;
  if (tok) store('futsal_team', tok);
  S.team = tok || null; S.me = load('futsal_me');
  try { await reload(); } catch (e) { S.phase = 'error'; S.errMsg = e && e.message; render(); }
}
function refreshQuietly() {
  if (S.phase !== 'ready' || S.sheet || S.busy || typing() || document.visibilityState !== 'visible') return;
  reload().catch(function () {});
}
document.title = TEAM + (MODE === 'admin' ? ' coach' : '');
if ('serviceWorker' in navigator && location.protocol === 'https:') { window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); }); }
if (!window.supabase || !CFG.SUPABASE_URL || /YOUR-/.test(CFG.SUPABASE_URL + CFG.SUPABASE_KEY)) {
  S.phase = window.supabase ? 'setup' : 'error'; if (!window.supabase) S.errMsg = 'Couldn’t load the app. Check your connection and refresh.'; render();
} else {
  var authHash = location.hash || '';
  S.needPassword = /type=(invite|recovery|signup|magiclink)/.test(authHash);
  S.linkError = /error_description=([^&]+)/.exec(authHash);
  sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_KEY);
  sb.auth.onAuthStateChange(function (ev) { if (ev === 'PASSWORD_RECOVERY') { S.needPassword = true; S.phase = 'setpw'; render(); } });
  var h0 = (location.hash || '').replace('#', ''); if (ROUTES.indexOf(h0) >= 0) S.tab = h0;
  if (MODE === 'admin') startAdmin(); else startPlayer();
  setInterval(refreshQuietly, 30000);
  document.addEventListener('visibilitychange', refreshQuietly);
}
})();
