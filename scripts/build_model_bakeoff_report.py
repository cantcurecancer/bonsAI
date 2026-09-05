#!/usr/bin/env python3
"""Title: Deck model bake-off report builder

Purpose: Turn the answer-test reports, the embedding sweep reports, the hand-kept roster and the Deck
         run sheet into one self-contained interactive page, so a re-run of any test refreshes the
         page instead of a document going stale.
Used for: docs/archive/research/model-bakeoff-report.html (the living report) and the published copy
          of the same page; docs/planning/41-deck-model-survey.md links to it.
Solves: The bake-off numbers lived in eight separate markdown reports and one json file, with the
        licence and size facts in a fourth place. Nobody re-reads nine files.
Does not: Run any test, talk to Ollama, or judge a model. It reads what the test scripts wrote.

Usage:
  python scripts/build_model_bakeoff_report.py                 # rebuild the page from what is on disk
  python scripts/build_model_bakeoff_report.py --fragment OUT  # also write a copy without the html/head/body
                                                               # wrapper, for publishing as an artifact
"""
from __future__ import annotations

import argparse
import datetime as dt
import glob
import json
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RESEARCH = ROOT / "docs" / "archive" / "research"
ROSTER = ROOT / "data" / "model_bakeoff" / "roster.json"
DECK_RUNS = ROOT / "data" / "model_bakeoff" / "deck-runs.json"
OUT = RESEARCH / "model-bakeoff-report.html"

METRICS = [
    ("facts", "Facts kept", "Facts kept"),
    ("contra", "Nothing contradicted", "No contradiction"),
    ("fence_ok", "Fence not misfired", "Fence not misfired"),
    ("fence_due", "Fence when due", "Fence present when due"),
    ("menu", "Strategy menu present", "Branch menu on Strategy first turn"),
    ("stray", "No menu outside Strategy", "No menu on Speed/Expert"),
    ("ok", "Ask succeeded", "Ask succeeded"),
    ("clean", "Every sample clean", "Cases with every sample clean"),
]

SETTING_RE = re.compile(r"^\| (\w+) \| `([^`]*)` \|", re.M)
ROW_RE = re.compile(r"^\| ([^|]+?) \| \*\*([\d.]+)%\*\* \((\d+)/(\d+)\)", re.M)
NAME_RE = re.compile(r"kb-answer-eval-(\d{4}-\d{2}-\d{2})(?:-([A-Za-z0-9-]+))?\.md$")


def parse_answer_reports() -> list[dict]:
    runs = []
    for path in sorted(glob.glob(str(RESEARCH / "kb-answer-eval-*.md"))):
        name = os.path.basename(path)
        m = NAME_RE.search(name)
        if not m:
            continue
        text = Path(path).read_text(encoding="utf-8")
        settings = {k: v for k, v in SETTING_RE.findall(text)}
        model = settings.get("model")
        if not model:
            continue
        rows = {r[0].strip(): (float(r[1]), int(r[2]), int(r[3])) for r in ROW_RE.findall(text)}
        metrics = {}
        for key, _label, row_name in METRICS:
            if row_name in rows:
                pct, hit, total = rows[row_name]
                metrics[key] = {"pct": pct, "hit": hit, "total": total}
        runs.append({
            "date": m.group(1),
            "label": m.group(2) or "",
            "file": name,
            "model": model,
            "corpus": settings.get("corpus_version", ""),
            "cases": int(settings.get("cases", "0") or 0),
            "samples": int(settings.get("samples_per_case", "0") or 0),
            "minutes": float(settings.get("run_minutes", "0") or 0),
            "variant": settings.get("prompt_variant", ""),
            "metrics": metrics,
        })
    return runs


def parse_embed_reports() -> list[dict]:
    out = []
    for path in sorted(glob.glob(str(RESEARCH / "kb-embed-bakeoff-*.json"))):
        try:
            d = json.loads(Path(path).read_text(encoding="utf-8"))
        except Exception:
            continue
        english = d.get("english") or {}
        table = english.get("prompted") or english.get("bare") or {}
        if not isinstance(table, dict) or not table:
            continue
        models = []
        for tag, row in table.items():
            models.append({
                "model": tag,
                "top1": row.get("top1_pct"),
                "top3": row.get("top3_pct"),
                "ms": row.get("mean_embed_ms"),
            })
        kb = d.get("keyword_baseline") or {}
        out.append({
            "date": d.get("date", ""),
            "file": os.path.basename(path),
            "models": models,
            "keyword": {"top1": kb.get("top1_pct"), "top3": kb.get("top3_pct")},
            "winner": d.get("winner", ""),
            "recommendation": d.get("recommendation", ""),
        })
    return out


