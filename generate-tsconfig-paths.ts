// generate-tsconfig-paths.ts
import { ACTIVE_THEME } from './theme.config'
import fs from 'fs'

const config = {
  compilerOptions: {
    baseUrl: '.',
    paths: {
      '@ui/*': [`list-shared-ui/${ACTIVE_THEME}/src/*`]
    }
  }
}

fs.writeFileSync('tsconfig.paths.json', JSON.stringify(config, null, 2))
console.log(`✅ Generated tsconfig.paths.json for theme: ${ACTIVE_THEME}`)
