// Hotkeys and the help dialog that lists them, both built from one list, so
// the dialog can't drift out of sync with what the keys do.
//
// setupHotkeys({ dialog, list, helpButton, entries })
//   dialog      the <dialog> element
//   list        the <dl> inside it, filled in here
//   helpButton  the button that opens and closes the dialog
//   entries     what to list, in order. Each is one of:
//                 { key: 'r', label, action }   a hotkey ("key" is lowercase)
//                 { display: 'Enter', label }   a line of information only
//
// "?" (show or hide the list) and Esc (close it) are added at the end here.
//
// Hotkeys are ignored while typing in a field or when a modifier key is held,
// and only "?" works while the dialog is open. Esc closes a <dialog> natively.
export function setupHotkeys({ dialog, list, helpButton, entries }) {
  const toggleHelp = () => {
    if (dialog.open) dialog.close();
    else dialog.showModal();
  };

  const all = [
    ...entries,
    { key: '?', label: 'Show or hide this list', action: toggleHelp },
    { display: 'Esc', label: 'Close this list' },
  ];

  // ---- the dialog's list ----
  const rows = all.flatMap(({ key, display = key.toUpperCase(), label }) => {
    const dt = document.createElement('dt');
    const kbd = document.createElement('kbd');
    kbd.textContent = display;
    dt.append(kbd);

    const dd = document.createElement('dd');
    dd.textContent = label;

    return [dt, dd];
  });
  list.replaceChildren(...rows);

  helpButton.addEventListener('click', toggleHelp);
  dialog.addEventListener('click', e => {
    if (e.target === dialog) dialog.close(); // click on the backdrop
  });

  // ---- the keys ----
  const actions = new Map(all.filter(e => e.action).map(e => [e.key, e.action]));

  document.addEventListener('keydown', e => {
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target.closest('input, textarea, [contenteditable]')) return;

    const action = actions.get(e.key.toLowerCase());
    if (!action) return;
    if (dialog.open && action !== toggleHelp) return;

    e.preventDefault();
    action();
  });
}
