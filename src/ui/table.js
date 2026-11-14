import { cmpFrac } from '../kclass.js';
import { kClassNodes } from './kclass-view.js';

/**
 * Render keys as a table grouped by K class set, then config (identical values
 * merged with rowspan), with pinned keys in their own <tbody class="pinned"> on top.
 * Siblings are sorted; K classes compare by fraction value (1/4 < 1/2).
 * The table never changes a key: it only calls the callbacks below.
 *
 * Options:
 *   mQuery   integers; shows keys whose m starts with them, in order ([2] matches [2, 6, 8])
 *   kQuery   [n, d] fractions; shows keys whose K class set contains all of them,
 *            compared by value ([2, 4] matches a set holding [1, 2])
 *            (pinned keys are always shown; a key must pass both queries)
 *   colorOf(kClassSet)           CSS colour for an auditioning set's rows, or null for the default
 *   onTogglePinned(key)          the row's checkbox changed
 *   onToggleSetAudition(setId)   the row was clicked (not the checkbox)
 *
 * Rows of an auditioning key get the class "auditioning" and a --audition-color
 * custom property. Hovering a row adds "set-hover" to every row of its K class set.
 * Style it with `.keys-table`. Returns the <table>; its contents replace `container`'s.
 */
function renderKeysTable(
  keys,
  container,
  { mQuery, kQuery, colorOf, onTogglePinned, onToggleSetAudition }
) {
  // ---- sorting ----
  const cmpNum = (a, b) => a - b;
  const cmpList = (a, b, cmpItem) => {
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
      const c = cmpItem(a[i], b[i]);
      if (c) return c;
    }
    return a.length - b.length; // shorter list first when one is a prefix
  };

  // ---- DOM helpers ----
  const cell = (tag, rowspan = 1) => {
    const e = document.createElement(tag);
    if (rowspan > 1) e.rowSpan = rowspan;
    return e;
  };
  const textCell = (text, rowspan) => {
    const td = cell("td", rowspan);
    td.textContent = text;
    return td;
  };
  const kClassCell = (set, rowspan) => {
    const td = cell("td", rowspan);
    td.append(...kClassNodes(set));
    return td;
  };
  const pinCell = (key) => {
    const td = cell("td");
    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = key.pinned;
    box.setAttribute("aria-label", "Pinned");
    box.addEventListener("change", () => onTogglePinned(key));
    td.appendChild(box);
    return td;
  };

  // kClassSet id -> every rendered row of that set (across both tbodies)
  const setRows = new Map();

  // ---- build one tbody: group kClassSet -> config -> keys ----
  const buildBody = (subset, className) => {
    const tbody = document.createElement("tbody");
    tbody.className = className;

    const tree = new Map();
    for (const key of subset) {
      const cKey = JSON.stringify(key.config);
      if (!tree.has(key.setId)) {
        tree.set(key.setId, { setId: key.setId, kClassSet: key.kClassSet, configs: new Map() });
      }
      const node = tree.get(key.setId);
      if (!node.configs.has(cKey)) {
        node.configs.set(cKey, { config: key.config, keys: [] });
      }
      node.configs.get(cKey).keys.push(key);
    }

    const sets = [...tree.values()].sort((a, b) =>
      cmpList(a.kClassSet, b.kClassSet, cmpFrac)
    );

    for (const s of sets) {
      const configs = [...s.configs.values()].sort((a, b) =>
        cmpList(a.config, b.config, cmpNum)
      );
      const setSpan = configs.reduce((t, c) => t + c.keys.length, 0);
      let firstRowOfSet = true;

      // Every rendered row of this K class set, in either tbody, for the hover highlight
      if (!setRows.has(s.setId)) setRows.set(s.setId, []);
      const rowsOfSet = setRows.get(s.setId);

      for (const c of configs) {
        const sorted = [...c.keys].sort((a, b) => cmpList(a.m, b.m, cmpNum));
        sorted.forEach((key, i) => {
          const tr = document.createElement("tr");
          if (key.auditioning) {
            tr.classList.add("auditioning");
            const color = colorOf(key.kClassSet);
            if (color) tr.style.setProperty("--audition-color", color);
          }
          tr.addEventListener("click", (e) => {
            if (e.target.closest("input")) return;
            onToggleSetAudition(key.setId);
          });
          rowsOfSet.push(tr);
          tr.addEventListener("mouseenter", () =>
            rowsOfSet.forEach((r) => r.classList.add("set-hover"))
          );
          tr.addEventListener("mouseleave", () =>
            rowsOfSet.forEach((r) => r.classList.remove("set-hover"))
          );
          if (firstRowOfSet) {
            tr.appendChild(kClassCell(s.kClassSet, setSpan));
            firstRowOfSet = false;
          }
          if (i === 0) tr.appendChild(textCell(c.config.join(", "), sorted.length));
          tr.appendChild(textCell(key.m.join(", ")));
          tr.appendChild(pinCell(key));
          tbody.appendChild(tr);
        });
      }
    }
    return tbody;
  };

  // ---- assemble ----
  const table = document.createElement("table");
  table.className = "keys-table";

  const headRow = table.createTHead().insertRow();
  for (const label of ["K class set", "Config", "M", "Pinned"]) {
    const th = document.createElement("th");
    th.textContent = label;
    headRow.appendChild(th);
  }

  const pinned = keys.filter((k) => k.pinned);
  const unpinned = keys.filter((k) => !k.pinned && k.matches(mQuery, kQuery));
  if (pinned.length) table.appendChild(buildBody(pinned, "pinned"));
  if (unpinned.length) table.appendChild(buildBody(unpinned, "unpinned"));
  if (!pinned.length && !unpinned.length) {
    const tbody = table.createTBody();
    tbody.className = "empty";
    const td = tbody.insertRow().insertCell();
    td.colSpan = 4;
    td.textContent = "No matching keys";
  }

  container.replaceChildren(table);
  return table;
}

export { renderKeysTable };
