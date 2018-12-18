const pg = document.getElementById('pg');
const pg_chat = document.getElementById('pg_chat');
const pg_display = pg.querySelector('[data-desc="input"]');
const pg_prompt = pg.querySelector('[data-desc="prompt"]');

const socket = new WebSocket(`ws${window.location.protocol.startsWith('https') ? 's' : ''}://${window.location.host}`);
let nickname = 'anonymous';

pg.addEventListener('click', function (e) {
  e.preventDefault();
  this.input.focus();
  updateDisplay(true);
});

/**
 * @this {HTMLInputElement}
 */
function updateDisplay(forceFocus = false) {
  pg_display.innerHTML = '';

  const selection = {
    start: pg.input.selectionStart || 0,
    end: pg.input.selectionEnd || 0,
  }

  /** @type {string} */
  let text = pg.input.value || '';

  if (forceFocus || pg.input === document.activeElement) {
    text += ' ';
  }

  const start = document.createElement('span');
  start.innerText = text.slice(0, selection.start);

  const selected = document.createElement('span');
  selected.innerText = text.slice(selection.start, selection.end + 1);
  selected.classList.add('selected');

  const end = document.createElement('span');
  end.innerText = text.slice(selection.end + 1);

  pg_display.appendChild(start);
  pg_display.appendChild(selected);
  pg_display.appendChild(end);

  pg.scrollTop = pg.scrollHeight;
}

pg.input.addEventListener('keyup', updateDisplay);
pg.input.addEventListener('keydown', updateDisplay);
pg.input.addEventListener('keypress', updateDisplay);

pg.addEventListener('submit', function (e) {
  e.preventDefault();

  socket.send( pg.input.value);

  if (pg.input.value.startsWith('$nickname=')) {
    [, nickname] = pg.input.value.split('=', 2);

    console.log(nickname)

    pg_prompt.innerText = `${nickname}> `;
  }

  pg.input.value = '';
  updateDisplay();
});

socket.onmessage = ({data}) => {
  const div = document.createElement('div');
  div.innerText = data;

  pg_chat.appendChild(div);

  pg.scrollTop = pg.scrollHeight;
};

function init() {
  updateDisplay();
}

init();
