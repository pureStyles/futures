/**
 * 拼接两个json文件到新的文件中
 */

const fs = require("fs").promises;
const path = require('path');

const outPath = path.join(process.cwd(), 'app', 'public/data/position2.json');

async function coancatJSONFile(file1, file2) {

    const file1Content = await fs.readFile(file1);
    const file2Content = await fs.readFile(file2);

    const JSON1 = JSON.parse(file1Content);
    const JSON2 = JSON.parse(file2Content);

    const result = JSON1.concat(JSON2);

    await fs.writeFile(
        outPath,
        JSON.stringify(result),
        'utf-8'
    );

}

const file1 = path.join(process.cwd(), 'app', 'public/data/position1.json')

const file2 = path.join(process.cwd(), 'app', 'public/data/position.json')

coancatJSONFile(file1, file2);