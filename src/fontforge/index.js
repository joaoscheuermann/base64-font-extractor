import { exec } from 'child_process';

// TODO: set TTF names for the font
// SetTTFName(0x409,1,"Font Family Name") ex: "Arial" or "Times New Roman" or "Argesta Headline"
// SetTTFName(0x409,2,"Font Subfamily Name") ex: "Regular" or "Bold" or "Bold Italic" or "Regular"

export default function ff(name, input, output, options) {
  return new Promise((resolve, reject) => {

    const fontFamily = name.fontFamily.replace(/\s/, '_')
    const fontSubFamily = name.fontSubFamily.replace(/\s/, '_')
    const fontFullName = `${fontFamily}_${fontSubFamily}`

    const child = exec(`fontforge -lang=ff -c "Open('${input}'); SetFontNames('${fontFamily}','${fontSubFamily}', '${fontFullName}'); SetTTFName(0x409,1,'${name.fontFamily}'); SetTTFName(0x409,2,'${name.fontSubFamily}'); SetTTFName(0x409,4,'${name.fontFamily} ${name.fontSubFamily}'); Generate('${output}'); Quit();"`, options)

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