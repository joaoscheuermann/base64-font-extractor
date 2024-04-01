import { exec } from 'child_process';

export default function ff(name, input, output, options) {
  return new Promise((resolve, reject) => {

    const child = exec(`fontforge -lang=ff -c "Open($2); SetFontNames($1, $1, $1); Generate($3); Quit();" ${name} ${input} ${output}`, options)

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