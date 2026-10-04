import * as Model from './model.js';
import * as Table from './views/table.js';
import * as Controller from './controller.js';

function redrawTable(parentNode, keyPool) {
  parentNode.innerHTML = "";
  parentNode.appendChild(
    Table.create(keyPool)
  );
}

const input = document.getElementById("input");
input.addEventListener('input', function(event) {
  const start = this.selectionStart;
  const end = this.selectionEnd;
  this.value = this.value.replaceAll(' ', '→');
  this.value = this.value.replaceAll('→→', '→');
  this.value = this.value.replace(/[^0-9→]/g, '');
  this.setSelectionRange(start, end);
  const config = this.value.split('→').filter(c => c !== "");
  Controller.updateConfig(
    config,
    keyPool
  );
})

document.addEventListener('keydown', function(event) {
  input.focus();
});

const output = document.getElementById("output");

const keyPool = new Model.KeyPool();

document.addEventListener('model:update', function() {
  redrawTable(output, keyPool);
});
