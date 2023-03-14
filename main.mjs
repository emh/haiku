import { haikus } from './haikus.mjs';
import { get, el } from './html.mjs';

const key = () => {
    const d = new Date(); // local time

    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const s = Date.parse(key());
const hash = (n) => (s + n + ~(n << 17) ^ (n >> 10) + (n << 3) ^ (n >> 6) + ~(n << 8) ^ (n >> 16)) % n;
const alpha = (w) => w.toLowerCase().replaceAll(/[^a-z]/g, '');

const haiku = haikus[hash(haikus.length)];
const solution = haiku.haiku.map((line) => line.split(' ').map(alpha).filter((w) => w.length > 0));
const words = solution.flat();
const board = solution.map((line) => line.map(() => words.splice(hash(words.length), 1)[0]));

const state = {
    haiku,
    board,
    solution,
    moves: 0
};

console.log(state);

const renderWord = (w, i, j) => {
    const x = state.solution[i].indexOf(w);
    const c = x === j ? 'perfect' : x > -1 ? 'nocigar' : null;

    const events = {
        dragstart: (e) => e.dataTransfer.setData('text/plain', JSON.stringify({ w, i, j })),
        drop: (e) => {
            e.preventDefault();

            const dropped = JSON.parse(e.dataTransfer.getData('text/plain'));

            state.board[i][j] = dropped.w;
            state.board[dropped.i][dropped.j] = w;

            render();
        },
        dragenter: (e) => {
            e.preventDefault();
            e.target.classList.add('dragover');
        },
        dragleave: (e) => {
            e.preventDefault();
            e.target.classList.remove('dragover');
        },
        dragover: (e) => e.preventDefault()
    };

    return el('div').attrs({ draggable: true }).classes([c, 'word']).events(events).children(w);
};

const renderLine = (l, i) => {
    return el('div.line').children(...l.map((w, j) => renderWord(w, i, j)));
};

const renderBoard = (t) => el('div.board').children(...t.map(renderLine));

function render() {
    const app = get('app');

    app.innerHTML = '';

    app.append(
        renderBoard(state.board).build()
    );
}

render();

