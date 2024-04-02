import * as csstree from 'css-tree';

import ff from './fontforge/index.js';
import fs from 'fs';
import parseDataURL from 'data-urls';
import { parseFontName } from './utils/index.js';
import path from 'path';
import { program } from 'commander';

program.version('0.0.1');
program.command('download')
  .argument('<url>', 'url to download the fonts from')
  .action(async (urlStr, options) => {
    const url = new URL(urlStr);

    console.log('Downloading CSS file from:', url.href);

    const req = await fetch(url.href);
    const text = await req.text();

    // Generates the AST from the CSS file
    const ast = csstree.parse(text);

    // Finds all the font-face rules in the CSS file
    const fonts = csstree.findAll(ast, (node, item, list) =>
      node.type === 'Atrule' && node.name === 'font-face'
    ).map((node) => {
      const nameNode = csstree.find(
        csstree
          .find(node, (node) => node.type === 'Declaration' && node.property === 'font-family'),
        (node) => node.type === 'String'
      )

      const srcNode = csstree
        .find(node, (node) => node.type === 'Declaration' && node.property === 'src')

      const urlNode = csstree.find(srcNode, (node) => node.type === 'Url')

      const formatNode = csstree.find(
        srcNode,
        (node) => node.type === 'Function' && node.name === 'format'
      )

      const formatStringNode = csstree.find(formatNode, (node) => node.type === 'String')

      const name = parseFontName(nameNode.value);
      const url = urlNode.value;
      const format = formatStringNode.value;

      // Parses the data URL and get all the binary information required to export the font
      const data = parseDataURL(url);

      return {
        name,
        format,
        data,
      }
    });

    if (fs.existsSync('output')) {
      fs.rmSync('output', { recursive: true });
    }

    fs.mkdirSync('output');

    for (const font of fonts) {
      console.log('Writing', font.name.exportName, 'to disk');

      const defaultBuffer = font.data.body
      fs.writeFileSync(path.join('output', `${font.name.inputName}.${font.format}`), defaultBuffer, 'binary')

      if (font.format !== 'otf' || font.format !== 'ttf') {
        const cwd = path.join(process.cwd(), 'output');
        const input = `${font.name.inputName}.${font.format}`;
        const output = `${font.name.exportName}.otf`;

        console.log('Converting', input, 'to', output);

        await ff(font.name, input, output, { cwd })
          .catch((err) => {
            console.error('Error:', err);
          });
      }
    }
  });

program.parse(process.argv);