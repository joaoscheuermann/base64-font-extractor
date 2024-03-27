import * as csstree from 'css-tree';

import CloudConvert from 'cloudconvert';
import fs from 'fs';
import parseDataURL from 'data-urls';
import path from 'path';
import { program } from 'commander';

// TODO: Implementar a conversão de fontes para OTF e TTF usando Cloud Convert
// https://github.com/cloudconvert/cloudconvert-node

program.command('download')
  .argument('<url>', 'url to download the fonts from')
  .action(async (urlStr, options) => {
    const url = new URL(urlStr);

    console.log('Downloading fonts from:', url.href);

    const req = await fetch(url.href);
    const text = await req.text();

    console.log('Downloaded', text.length, 'bytes');

    const ast = csstree.parse(text);

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

      const name = nameNode.value;
      const url = urlNode.value;
      const format = formatStringNode.value;
      const data = parseDataURL(url);

      return {
        name,
        format,
        data,
      }
    });

    if (fs.existsSync('output')) {
      fs.rmdirSync('output', { recursive: true });
    }

    fs.mkdirSync('output');

    for (const font of fonts) {
      console.log('Writing', font.name, 'to disk');

      const defaultBuffer = font.data.body
      fs.writeFileSync(path.join('output', `${font.name}.${font.format}`), defaultBuffer, 'binary')
    }
  });

program.parse(process.argv);