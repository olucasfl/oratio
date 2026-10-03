/// <reference types="node" />
import { describe, expect, it } from "vitest"
import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

/*
 O domínio do Pote (catálogo, regras, pontuação, textos) existe em DOIS repos:
 a fonte é `oratio-api/src/modules/pote/domain/` e esta pasta é uma cópia
 idêntica. Este teste impede que as duas divirjam em silêncio — se o backend
 mudou, copie o arquivo. Quando o repo irmão não está ao lado (ex.: CI só do
 frontend) o teste é ignorado, não falha.
*/
const FILES = ["catalog.ts", "rules.ts", "score.ts", "content.ts"]

// O vitest roda na raiz do frontend (`oratio/`); o repo irmão fica ao lado.
const here = (file: string) => resolve(process.cwd(), "src/pages/Pote/domain", file)
const there = (file: string) =>
  resolve(process.cwd(), "../oratio-api/src/modules/pote/domain", file)

const read = (path: string) => readFileSync(path, "utf8").replace(/\r\n/g, "\n")

describe.skipIf(!existsSync(there("catalog.ts")))("domínio do Pote copiado do backend", () => {
  it.each(FILES)("%s é idêntico ao do oratio-api", (file) => {
    expect(read(here(file))).toBe(read(there(file)))
  })
})
