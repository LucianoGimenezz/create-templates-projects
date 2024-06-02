import { cp } from 'node:fs/promises'
import {fileURLToPath} from 'node:url'
import path from 'node:path'

(async () => {
    const templatesPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../templates') 
    const distPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../dist/templates')

    await cp(templatesPath, distPath,
        { recursive: true, filter: (src) => !src.includes('node_modules') })
})()

