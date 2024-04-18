import { exec } from 'child_process';

export default function ff(name, input, output, options) {
  return new Promise((resolve, reject) => {

    const fontFamily = name.fontFamily.replaceAll(/\s/g, '_').trim()
    const fontSubFamily = name.fontSubFamily.replaceAll(/\s/g, '_').trim()

    const fontFullName = [fontFamily, fontSubFamily].map(str => str.split(/_|\s/)).flat().join('_')

    const child = exec(`fontforge -lang=ff -c "Open('${input}'); SetFontNames('${fontFamily}','${fontFamily}', '${fontFullName}', '${name.fontWheight}'); SetTTFName(0x409,1,'${name.fontFamily}'); SetTTFName(0x409,2,'${name.fontSubFamily.toLowerCase()}'); SetTTFName(0x409,4,'${name.fontFamily} ${name.fontSubFamily}'); Generate('${output}'); Quit();"`, options)

    let stdout = null
    let stderr = null

    child.stdout.on('data', (data) => {
      stdout += data
    })

    child.stderr.on('data', (data) => {
      stderr += data
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout)
      } else {
        reject(stderr)
      }
    })
  })
}