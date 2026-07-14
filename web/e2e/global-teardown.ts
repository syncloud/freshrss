import { ssh } from './helpers/ssh'
import { env } from './helpers/env'
import * as fs from 'node:fs'
import * as path from 'node:path'

const artifactRoot = env('PLAYWRIGHT_ARTIFACT_DIR')
const project = env('PLAYWRIGHT_PROJECT')

function collectArtifacts () {
  const shots = path.join(artifactRoot, `screenshots-${project}`)
  const videos = path.join(artifactRoot, `videos-${project}`)
  fs.mkdirSync(shots, { recursive: true })
  fs.mkdirSync(videos, { recursive: true })

  const resultsDir = 'test-results'
  if (!fs.existsSync(resultsDir)) return

  const uniq = (dst: string): string => {
    let out = dst
    let i = 1
    while (fs.existsSync(out)) {
      out = dst.replace(/(\.[^.]+)$/, `-${i}$1`)
      i++
    }
    return out
  }

  for (const name of fs.readdirSync(resultsDir)) {
    const dir = path.join(resultsDir, name)
    if (!fs.statSync(dir).isDirectory()) continue

    for (const png of fs.readdirSync(dir).filter((f) => f.endsWith('.png')).sort()) {
      fs.copyFileSync(path.join(dir, png), uniq(path.join(shots, png)))
    }

    const video = path.join(dir, 'video.webm')
    if (fs.existsSync(video)) {
      fs.copyFileSync(video, uniq(path.join(videos, `${name.split('-').slice(0, 2).join('-')}.webm`)))
    }
  }
}

export default async function globalTeardown () {
  fs.mkdirSync(artifactRoot, { recursive: true })
  const journal = ssh('journalctl --no-pager | grep -iE "freshrss|nginx|php-fpm" | tail -800', { throw: false })
  fs.writeFileSync(path.join(artifactRoot, `freshrss.${project}.journal.log`), journal)
  collectArtifacts()
}