def load_json(path: Path, default):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return default


def build_data() -> dict:
    roster = load_json(ROSTER, {"models": [], "today": {}, "deck_fit_gb": 7.5})
    deck = load_json(DECK_RUNS, {"runs": []})
    return {
        "generated": dt.datetime.now().strftime("%Y-%m-%d %H:%M"),
        "metrics": [{"key": k, "label": l} for k, l, _ in METRICS],
        "runs": parse_answer_reports(),
        "embed": parse_embed_reports(),
        "roster": roster.get("models", []),
        "today": roster.get("today", {}),
        "deck_fit_gb": roster.get("deck_fit_gb", 7.5),
        "deck_runs": deck.get("runs", []),
    }


HEAD = """<title>Deck Model Bake-off, Sept 2026</title>
<style>
  :root {
    color-scheme: light;
    --surface: #fcfcfb; --surface-2: #f3f2ef; --line: #e2e1dc; --grid: #ebeae6;
    --text: #0b0b0b; --text-2: #52514e; --muted: #7a7974;
    --series: #2a78d6; --series-soft: rgba(42, 120, 214, 0.14);
    --good: #0ca30c; --warning: #fab219; --critical: #d03b3b;
    --focus: #2a78d6;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      color-scheme: dark;
      --surface: #1a1a19; --surface-2: #232321; --line: #34332f; --grid: #2a2a27;
      --text: #ffffff; --text-2: #c3c2b7; --muted: #8f8e86;
      --series: #3987e5; --series-soft: rgba(57, 135, 229, 0.18);
      --focus: #3987e5;
    }
  }
  :root[data-theme="dark"] {
    color-scheme: dark;
    --surface: #1a1a19; --surface-2: #232321; --line: #34332f; --grid: #2a2a27;
    --text: #ffffff; --text-2: #c3c2b7; --muted: #8f8e86;
    --series: #3987e5; --series-soft: rgba(57, 135, 229, 0.18);
    --focus: #3987e5;
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--surface); color: var(--text); font: 15px/1.5 system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  .wrap { max-width: 1120px; margin: 0 auto; padding: 28px 22px 60px; display: grid; gap: 30px; }
  h1 { font-size: 26px; font-weight: 600; margin: 0 0 6px; letter-spacing: -0.01em; text-wrap: balance; }
  h2 { font-size: 18px; font-weight: 600; margin: 0 0 6px; }
  p { margin: 0; }
  .lead { color: var(--text-2); max-width: 72ch; }
  .meta { color: var(--muted); font-size: 13px; margin-top: 8px; }
  .filters { display: flex; flex-wrap: wrap; gap: 14px; align-items: end; padding: 14px 16px; background: var(--surface-2); border: 1px solid var(--line); border-radius: 8px; }
  .filters label { display: grid; gap: 4px; font-size: 12px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--text-2); }
  .filters select, .filters input[type="checkbox"] { font: inherit; }
  .filters select { padding: 6px 8px; border: 1px solid var(--line); border-radius: 6px; background: var(--surface); color: var(--text); min-width: 180px; }
  .check { display: flex; align-items: center; gap: 8px; text-transform: none; font-weight: 500; font-size: 14px; letter-spacing: 0; padding-bottom: 6px; }
  .tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; }
  .tile { padding: 14px 16px; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); }
  .tile .lbl { font-size: 13px; color: var(--text-2); }
  .tile .val { font-size: 30px; font-weight: 600; font-variant-numeric: tabular-nums; line-height: 1.15; margin-top: 2px; }
  .tile .sub { font-size: 13px; color: var(--muted); margin-top: 2px; }
  .chart { border: 1px solid var(--line); border-radius: 8px; padding: 14px 16px 8px; background: var(--surface); position: relative; }
  .chart h2 { margin-bottom: 2px; }
  .chart .sub { color: var(--muted); font-size: 13px; margin-bottom: 10px; }
  .chart svg { width: 100%; height: auto; display: block; overflow: visible; }
  .chart text { font-family: inherit; fill: var(--text); }
  .chart .tick { fill: var(--muted); font-size: 11px; }
  .chart .lab { font-size: 13px; }
  .chart .val { font-size: 12px; fill: var(--text-2); font-variant-numeric: tabular-nums; }
  .chart .grid { stroke: var(--grid); stroke-width: 1; }
  .chart .ref { stroke: var(--text-2); stroke-width: 1; stroke-dasharray: 4 3; }
  .chart .hit { fill: transparent; cursor: default; }
  .chart .hit:focus-visible { outline: 2px solid var(--focus); }
  .legend { display: flex; gap: 16px; font-size: 12px; color: var(--text-2); margin-top: 6px; flex-wrap: wrap; }
  .legend i { display: inline-block; width: 18px; border-top: 1px dashed var(--text-2); vertical-align: middle; margin-right: 6px; }
  .legend b { display: inline-block; width: 12px; height: 12px; background: var(--series); border-radius: 2px; vertical-align: middle; margin-right: 6px; }
  .tip { position: absolute; pointer-events: none; background: var(--text); color: var(--surface); padding: 6px 9px; border-radius: 6px; font-size: 12px; line-height: 1.35; max-width: 260px; display: none; z-index: 2; }
  .tablewrap { overflow-x: auto; border: 1px solid var(--line); border-radius: 8px; }
  table { border-collapse: collapse; width: 100%; font-size: 13.5px; }
  th, td { text-align: left; padding: 8px 10px; border-top: 1px solid var(--line); white-space: nowrap; vertical-align: top; }
  th { border-top: 0; font-size: 11.5px; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-2); background: var(--surface-2); }
  th button { all: unset; cursor: pointer; }
  th button:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
  td.num { font-variant-numeric: tabular-nums; text-align: right; }
  th.num { text-align: right; }
  .today { font-size: 11px; font-weight: 600; letter-spacing: 0.04em; padding: 1px 7px; border-radius: 999px; background: var(--series-soft); color: var(--text); margin-left: 6px; }
  .st { display: inline-flex; align-items: center; gap: 6px; }
  .st::before { content: ""; width: 9px; height: 9px; border-radius: 50%; background: var(--muted); }
  .st.good::before { background: var(--good); } .st.warning::before { background: var(--warning); } .st.critical::before { background: var(--critical); }
  .lic { display: inline-block; font-size: 12px; padding: 1px 8px; border-radius: 999px; border: 1px solid var(--line); background: var(--surface-2); }
  .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
  .card { border: 1px solid var(--line); border-radius: 8px; padding: 12px 14px; background: var(--surface); font-size: 13.5px; display: grid; gap: 4px; }
  .card b { font-size: 15px; }
  .card .dim { color: var(--text-2); }
  .card a { color: var(--series); text-decoration: none; }
  .card a:focus-visible { outline: 2px solid var(--focus); }
  .card .note { color: var(--text-2); border-top: 1px solid var(--line); padding-top: 6px; margin-top: 4px; }
  .cmd { background: var(--surface-2); border: 1px solid var(--line); border-radius: 6px; padding: 10px 12px; font: 13px/1.5 ui-monospace, Consolas, monospace; overflow-x: auto; white-space: pre; }
  .pending { color: var(--text-2); padding: 12px 14px; border: 1px dashed var(--line); border-radius: 8px; }
  @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
</style>"""

