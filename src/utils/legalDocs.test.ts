import { describe, it, expect } from "vitest"

import termosRaw from "../../docs/legal/2026-09-11-termos-de-uso.md?raw"
import privacidadeRaw from "../../docs/legal/2026-09-11-politica-de-privacidade.md?raw"

import { TERMS_OF_USE_VERSION } from "../components/TermsOfUseContent/TermsOfUseContent"
import { PRIVACY_POLICY_VERSION } from "../components/PrivacyPolicyContent/PrivacyPolicyContent"

/*
 Acoplamento texto × versão (spec consentimento-privacidade.md, seção
 "Acoplamento"): o texto vive em docs/legal/<data>-*.md (cópia congelada,
 somente leitura — a fonte viva é o componente); a versão que os dois
 componentes exportam precisa continuar batendo com a data publicada nos
 dois arquivos, e os dois arquivos precisam continuar com a MESMA data —
 senão alguém atualizou um documento e esqueceu o outro, ou esqueceu de
 bumpar o componente. Isto pega o caso dentro deste repo; o bump de
 LEGAL_TERMS_VERSION no oratio-api continua manual (repos diferentes, sem CI
 compartilhado).
*/

function versionHeader(text: string): string {
  const match = text.match(/\*\*Versão:\*\*\s*(\S+)/)
  if (!match) throw new Error("Cabeçalho **Versão:** não encontrado")
  return match[1]
}

describe("docs/legal — acoplamento texto × versão", () => {

  it("os dois documentos têm a mesma versão no cabeçalho", () => {
    const termos = versionHeader(termosRaw)
    const privacidade = versionHeader(privacidadeRaw)

    expect(termos).toBe(privacidade)
  })

  it("TermsOfUseContent exporta a mesma versão do arquivo congelado", () => {
    const termos = versionHeader(termosRaw)
    expect(TERMS_OF_USE_VERSION).toBe(termos)
  })

  it("PrivacyPolicyContent exporta a mesma versão do arquivo congelado", () => {
    const privacidade = versionHeader(privacidadeRaw)
    expect(PRIVACY_POLICY_VERSION).toBe(privacidade)
  })

})
