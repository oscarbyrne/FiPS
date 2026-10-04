import * as Model from '../model.js';
import * as Inline from './inline.js';

function createHeader() {
  const thead = document.createElement('thead');
  const row = document.createElement('tr');
  const headings = [
    "📌",
    "🔊",
    "k class set",
    "config",
    "m"
  ];
  for (const title of headings) {
    const th = document.createElement('th');
    th.textContent = title;
    row.appendChild(th);
  }
  thead.appendChild(row);
  return thead;
}

function createCell(content, rowSpan=null, callBack=null) {
  const cell = document.createElement('td');
  cell.innerHTML = content;
  if (rowSpan) {
    cell.rowSpan = rowSpan;
  }
  if (callBack) {
    cell.classList.add('clickable');
    cell.addEventListener('click', callBack);
  }
  return cell;
}

function createRows(key) {
  const rows = [];
  for (const reading of key.readings) {
    const row = document.createElement('tr');
    row.append(
      createCell(reading.config),
      createCell(reading.m)
    );
    rows.push(row);
  }
  const span = rows.length == 0 ? null : rows.length;
  if (!span) {
    rows.push(
      document.createElement('tr')
    );
  }
  rows[0].prepend(
    createCell(
      key.pinnedStatus.value,
      span,
      () => key.pinnedStatus.increment()
    ),
    createCell(
      key.auditionStatus.value,
      span,
      () => key.auditionStatus.increment()
    ),
    createCell(
      Inline.kClassSetToHTML(key.kClassSet),
      span
    ),
  );
  return rows;
}

function create(keyPool) {
  const keys = keyPool.sortedValues;
  const table = document.createElement('table');
  const header = createHeader();
  const body1 = document.createElement('tbody');
  const body2 = document.createElement('tbody');
  for (const key of keys) {
    const body = key.pinnedStatus.on ? body1 : body2;
    const rows = createRows(key);
    body.append(...rows);
  }
  table.append(
    header,
    body1,
    body2,
  );
  return table;
}

export { create };
