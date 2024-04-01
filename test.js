import fs from 'fs';
import opentype from 'opentype.js';
import util from 'util';

const name = 'argesta_displayregular2.ttf';

const buffer = fs.readFileSync(`./tests/${name}`);

const font = opentype.parse(buffer.buffer);


const str = util.inspect(font, { showHidden: false, depth: null })

fs.writeFileSync(`./tests/${name}.txt`, str);
