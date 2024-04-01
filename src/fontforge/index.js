import { exec } from 'child_process';

export default function ff(input, output, options) {
  return new Promise((resolve, reject) => {
    const child = exec(`fontforge -lang=ff -c "Open($1); Generate($2); Quit();" ${input} ${output}`, options)

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