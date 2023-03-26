import { haikus } from './haikus.mjs';
import { get, el } from './html.mjs';

const alpha = (w) => w.toLowerCase().replaceAll(/[^a-z]/g, '');
const randInt = (n) => Math.floor(Math.random() * n);
const deepCopy = (solution) => solution.map((line) => [...line]);

function calcCorrectness(solution, board) {
    const numWords = solution.flat().length;
    let correctWords = 0;

    board.forEach((line, i) => line.forEach((word, j) => {
        if (solution[i][j] === word) {
            correctWords += 1;
        } else if (solution[i].indexOf(word) > -1) {
            correctWords += 0.5;
        }
    }));

    return correctWords / numWords;
}

function shuffle(solution) {
    const copy = deepCopy(solution);

    for (let i = 0; i < copy.length; i++) {
        for (let j = 0; j < copy[i].length; j++) {
            let found = false;
            let k = null;
            let l = null;
            let y = 0;

            while (!found && y < 10000) {
                k = (i + (randInt(2) + 1)) % 3;
                l = randInt(copy[k].length);
                y++;

                found = solution[i].indexOf(copy[k][l]) === -1 && solution[k].indexOf(copy[i][j]) === -1;
            }

            [copy[i][j], copy[k][l]] = [copy[k][l], copy[i][j]];
        }
    }

    return copy;
}

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

const i = randInt(haikus.length);
const haiku = haikus[i];
const solution = haiku.haiku.map((line) => line.split(' ').map(alpha).filter((w) => w.length > 0));
// const board = shuffle(solution);

const board = deepCopy(solution); //shuffle(solution);
[board[0][0], board[1][0]] = [board[1][0], board[0][0]];

const state = {
    haiku,
    board,
    solution,
    moves: 0,
    minMoves: minSwaps(board.flat(), solution.flat())
};

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

async function renderImage() {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const board = document.querySelector('.board');
        let { height, width } = board.getBoundingClientRect();

        height *= 1.5;

        canvas.width = width;
        canvas.height = height;

        const tempImg = document.createElement('img');
        tempImg.addEventListener('load', onTempImageLoad);
        tempImg.src = 'data:image/svg+xml,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
                <foreignObject width="100%" height="100%">
                    <style>
                        #image-container {
                            height: 100%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-family: 'Courier New', Courier, monospace;
                            font-size: 24px;
                        }

                        .board {
                            display: flex;
                            flex-direction: column;
                            gap: 24px;
                            user-select: none;
                            padding: 8px;
                        }

                        .line {
                            display: flex;
                            flex-wrap: wrap;
                            justify-content: center;
                            gap: 8px;
                        }

                        .word {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            height: 32px;
                            padding: 0 10px;
                            border: solid 1px black;
                            cursor: grab;
                            background-color: white;
                        }

                        .perfect {
                            background-color: lightblue;
                        }
                    </style>
                    <div id="image-container" xmlns="http://www.w3.org/1999/xhtml">
                        ${get('app').innerHTML}
                    </div>
                </foreignObject>
            </svg>`);

        const targetImg = document.createElement('img');
        document.body.appendChild(targetImg);

        const bgImg = document.querySelector('#background img');

        function onTempImageLoad(e) {
            let x = 0;
            let y = 0;

            while (y < height) {
                ctx.drawImage(bgImg, x, y, 128, 128);

                x += 128;

                if (x > width) {
                    x = 0;
                    y += 128;
                }
            }

            ctx.drawImage(e.target, 0, 0);
            targetImg.src = canvas.toDataURL();

            resolve(canvas);
        }
    });
}

function render() {
    const app = get('app');

    app.innerHTML = '';

    app.append(
        renderBoard(state.board).build()
    );

    get('background').style.opacity = calcCorrectness(state.solution, state.board);

    if (solved()) {
        const dialog = get('success');

        dialog.showModal();
    }
}

get('background').style.backgroundImage = `url('./backgrounds/${String(i + 1).padStart(3, '0')}.png')`;

const image = el('img').attrs({ src: `./backgrounds/${String(i + 1).padStart(3, '0')}.png` });

get('background').append(image.build());

const copyButton = get('copy');
const okButton = get('ok');

copyButton.addEventListener('click', () => {
    // const canvas = await renderImage();

    // canvas.toBlob((blob) => {
    //     navigator.clipboard.write([
    //         new ClipboardItem({ [blob.type]: blob })
    //     ]).then(
    //         () => {
    //             document.querySelector('.copied').style.visibility = 'visible';
    //         },
    //         (err) => {
    //             document.querySelector('.copied').style.visibility = 'visible';
    //             document.querySelector('.copied').innerHTML = err;
    //         }
    //     );
    // }, "image/png");

    // const type = "text/plain";
    // const blob = new Blob(["Hello World 2"], { type });
    // const data = [new ClipboardItem({ [type]: blob })];

    // navigator.clipboard.write(data).then(
    //     () => {
    //         document.querySelector('.copied').style.visibility = 'visible';
    //     },
    //     (err) => {
    //         document.querySelector('.copied').style.visibility = 'visible';
    //         document.querySelector('.copied').innerHTML = err;
    //     }
    // );

    const type = "text/plain";
    const blob = new Blob(["hello world 3"], { type });
    const data = [new ClipboardItem({ [type]: blob })];

    navigator.clipboard.write(data).then(
        () => {
            document.querySelector('.copied').style.visibility = 'visible';
        },
        (err) => {
            document.querySelector('.copied').style.visibility = 'visible';
            document.querySelector('.copied').innerHTML = err;
        }
    );
});

okButton.addEventListener('click', () => {
    dialog.remove();
});

render();

