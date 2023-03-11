import { parse } from 'csv-parse/sync';
import { promises } from 'fs';
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

async function read_emoji() {
    const file = await promises.open('./emoji.csv', 'r+');
    const data = await file.readFile('utf8');

    await file.close();

    return parse(data);
}

async function generate_haiku(emojis) {
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{
            role: "user", content: `write me a haiku about ${emojis.join(' ')}. do not use any emojis in your response. english words only.` }],
    });

    const response = completion.data.choices[0].message;

    return response.content.trim().replaceAll(/"/g, "'").split('\n');
}

async function main() {
    let emojis = await read_emoji();

    emojis.shift(); // eat header row

    let groups = [...new Set(emojis.map((e) => e[3]))];

    process.stdout.write('export const haikus = [\n');

    for (let i = 0; i < 100; i++) {
        console.warn(`-- ${i} ------------------------------------------------------------`);

        let threeGroups = [...groups].sort(() => 0.5 - Math.random()).slice(0, 3);

        console.warn(threeGroups);

        let threeEmojis = threeGroups.map((g) => {
            const l = emojis.filter((e) => e[3] === g);

            return l[Math.floor(Math.random() * l.length)][0];
        });

        console.warn(threeEmojis);

        const haiku = await generate_haiku(threeEmojis);

        console.warn(haiku);

        process.stdout.write(`\t{ emojis: [${threeEmojis.map((e) => `'${e}'`).join(',')}], haiku: [${haiku.map((line) => `"${line}"`).join(',')}] },\n`);
    }

    process.stdout.write('];\n');
}

main();
