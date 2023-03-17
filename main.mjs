import { haikus } from './haikus.mjs';
import { get, el } from './html.mjs';

const key = () => {
    const d = new Date();

    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const seed = Date.parse(key());
const hash = (n) => (seed + n + ~(n << 17) ^ (n >> 10) + (n << 3) ^ (n >> 6) + ~(n << 8) ^ (n >> 16)) % n;
const alpha = (w) => w.toLowerCase().replaceAll(/[^a-z]/g, '');
const randInt = (n) => Math.floor(Math.random() * n);

const haiku = haikus[randInt(haikus.length)];
const solution = haiku.haiku.map((line) => line.split(' ').map(alpha).filter((w) => w.length > 0));
const words = solution.flat();
const board = solution.map((line) => line.map(() => words.splice(hash(words.length), 1)[0]));

function minSwaps(arr, sorted) {
    const unsortedIndexMap = new Map();

    arr.forEach((value, index) => {
        if (!unsortedIndexMap.has(value)) {
            unsortedIndexMap.set(value, []);
        }
        unsortedIndexMap.get(value).push(index);
    });

    let swaps = 0;
    const visited = new Array(arr.length).fill(false);

    for (let i = 0; i < arr.length; i++) {
        if (visited[i] || sorted[i] === arr[i]) {
            continue;
        }

        let cycleLength = 0;
        let j = i;

        while (!visited[j]) {
            visited[j] = true;
            j = unsortedIndexMap.get(sorted[j]).shift();
            cycleLength++;
        }

        swaps += cycleLength - 1;
    }

    return swaps;
}

const state = {
    key: key(),
    haiku,
    board,
    solution,
    moves: 0,
    minMoves: minSwaps(board.flat(), solution.flat())
};

console.log(state);

const solved = () => {
    for (let i = 0; i < state.solution.length; i++) {
        for (let j = 0; j < state.solution[i].length; j++) {
            if (state.solution[i][j] !== state.board[i][j]) return false;
        }
    }

    return true;
};

const positionClass = (w, i, j) => {
    if (state.solution[i].indexOf(w) === j) return 'perfect';

    const solutionWords = [...state.solution[i]];
    const boardWords = [...state.board[i]];

    for (let k = 0; k < j; k++) {
        const l = solutionWords.indexOf(boardWords[k]);

        if (l > -1) {
            solutionWords[l] = '';
        }
    }

    if (solutionWords.indexOf(w) > -1) return 'nocigar';

    return null;
};

const renderWord = (w, i, j) => {
    let sourceNode = null;
    let dragNode = null;
    let x = null;
    let y = null;

    function updatePosition(e) {
        x = e.clientX || e.touches[0].clientX;
        y = e.clientY || e.touches[0].clientY;
    }

    function handleDragStart(e) {
        e.preventDefault();

        const app = get('app');

        sourceNode = e.target || e.targetTouches[0];
        dragNode = sourceNode.cloneNode(true);

        app.append(dragNode);

        updatePosition(e);

        dragNode.style.position = 'absolute';
        dragNode.style.left = `${x}px`;
        dragNode.style.top = `${y}px`;
        dragNode.style.transform = 'translate(-50%, -50%) scale(1.2)';

        sourceNode.classList.add('source');

        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('touchmove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
        document.addEventListener('touchend', handleDragEnd);
    }

    function handleDragMove(e) {
        e.preventDefault();

        updatePosition(e);

        dragNode.style.left = `${x}px`;
        dragNode.style.top = `${y}px`;
    }

    function handleDragEnd(e) {
        e.preventDefault();

        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('touchmove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
        document.removeEventListener('touchend', handleDragEnd);

        const app = get('app');

        app.removeChild(dragNode);

        const targetNode = document.elementFromPoint(x, y);

        if (!targetNode.classList.contains('word')) return;

        sourceNode.classList.remove('source');

        state.board[i][j] = targetNode.dataset.w;
        state.board[targetNode.dataset.i][targetNode.dataset.j] = w;

        render();
    }

    const events = {
        mousedown: handleDragStart,
        touchstart: handleDragStart
    };

    const c = positionClass(w, i, j);

    return el('div').classes([c, 'word']).events(events).attrs({ 'data-i': i, 'data-j': j, 'data-w': w }).children(w);
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

    console.log('solved?', solved());
}

render();

