import { haikus } from './haikus.mjs';
import { get, el } from './html.mjs';

const randInt = (n) => Math.floor(Math.random() * n);
const coinToss = () => Math.random() < 0.5 ? -1 : 1;
const shuffle = (l) => [...l].sort(coinToss);
const div = (n, d) => ({ q: Math.floor(n / d), r: n % d });
const split = (words) => {
    const n = words.length;
    const { q, r } = div(n, 3);

    let [a, b] = [q, q];

    if (r === 1) {
        b++;
    } else if (r === 2) {
        a++;
        b++;
    }

    return [
        words.slice(0, a),
        words.slice(a, a + b),
        words.slice(a + b)
    ];
};
const alpha = (w) => w.toLowerCase().replaceAll(/[^a-z]/g, '');
const words = (haiku) => haiku.join(' ').split(' ').map(alpha).filter((w) => w.length > 0);

const haiku = haikus[randInt(haikus.length)];
const haikuWords = words(haiku.haiku);

const state = {
    haiku,
    board: split(shuffle(haikuWords)),
    solution: haiku.haiku.map((line) => line.split(' ').map(alpha).filter((w) => w.length > 0)),
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

const renderDropZone = (i, front) => {
    const events = {
        drop: (e) => {
            e.preventDefault();

            const dropped = JSON.parse(e.dataTransfer.getData('text/plain'));

            state.board[dropped.i].splice(dropped.j, 1);
            state.board[i].splice(front ? 0 : -1, 0, dropped.w);

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

    return el('div.dropzone').events(events);
}

const renderLine = (l, i) => {
    return el('div.line').children(
        renderDropZone(i, true),
        ...l.map((w, j) => renderWord(w, i, j)),
        renderDropZone(i, false)
    );
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

