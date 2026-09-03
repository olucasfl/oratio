import { defineConfig, coverageConfigDefaults } from "vitest/config"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: false,
    // e2e/ é a auditoria visual do Playwright — suíte à parte, roda com
    // `npm run e2e`, nunca pelo vitest.
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**", "dist/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      // Sem isso, o relatório só conta arquivos que algum teste importou —
      // qualquer arquivo nunca tocado simplesmente não aparece no
      // denominador, e os 80% viram um número fácil de "bater" sem cobrir
      // nada de novo. `all: true` + `include` força TODO arquivo de
      // `src/` a entrar na conta, aparecendo como 0% até ganhar teste.
      all: true,
      include: ["src/**/*.{ts,tsx}"],
      // Segue a mesma ideia do backend (que exclui *.module.ts/main.ts —
      // fiação sem lógica própria): aqui excluímos boot puro e conteúdo
      // estático que não tem comportamento pra testar. Componentes/páginas
      // com lógica real continuam contando normalmente — arquivos
      // individuais sem nada testável usam `/* v8 ignore file */` no
      // próprio arquivo em vez de entrar nesta lista global.
      exclude: [
        ...coverageConfigDefaults.exclude,
        "src/main.tsx",
        "src/vite-env.d.ts",
        "src/data/**",
      ],
      // functions/branches em 70 (não 80): mesmo padrão observado no
      // backend — helpers de render e handlers secundários ficam
      // naturalmente atrás de lines/statements sem que isso signifique
      // lógica sem teste. Lines/statements seguem em 80.
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 70,
        branches: 70,
      },
    },
  },
})