BODY = """<div class="wrap">
  <header>
    <h1>Deck Model Bake-off, Sept 2026</h1>
    <p class="lead">Which models that fit a Steam Deck answer game questions best from bonsAI's knowledge base, whether they protect spoilers, how they are licensed, and how fast they run. The PC half is measured by the plugin's own answer test; the Deck half is measured on the device. Re-run a test and rebuild this page; it reads the reports.</p>
    <p class="meta" id="meta"></p>
  </header>

  <section class="filters" aria-label="Filters">
    <label>Run<select id="runSel"></select></label>
    <label>Metric<select id="metricSel"></select></label>
    <label>Licence<select id="licSel"><option value="all">All</option><option value="foss">Open source only</option><option value="open">Open source and open-weight</option></select></label>
    <label class="check"><input type="checkbox" id="fitChk" checked> Only models that fit the Deck</label>
  </section>

  <section class="tiles" id="tiles" aria-label="Headline numbers"></section>

  <section class="chart" aria-label="Answer test chart">
    <h2 id="chartTitle"></h2>
    <p class="sub" id="chartSub"></p>
    <div id="chart"></div>
    <div class="legend"><span><b></b>candidate, latest run</span><span><i></i>today's model on the same run</span></div>
    <div class="tip" id="tip" role="tooltip"></div>
  </section>

  <section>
    <h2>Answer test, every number</h2>
    <p class="lead">Same cases, three samples each, today's prompt. "Fence when due" is the spoiler check: on a story-beat question, did a hidden block appear at all. Minutes are the run's clock on the PC's graphics card and only rank the models against each other.</p>
    <div class="tablewrap" style="margin-top:10px"><table id="tbl"><thead></thead><tbody></tbody></table></div>
  </section>

  <section>
    <h2>Embedding model for the knowledge base</h2>
    <p class="lead" id="embedLead"></p>
    <div class="tablewrap" style="margin-top:10px"><table id="embedTbl"><thead></thead><tbody></tbody></table></div>
  </section>

  <section>
    <h2>The Deck half: fit and speed</h2>
    <div id="deck"></div>
  </section>

  <section>
    <h2>The roster: licence, size, what each can do</h2>
    <p class="lead">Licence classes use the plugin's own vocabulary. Open source means an OSI-approved licence such as Apache 2.0. Open-weight means the weights are published under the maker's own terms. Sizes are the Ollama download. Published figures come from the makers or comparison sites and give direction only.</p>
    <div class="cards" id="roster" style="margin-top:10px"></div>
  </section>

  <section>
    <h2>How to re-run this</h2>
    <p class="lead">Each command writes a report; the last one rebuilds this page from every report on disk. Add a model to the roster file by hand when a new one joins.</p>
    <div class="cmd" style="margin-top:10px">python scripts/eval_kb_answers.py --model &lt;tag&gt; --label &lt;short-name&gt; --write-report
python scripts/eval_kb_embed_models.py --models nomic-embed-text &lt;tag&gt; ... --write-report
python scripts/build_model_bakeoff_report.py</div>
  </section>
</div>
<script id="data" type="application/json">__DATA__</script>
<script>
(function () {
  var D = JSON.parse(document.getElementById('data').textContent);
  var todayTag = (D.today && D.today.chat) || '';
  var rosterBy = {}; D.roster.forEach(function (m) { rosterBy[m.tag] = m; });
  var el = function (id) { return document.getElementById(id); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function name(tag) { var r = rosterBy[tag]; return r ? r.name : tag; }
  function lic(tag) { var r = rosterBy[tag]; if (!r) return {cls: 'unknown', text: 'unknown'}; return {cls: r.license_class, text: r.license}; }
  function licLabel(cls) { return cls === 'foss' ? 'Open source' : cls === 'open_weight' ? 'Open-weight' : cls === 'non_foss' ? 'Restricted' : 'Unknown'; }
  function fits(tag) { var r = rosterBy[tag]; return r ? (r.disk_gb <= D.deck_fit_gb) : true; }
  function fenceStatus(m) {
    if (!m) return {cls: '', text: 'not measured'};
    if (m.pct >= 100) return {cls: 'good', text: 'protects spoilers'};
    if (m.pct >= 60) return {cls: 'warning', text: 'misses some'};
    return {cls: 'critical', text: 'misses most'};
  }
  el('meta').textContent = 'Page rebuilt ' + D.generated + ' from ' + D.runs.length + ' answer-test reports and ' + D.embed.length + ' embedding sweep' + (D.embed.length === 1 ? '' : 's') + '.';

  // Runs: latest per model, or one date.
  var dates = {}; D.runs.forEach(function (r) { dates[r.date] = true; });
  var dateList = Object.keys(dates).sort().reverse();
  var runSel = el('runSel');
  runSel.innerHTML = '<option value="latest">Latest run per model</option>' + dateList.map(function (d) { return '<option value="' + d + '">' + d + '</option>'; }).join('');
  var metricSel = el('metricSel');
  metricSel.innerHTML = D.metrics.map(function (m) { return '<option value="' + m.key + '">' + esc(m.label) + '</option>'; }).join('');
  metricSel.value = 'fence_due';

  function selectedRuns() {
    var mode = runSel.value, byModel = {};
    D.runs.forEach(function (r) {
      if (mode !== 'latest' && r.date !== mode) return;
      var cur = byModel[r.model];
      if (!cur || r.date > cur.date || (r.date === cur.date && r.file > cur.file)) byModel[r.model] = r;
    });
    var licMode = el('licSel').value, onlyFit = el('fitChk').checked;
    return Object.keys(byModel).map(function (k) { return byModel[k]; }).filter(function (r) {
      var c = lic(r.model).cls;
      if (licMode === 'foss' && c !== 'foss') return false;
      if (licMode === 'open' && c !== 'foss' && c !== 'open_weight') return false;
      if (onlyFit && !fits(r.model)) return false;
      return true;
    });
  }

  function renderTiles(runs) {
    var today = runs.filter(function (r) { return r.model === todayTag; })[0];
    var best = runs.slice().sort(function (a, b) { return ((b.metrics.facts || {}).pct || 0) - ((a.metrics.facts || {}).pct || 0); })[0];
    var protect = runs.filter(function (r) { return r.metrics.fence_due && r.metrics.fence_due.pct >= 100; });
    var tiles = [
      {lbl: 'Models in this view', val: String(runs.length), sub: runSel.value === 'latest' ? 'latest run each' : 'run of ' + runSel.value},
      {lbl: 'Best at keeping facts', val: best ? best.metrics.facts.pct.toFixed(1) + '%' : '—', sub: best ? name(best.model) : ''},
      {lbl: 'Protect spoilers every time', val: String(protect.length), sub: protect.map(function (r) { return name(r.model); }).join(', ') || 'none in this view'},
      {lbl: "Today's model, facts kept", val: today && today.metrics.facts ? today.metrics.facts.pct.toFixed(1) + '%' : '—', sub: today ? name(today.model) : 'not in this view'}
    ];
    el('tiles').innerHTML = tiles.map(function (t) { return '<div class="tile"><div class="lbl">' + esc(t.lbl) + '</div><div class="val">' + esc(t.val) + '</div><div class="sub">' + esc(t.sub) + '</div></div>'; }).join('');
  }

  var tip = el('tip');
  function showTip(evt, html) { tip.innerHTML = html; tip.style.display = 'block'; moveTip(evt); }
  function moveTip(evt) { var box = tip.parentNode.getBoundingClientRect(); tip.style.left = Math.min(evt.clientX - box.left + 12, box.width - 270) + 'px'; tip.style.top = (evt.clientY - box.top + 12) + 'px'; }
  function hideTip() { tip.style.display = 'none'; }

  function renderChart(runs) {
    var key = metricSel.value, label = D.metrics.filter(function (m) { return m.key === key; })[0].label;
    var rows = runs.filter(function (r) { return r.metrics[key]; }).sort(function (a, b) { return b.metrics[key].pct - a.metrics[key].pct; });
    el('chartTitle').textContent = label + ', by model';
    el('chartSub').textContent = key === 'fence_due' ? 'Higher is better. Nine story-beat questions; a hidden block should appear on every one.' : 'Higher is better. Percent of samples that passed the check.';
    var W = 900, labelW = 170, rowH = 28, padTop = 14, padBottom = 26, plotW = W - labelW - 70;
    var H = padTop + rows.length * rowH + padBottom;
    var todayRun = runs.filter(function (r) { return r.model === todayTag && r.metrics[key]; })[0];
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(label) + ' by model">';
    [0, 25, 50, 75, 100].forEach(function (t) {
      var x = labelW + plotW * t / 100;
      s += '<line class="grid" x1="' + x + '" x2="' + x + '" y1="' + padTop + '" y2="' + (H - padBottom + 4) + '"/>';
      s += '<text class="tick" x="' + x + '" y="' + (H - 8) + '" text-anchor="middle">' + t + '%</text>';
    });
    rows.forEach(function (r, i) {
      var m = r.metrics[key], y = padTop + i * rowH, bw = Math.max(0, plotW * m.pct / 100), by = y + 5, bh = 18;
      var isToday = r.model === todayTag;
      s += '<text class="lab" x="' + (labelW - 10) + '" y="' + (y + 18) + '" text-anchor="end">' + esc(name(r.model)) + (isToday ? ' (today)' : '') + '</text>';
      if (bw > 0) s += '<path d="M' + labelW + ' ' + by + ' h' + Math.max(0, bw - 4) + ' a4 4 0 0 1 4 4 v' + (bh - 8) + ' a4 4 0 0 1 -4 4 h-' + Math.max(0, bw - 4) + ' z" fill="var(--series)"/>';
      s += '<text class="val" x="' + (labelW + bw + 8) + '" y="' + (y + 18) + '">' + m.pct.toFixed(1) + '% <tspan fill="var(--muted)">' + m.hit + '/' + m.total + '</tspan></text>';
      s += '<rect class="hit" x="0" y="' + y + '" width="' + W + '" height="' + rowH + '" tabindex="0" data-i="' + i + '"/>';
    });
    if (todayRun) {
      var tx = labelW + plotW * todayRun.metrics[key].pct / 100;
      s += '<line class="ref" x1="' + tx + '" x2="' + tx + '" y1="' + (padTop - 6) + '" y2="' + (H - padBottom + 4) + '"/>';
    }
    s += '</svg>';
    el('chart').innerHTML = s;
    Array.prototype.forEach.call(el('chart').querySelectorAll('.hit'), function (h) {
      var r = rows[parseInt(h.getAttribute('data-i'), 10)], m = r.metrics[key];
      var html = '<b>' + esc(name(r.model)) + '</b><br>' + esc(label) + ': ' + m.pct.toFixed(1) + '% (' + m.hit + ' of ' + m.total + ')<br>run ' + esc(r.date) + (r.label ? ' · ' + esc(r.label) : '') + ' · ' + r.minutes + ' min on the PC';
      h.addEventListener('mouseenter', function (e) { showTip(e, html); });
      h.addEventListener('mousemove', moveTip);
      h.addEventListener('mouseleave', hideTip);
      h.addEventListener('focus', function () { showTip({clientX: tip.parentNode.getBoundingClientRect().left + 200, clientY: tip.parentNode.getBoundingClientRect().top + 60}, html); });
      h.addEventListener('blur', hideTip);
    });
  }

  var sortKey = 'facts', sortDir = -1;
  function renderTable(runs) {
    var cols = [{k: 'model', l: 'Model'}, {k: 'lic', l: 'Licence'}, {k: 'disk', l: 'Download', num: true}]
      .concat(D.metrics.map(function (m) { return {k: m.key, l: m.label, num: true, metric: true}; }))
      .concat([{k: 'minutes', l: 'Minutes', num: true}, {k: 'date', l: 'Run'}]);
    function val(r, c) {
      if (c.metric) return r.metrics[c.k] ? r.metrics[c.k].pct : -1;
      if (c.k === 'model') return name(r.model);
      if (c.k === 'lic') return licLabel(lic(r.model).cls);
      if (c.k === 'disk') return rosterBy[r.model] ? rosterBy[r.model].disk_gb : 0;
      return r[c.k];
    }
    var rows = runs.slice().sort(function (a, b) {
      var col = cols.filter(function (c) { return c.k === sortKey; })[0], x = val(a, col), y = val(b, col);
      return (x < y ? -1 : x > y ? 1 : 0) * sortDir;
    });
    var thead = '<tr>' + cols.map(function (c) { return '<th class="' + (c.num ? 'num' : '') + '"><button type="button" data-k="' + c.k + '">' + esc(c.l) + (sortKey === c.k ? (sortDir < 0 ? ' ▾' : ' ▴') : '') + '</button></th>'; }).join('') + '</tr>';
    var tbody = rows.map(function (r) {
      return '<tr>' + cols.map(function (c) {
        if (c.metric) {
          var m = r.metrics[c.k]; if (!m) return '<td class="num">—</td>';
          if (c.k === 'fence_due') { var st = fenceStatus(m); return '<td class="num"><span class="st ' + st.cls + '">' + m.pct.toFixed(0) + '% · ' + esc(st.text) + '</span></td>'; }
          return '<td class="num">' + m.pct.toFixed(1) + '%</td>';
        }
        if (c.k === 'model') return '<td>' + esc(name(r.model)) + (r.model === todayTag ? '<span class="today">today</span>' : '') + '<div style="color:var(--muted);font-size:12px">' + esc(r.model) + '</div></td>';
        if (c.k === 'lic') { var L = lic(r.model); return '<td><span class="lic">' + esc(licLabel(L.cls)) + '</span><div style="color:var(--muted);font-size:12px">' + esc(L.text) + '</div></td>'; }
        if (c.k === 'disk') return '<td class="num">' + (rosterBy[r.model] ? rosterBy[r.model].disk_gb.toFixed(1) + ' GB' : '—') + '</td>';
        if (c.k === 'minutes') return '<td class="num">' + r.minutes.toFixed(1) + '</td>';
        return '<td>' + esc(r.date) + (r.label ? ' <span style="color:var(--muted)">' + esc(r.label) + '</span>' : '') + '</td>';
      }).join('') + '</tr>';
    }).join('');
    var t = el('tbl'); t.querySelector('thead').innerHTML = thead; t.querySelector('tbody').innerHTML = tbody;
    Array.prototype.forEach.call(t.querySelectorAll('th button'), function (b) {
      b.addEventListener('click', function () { var k = b.getAttribute('data-k'); if (sortKey === k) sortDir = -sortDir; else { sortKey = k; sortDir = -1; } render(); });
    });
  }

  function renderEmbed() {
    var e = D.embed.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; })[0];
    var t = el('embedTbl');
    if (!e) { el('embedLead').textContent = 'No embedding sweep report on disk yet.'; t.querySelector('thead').innerHTML = ''; t.querySelector('tbody').innerHTML = ''; return; }
    el('embedLead').textContent = 'Sweep of ' + e.date + '. "Right card in the first three" is the measure the switch rule uses; nomic needs to lose by 5 points before a swap is considered. Keyword search alone found the card in the first three ' + (e.keyword.top3 != null ? e.keyword.top3.toFixed(1) + '%' : '—') + ' of the time. Winner under the rule: ' + name(e.winner) + '.';
    var rows = e.models.slice().sort(function (a, b) { return (b.top3 || 0) - (a.top3 || 0); });
    t.querySelector('thead').innerHTML = '<tr><th>Model</th><th>Licence</th><th class="num">Right card in first three</th><th class="num">Right card first</th><th class="num">Time per question, PC</th></tr>';
    t.querySelector('tbody').innerHTML = rows.map(function (r) {
      var L = lic(r.model), isToday = r.model === (D.today && D.today.embedding);
      return '<tr><td>' + esc(name(r.model)) + (isToday ? '<span class="today">today</span>' : '') + '</td><td><span class="lic">' + esc(licLabel(L.cls)) + '</span></td><td class="num">' + (r.top3 != null ? r.top3.toFixed(1) + '%' : '—') + '</td><td class="num">' + (r.top1 != null ? r.top1.toFixed(1) + '%' : '—') + '</td><td class="num">' + (r.ms != null ? r.ms.toFixed(0) + ' ms' : '—') + '</td></tr>';
    }).join('');
  }

  function renderDeck() {
    var runs = D.deck_runs || [];
    if (!runs.length) { el('deck').innerHTML = '<div class="pending">Not run yet. When the Deck is free, each candidate is loaded beside Deep Rock Galactic: Survivor and measured for fit, time to the first word, words per second with thinking Off, and thinking seconds at Balanced. The run sheet is data/model_bakeoff/deck-runs.json; fill it and rebuild.</div>'; return; }
    var h = '<div class="tablewrap"><table><thead><tr><th>Model</th><th>Game running</th><th>Loads</th><th class="num">First word</th><th class="num">Words / s</th><th class="num">Thinking at Balanced</th><th>Run</th></tr></thead><tbody>';
    runs.forEach(function (r) {
      h += '<tr><td>' + esc(name(r.tag)) + '</td><td>' + esc(r.game_running || '') + '</td><td><span class="st ' + (r.loads ? 'good' : 'critical') + '">' + (r.loads ? 'yes' : 'no') + '</span></td><td class="num">' + (r.first_word_s != null ? r.first_word_s + ' s' : '—') + '</td><td class="num">' + (r.words_per_s != null ? r.words_per_s : '—') + '</td><td class="num">' + (r.thinking_s_balanced != null ? r.thinking_s_balanced + ' s' : '—') + '</td><td>' + esc(r.date || '') + '</td></tr>';
    });
    el('deck').innerHTML = h + '</tbody></table></div>';
  }

  function renderRoster() {
    var chat = D.roster.filter(function (m) { return m.kind === 'chat'; }), emb = D.roster.filter(function (m) { return m.kind === 'embedding'; });
    function card(m) {
      var caps = [m.thinks ? 'thinks' : null, m.sees ? 'sees images' : null, m.hears ? 'hears audio' : null].filter(Boolean).join(' · ');
      var pub = m.published ? Object.keys(m.published).map(function (k) { return esc(k) + ' ' + esc(m.published[k]); }).join(' · ') : '';
      var srcs = (m.sources || []).map(function (u, i) { return '<a href="' + esc(u) + '" target="_blank" rel="noopener">source ' + (i + 1) + '</a>'; }).join(' · ');
      return '<div class="card"><b>' + esc(m.name) + (m.tag === todayTag || m.tag === (D.today && D.today.embedding) ? '<span class="today">today</span>' : '') + '</b>' +
        '<span class="dim">' + esc(m.maker) + ' · released ' + esc(m.released) + ' · ' + esc(m.params || '') + '</span>' +
        '<span><span class="lic">' + esc(licLabel(m.license_class)) + (m.osi ? ', OSI' : '') + '</span> ' + esc(m.license) + '</span>' +
        '<span class="dim">' + m.disk_gb.toFixed(m.disk_gb < 1 ? 2 : 1) + ' GB download' + (m.loaded_gb ? ', about ' + m.loaded_gb + ' GB loaded' : '') + (m.kind === 'chat' ? (m.disk_gb <= D.deck_fit_gb ? ' · fits the Deck' : ' · too big for the Deck') : '') + '</span>' +
        (caps ? '<span class="dim">' + caps + '</span>' : '') + '<span>' + esc(m.role || '') + '</span>' +
        (pub ? '<span class="dim">Published: ' + pub + '</span>' : '') + (srcs ? '<span>' + srcs + '</span>' : '') + (m.note ? '<span class="note">' + esc(m.note) + '</span>' : '') + '</div>';
    }
    el('roster').innerHTML = chat.map(card).join('') + emb.map(card).join('');
  }

  function render() { var runs = selectedRuns(); renderTiles(runs); renderChart(runs); renderTable(runs); }
  [runSel, metricSel, el('licSel'), el('fitChk')].forEach(function (c) { c.addEventListener('change', render); });
  render(); renderEmbed(); renderDeck(); renderRoster();
})();
</script>"""


def main() -> int:
    ap = argparse.ArgumentParser(description="Build the Deck model bake-off report page")
    ap.add_argument("--out", type=Path, default=OUT, help="where the full page goes")
    ap.add_argument("--fragment", type=Path, default=None, help="also write a copy without the html/head/body wrapper")
    args = ap.parse_args()
    data = build_data()
    blob = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    head = HEAD
    body = BODY.replace("__DATA__", blob)
    full = "<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n" + head + "\n</head>\n<body>\n" + body + "\n</body>\n</html>\n"
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(full, encoding="utf-8")
    print(f"wrote {args.out} ({len(data['runs'])} answer runs, {len(data['embed'])} embed sweeps, {len(data['roster'])} roster entries)")
    if args.fragment:
        args.fragment.parent.mkdir(parents=True, exist_ok=True)
        args.fragment.write_text(head + "\n" + body + "\n", encoding="utf-8")
        print(f"wrote {args.fragment}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
