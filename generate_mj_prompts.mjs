import { haikus } from './haikus.mjs';

haikus.map((haiku, i) => {
    process.stdout.write(`${i+1}\n${haiku.haiku.join(' ').toLowerCase().replaceAll(/[^a-z\s]/g, '')}. muted pastel colors --tile \n`);
});
