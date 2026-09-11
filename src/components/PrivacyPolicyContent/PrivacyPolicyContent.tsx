import { renderLegalBlocks } from "../../utils/legalContent"
import type { LegalBlock } from "../../utils/legalContent"
import styles from "./PrivacyPolicyContent.module.css"

/*
 Texto real e aprovado da Política de Privacidade (spec consentimento-
 privacidade.md — "Fora de escopo: escrever ou revisar o texto jurídico" já
 está feito). Fonte congelada, somente leitura, nunca editada: docs/legal/
 2026-09-11-politica-de-privacidade.md — este componente É a versão viva; o
 .md é o registro histórico do que foi publicado. Mudar o texto aqui sem
 publicar um novo docs/legal/<data>-politica-de-privacidade.md e bumpar
 LEGAL_TERMS_VERSION no oratio-api invalida a prova de consentimento (ver a
 spec, "Acoplamento").
*/

export const PRIVACY_POLICY_VERSION = "2026-09-11"

const BLOCKS: LegalBlock[] = [
  { type: "h2", text: "1. Quem é responsável pelos seus dados" },
  {
    type: "p",
    text: "O Oratio é mantido por **Lucas Farias Leandro**, pessoa física, que atua como **controlador** dos dados pessoais tratados no aplicativo, nos termos da Lei nº 13.709/2018 (Lei Geral de Proteção de Dados — LGPD).",
  },
  {
    type: "p",
    text: "**Contato para qualquer assunto relacionado a esta política, incluindo pedidos de acesso, correção ou exclusão dos seus dados:**",
  },
  { type: "p", text: "**inbox.oratio@gmail.com**" },

  { type: "h2", text: "2. Em resumo" },
  { type: "p", text: "Esta seção não substitui o texto completo, mas reúne o essencial:" },
  {
    type: "ul",
    items: [
      "O Oratio registra a sua vida de oração — o que você reza, seu progresso e o que você escreve dentro do aplicativo.",
      "Isso revela **convicção religiosa**, que a LGPD classifica como **dado pessoal sensível**. Por isso pedimos o seu consentimento de forma específica, e não apenas um \"aceito os termos\" genérico.",
      "**Não vendemos os seus dados. Não exibimos publicidade. Não usamos rastreadores** de análise ou de marketing — nenhum.",
      "Suas conversas com o **Vox**, o assistente do aplicativo, são processadas pela **OpenAI** para que a resposta seja gerada. Você pode apagar qualquer conversa a qualquer momento, dentro do aplicativo.",
      "Nossos servidores e os serviços que utilizamos ficam **fora do Brasil**, principalmente nos Estados Unidos.",
      "Você pode **excluir sua conta e todos os seus dados** a qualquer momento, pelo próprio aplicativo, sem precisar pedir autorização a ninguém.",
      "Você pode **retirar o seu consentimento** quando quiser. Como o Oratio não funciona sem registrar a sua oração, retirar o consentimento significa deixar de usar o aplicativo — e você escolhe se quer manter sua conta guardada ou apagá-la.",
    ],
  },

  { type: "h2", text: "3. Que dados o Oratio trata" },
  {
    type: "p",
    text: "Descrevemos por **categoria**, e não por funcionalidade, porque o aplicativo muda com o tempo e esta política precisa continuar verdadeira.",
  },

  { type: "h3", text: "3.1. Dados de cadastro e identificação" },
  {
    type: "p",
    text: "Nome, endereço de e-mail e, quando você cria uma senha, a senha armazenada de forma criptografada (nunca em texto legível, nem para nós).",
  },
  {
    type: "p",
    text: "Se você entra com uma conta de provedor externo — hoje, o Google — recebemos e guardamos o identificador único que esse provedor atribui a você, o e-mail informado por ele e o seu nome. Não recebemos e não temos acesso à sua senha do provedor.",
  },

  { type: "h3", text: "3.2. Conteúdo que você escreve" },
  {
    type: "p",
    text: "Todo texto que você cria dentro do aplicativo: anotações pessoais, reflexões, compromissos devocionais que você registra para si e as mensagens que você envia ao assistente Vox.",
  },
  {
    type: "p",
    text: "Este é o conteúdo mais íntimo que o Oratio guarda, e recebe o mesmo cuidado que pedimos para nós mesmos.",
  },

  { type: "h3", text: "3.3. Registros da sua prática devocional" },
  {
    type: "p",
    text: "O que você rezou e quando, o seu progresso em percursos e devoções, sequências de dias, marcações e preferências de leitura, e estatísticas derivadas dessas informações.",
  },

  { type: "h3", text: "3.4. Dados técnicos e de acesso" },
  {
    type: "p",
    text: "Endereço IP, informações sobre o navegador e o aparelho utilizado, data e hora dos acessos, e um registro das ações realizadas dentro do aplicativo.",
  },
  {
    type: "p",
    text: "Quando você autoriza notificações, guardamos também o endereço técnico que permite enviá-las ao seu aparelho e o seu fuso horário.",
  },

  { type: "h3", text: "3.5. Preferências e configurações" },
  {
    type: "p",
    text: "Suas escolhas de funcionamento do aplicativo: preferências de notificação, de leitura, de estilo de resposta do assistente e semelhantes.",
  },
  {
    type: "p",
    text: "O aplicativo também pode inferir automaticamente, a partir dos seus horários de uso, qual período do dia você costuma estar ativo — apenas para escolher um horário melhor para enviar lembretes. Essa inferência não produz nenhuma decisão sobre você além disso, e você pode desativar as notificações a qualquer momento.",
  },

  { type: "h2", text: "4. Por que tratamos esses dados, e com qual base legal" },
  {
    type: "table",
    headers: ["Finalidade", "Base legal"],
    rows: [
      [
        "Criar e manter sua conta e prestar o serviço que você pediu",
        "Execução de contrato (art. 7º, V)",
      ],
      [
        "Registrar a sua vida de oração, suas anotações e a sua prática devocional",
        "**Consentimento** (art. 7º, I e art. 11, I)",
      ],
      [
        "Enviar lembretes devocionais e comunicações sobre o aplicativo",
        "Consentimento, revogável a qualquer momento",
      ],
      [
        "Enviar mensagens necessárias ao funcionamento da conta — verificação de e-mail, recuperação de senha, avisos de segurança",
        "Execução de contrato",
      ],
      [
        "Proteger a sua conta e investigar acesso indevido",
        "Legítimo interesse (art. 7º, IX)",
      ],
      [
        "Cumprir obrigação legal ou regulatória, quando houver",
        "Obrigação legal (art. 7º, II)",
      ],
    ],
  },
  {
    type: "p",
    text: "**O que o Oratio não faz, em nenhuma hipótese:** vender ou alugar seus dados, compartilhá-los para fins publicitários, usá-los para criar perfis comerciais, ou entregá-los a terceiros que não estejam listados na seção 6.",
  },

  { type: "h2", text: "5. Dado pessoal sensível — leia com atenção" },
  {
    type: "p",
    text: "A LGPD (art. 5º, II) classifica **convicção religiosa** como dado pessoal sensível, ao lado de informações sobre saúde, origem racial e opinião política.",
  },
  {
    type: "p",
    text: "O Oratio trata esse tipo de dado de forma inevitável: a simples existência da sua conta já indica uma convicção religiosa, e o conteúdo do aplicativo é inteiramente devocional.",
  },
  { type: "p", text: "Por isso:" },
  {
    type: "ul",
    items: [
      "Pedimos o seu **consentimento específico e destacado** antes de criar sua conta ou, para contas já existentes, antes de você continuar usando o aplicativo.",
      "Esse consentimento é registrado com data e hora, e com a versão desta política que estava em vigor.",
      "Você pode **retirá-lo a qualquer momento**. Como não existe versão do Oratio que funcione sem registrar oração, retirar o consentimento encerra o seu uso do aplicativo — e nesse momento você escolhe entre manter sua conta guardada, intacta, ou excluí-la definitivamente.",
    ],
  },

  { type: "h2", text: "6. Com quem os seus dados são compartilhados" },
  {
    type: "p",
    text: "O Oratio utiliza serviços de terceiros para funcionar. Eles tratam dados em nosso nome, apenas para as finalidades descritas abaixo, e não recebem autorização para usá-los para qualquer outro fim.",
  },
  {
    type: "table",
    headers: ["Serviço", "O que recebe", "Para quê", "Onde"],
    rows: [
      ["**Supabase**", "todos os dados armazenados", "banco de dados do aplicativo", "Estados Unidos"],
      ["**Render**", "dados em trânsito durante o uso", "servidor do aplicativo", "Estados Unidos"],
      ["**Vercel**", "dados em trânsito durante o uso", "entrega da interface", "Estados Unidos"],
      ["**OpenAI**", "o conteúdo das suas conversas com o Vox", "gerar as respostas do assistente", "Estados Unidos"],
      ["**Brevo**", "seu e-mail e o conteúdo da mensagem", "envio de e-mails do aplicativo", "União Europeia"],
      ["**Google**", "apenas se você optar por entrar com o Google", "autenticação", "Estados Unidos"],
    ],
  },
  {
    type: "p",
    text: "**Sobre o Vox e a OpenAI:** quando você conversa com o assistente, o texto que você escreve é enviado à OpenAI para que a resposta seja gerada. As conversas também ficam salvas na sua conta, para que você possa relê-las — e podem ser apagadas, uma a uma, dentro do aplicativo.",
  },
  {
    type: "p",
    text: "Além dos serviços acima, seus dados podem ser acessados pelo responsável pelo Oratio, exclusivamente para operar o aplicativo, investigar problemas técnicos ou responder a um pedido seu.",
  },
  {
    type: "p",
    text: "Seus dados também podem ser fornecidos a autoridade pública quando houver ordem judicial ou obrigação legal.",
  },

  { type: "h2", text: "7. Transferência internacional" },
  {
    type: "p",
    text: "Como indicado na tabela acima, a maior parte do tratamento ocorre **fora do Brasil**, principalmente nos Estados Unidos.",
  },
  {
    type: "p",
    text: "Isso é permitido pela LGPD (art. 33) e ocorre com base no seu consentimento e na necessidade de executar o serviço que você contratou. Escolhemos prestadores que adotam medidas de segurança reconhecidas no mercado.",
  },

  { type: "h2", text: "8. Por quanto tempo guardamos" },
  {
    type: "ul",
    items: [
      "**Enquanto sua conta existir**, mantemos os seus dados para que o aplicativo funcione e para que o seu histórico devocional continue disponível para você.",
      "**Contas sem acesso por 24 meses** são excluídas, com todos os dados associados. Avisaremos por e-mail antes disso, no endereço cadastrado.",
      "**Registros de acesso** (endereço IP e informações do aparelho) são mantidos enquanto a sessão correspondente estiver ativa e por um período curto após o seu encerramento, para fins de segurança.",
      "**Se você excluir sua conta**, os dados são apagados de forma permanente e imediata dos nossos sistemas. Cópias de segurança em poder dos prestadores listados na seção 6 são sobrescritas nos ciclos normais desses serviços.",
    ],
  },

  { type: "h2", text: "9. Os seus direitos" },
  { type: "p", text: "A LGPD (art. 18) garante que você pode, a qualquer momento:" },
  {
    type: "ul",
    items: [
      "**Confirmar** que tratamos dados seus e **acessar** esses dados",
      "**Corrigir** dados incompletos, inexatos ou desatualizados",
      "Pedir a **anonimização, bloqueio ou eliminação** de dados desnecessários ou tratados em desconformidade com a lei",
      "Solicitar a **portabilidade** dos seus dados",
      "Pedir a **eliminação** dos dados tratados com base no seu consentimento",
      "Saber **com quem compartilhamos** seus dados",
      "Ser informado sobre a **possibilidade de não consentir** e sobre as consequências disso",
      "**Revogar o seu consentimento**",
    ],
  },

  { type: "h3", text: "Como exercer" },
  {
    type: "p",
    text: "Parte dos seus direitos já está disponível **dentro do aplicativo**, sem precisar pedir nada a ninguém: alterar seu nome e e-mail, apagar conversas com o Vox e excluir sua conta com todos os dados.",
  },
  {
    type: "p",
    text: "Para os demais — incluindo acesso completo e portabilidade — escreva para **inbox.oratio@gmail.com**.",
  },
  {
    type: "p",
    text: "Respondemos em **até 15 dias**, conforme o art. 19 da LGPD. Pedidos que exijam confirmação de identidade podem levar mais tempo, e avisaremos se for o caso.",
  },
  {
    type: "p",
    text: "Se você entender que o seu pedido não foi atendido adequadamente, pode apresentar reclamação à **Autoridade Nacional de Proteção de Dados (ANPD)**.",
  },

  { type: "h2", text: "10. Segurança" },
  {
    type: "p",
    text: "Adotamos medidas técnicas e administrativas para proteger os seus dados, incluindo:",
  },
  {
    type: "ul",
    items: [
      "Senhas armazenadas apenas de forma criptografada, irreversível",
      "Comunicação entre o aplicativo e nossos servidores sempre cifrada",
      "Acesso ao banco de dados restrito e protegido por credenciais próprias",
      "Sessões com expiração e possibilidade de revogação",
    ],
  },
  {
    type: "p",
    text: "Nenhum sistema é completamente imune. Se ocorrer um incidente de segurança que possa acarretar risco ou dano relevante a você, comunicaremos você e a ANPD, conforme o art. 48 da LGPD.",
  },

  { type: "h2", text: "11. Idade mínima" },
  { type: "p", text: "O Oratio destina-se a pessoas com **16 anos ou mais**." },
  {
    type: "p",
    text: "Se tomarmos conhecimento de que criamos uma conta para alguém abaixo dessa idade sem o consentimento adequado, a conta será excluída. Se você é responsável por um adolescente e tem alguma preocupação, escreva para **inbox.oratio@gmail.com**.",
  },

  { type: "h2", text: "12. Alterações nesta política" },
  { type: "p", text: "Esta política pode mudar conforme o aplicativo evolui." },
  {
    type: "p",
    text: "Se a mudança for **material** — isto é, se alterar o que coletamos, para que usamos ou com quem compartilhamos —, avisaremos você dentro do aplicativo e pediremos novamente o seu consentimento antes de continuar.",
  },
  {
    type: "p",
    text: "Mudanças menores, como correções de redação, entram em vigor na publicação. A data e a versão no topo desta página sempre indicam o texto vigente.",
  },

  { type: "h2", text: "13. Contato" },
  { type: "p", text: "**Lucas Farias Leandro**" },
  { type: "p", text: "**inbox.oratio@gmail.com**" },
  {
    type: "p",
    text: "Qualquer dúvida sobre esta política, sobre os seus dados ou sobre como o Oratio funciona: escreva. Respondemos.",
  },
]

export default function PrivacyPolicyContent() {

  return (
    <div className={styles.content}>

      <h1 className={styles.title}>Política de Privacidade do Oratio</h1>

      <p className={styles.meta}>
        Última atualização: 11 de setembro de 2026 · Versão: {PRIVACY_POLICY_VERSION}
      </p>

      {renderLegalBlocks(BLOCKS)}

    </div>
  )

}
