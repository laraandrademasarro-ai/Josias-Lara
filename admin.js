/* =========================================
   ELEMENTOS GERAIS
========================================= */
const paginas =
  document.querySelectorAll(".pagina");
const itensMenu =
  document.querySelectorAll(".menu-item");
const tituloPagina =
  document.getElementById("tituloPagina");
const sidebar =
  document.getElementById("sidebar");
const overlay =
  document.getElementById("overlay");
const abrirMenu =
  document.getElementById("abrirMenu");
const fecharMenu =
  document.getElementById("fecharMenu");
const titulos = {
  dashboard: "Dashboard",
  convites: "Convites",
  convidados: "Convidados",
  confirmacoes: "Confirmações",
  presentes: "Presentes",
  recados: "Recados",
  fotos: "Fotos",
  configuracoes: "Configurações"
};
/* =========================================
   NAVEGAÇÃO
========================================= */
function abrirPagina(id) {
  paginas.forEach((pagina) => {
    pagina.classList.remove("ativa");
  });
  itensMenu.forEach((item) => {
    item.classList.remove("ativo");
  });
  const pagina =
    document.getElementById(id);
  if (!pagina) {
    return;
  }
  pagina.classList.add("ativa");
  const itemMenu =
    document.querySelector(
      `.menu-item[data-page="${id}"]`
    );
  if (itemMenu) {
    itemMenu.classList.add("ativo");
  }
  tituloPagina.textContent =
    titulos[id] || "Painel";
  fecharMenuMobile();
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}
itensMenu.forEach((item) => {
  item.addEventListener(
    "click",
    () => {
      abrirPagina(
        item.dataset.page
      );
    }
  );
});
document
  .querySelectorAll("[data-ir]")
  .forEach((botao) => {
    botao.addEventListener(
      "click",
      () => {
        abrirPagina(
          botao.dataset.ir
        );
      }
    );
  });
/* =========================================
   MENU MOBILE
========================================= */
function abrirMenuMobile() {
  sidebar.classList.add("aberto");
  overlay.classList.add("ativo");
}
function fecharMenuMobile() {
  sidebar.classList.remove("aberto");
  overlay.classList.remove("ativo");
}
abrirMenu?.addEventListener(
  "click",
  abrirMenuMobile
);
fecharMenu?.addEventListener(
  "click",
  fecharMenuMobile
);
overlay?.addEventListener(
  "click",
  fecharMenuMobile
);
/* =========================================
   CONTAGEM REGRESSIVA
========================================= */
function atualizarContagem() {
  const dataCasamento =
    new Date("2027-03-06T17:00:00");
  const agora =
    new Date();
  const diferenca =
    dataCasamento - agora;
  const dias =
    Math.ceil(
      diferenca /
      (
        1000 *
        60 *
        60 *
        24
      )
    );
  const elemento =
    document.getElementById(
      "diasRestantes"
    );
  if (!elemento) {
    return;
  }
  elemento.textContent =
    dias > 0
      ? dias
      : 0;
}
atualizarContagem();
/* =========================================
   MODAIS
========================================= */
function abrirModal(id) {
  const modal =
    document.getElementById(id);
  if (!modal) {
    return;
  }
  modal.classList.add("ativo");
  document.body.style.overflow =
    "hidden";
}
function fecharModal(id) {
  const modal =
    document.getElementById(id);
  if (!modal) {
    return;
  }
  modal.classList.remove("ativo");
  document.body.style.overflow =
    "";
}
document
  .querySelectorAll(
    "[data-fechar-modal]"
  )
  .forEach((botao) => {
    botao.addEventListener(
      "click",
      () => {
        fecharModal(
          botao.dataset.fecharModal
        );
      }
    );
  });
document
  .querySelectorAll(
    ".modal-overlay"
  )
  .forEach((modal) => {
    modal.addEventListener(
      "click",
      (event) => {
        if (
          event.target === modal
        ) {
          fecharModal(
            modal.id
          );
        }
      }
    );
  });
document.addEventListener(
  "keydown",
  (event) => {
    if (
      event.key === "Escape"
    ) {
      document
        .querySelectorAll(
          ".modal-overlay.ativo"
        )
        .forEach((modal) => {
          fecharModal(
            modal.id
          );
        });
    }
  });
/* =========================================
   DADOS DOS CONVITES
========================================= */
let convites =
  JSON.parse(
    localStorage.getItem(
      "convitesCasamento"
    )
  ) || [];
function salvarConvites() {
  localStorage.setItem(
    "convitesCasamento",
    JSON.stringify(convites)
  );
}
/* =========================================
   ELEMENTOS DO FORMULÁRIO
========================================= */
const formConvite =
  document.getElementById(
    "formConvite"
  );
const conviteId =
  document.getElementById(
    "conviteId"
  );
const nomeConvite =
  document.getElementById(
    "nomeConvite"
  );
const tipoConvite =
  document.getElementById(
    "tipoConvite"
  );
const mensagemConvite =
  document.getElementById(
    "mensagemConvite"
  );
const musicaConvite =
  document.getElementById(
    "musicaConvite"
  );
const listaPessoasForm =
  document.getElementById(
    "listaPessoasForm"
  );
const adicionarPessoa =
  document.getElementById(
    "adicionarPessoa"
  );
const salvarConvite =
  document.getElementById(
    "salvarConvite"
  );
const tituloModalConvite =
  document.getElementById(
    "tituloModalConvite"
  );
const listaConvites =
  document.getElementById(
    "listaConvites"
  );
const listaConvidados =
  document.getElementById(
    "listaConvidados"
  );
/* =========================================
   GERAR ID
========================================= */
function gerarId() {
  if (
    window.crypto &&
    crypto.randomUUID
  ) {
    return crypto.randomUUID();
  }
  return (
    Date.now().toString() +
    Math.random()
      .toString(16)
      .slice(2)
  );
}
/* =========================================
   SLUG
========================================= */
function criarSlug(texto) {
  return texto
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );
}
/* =========================================
   PESSOAS DO CONVITE
========================================= */
function adicionarCampoPessoa(
  nome = ""
) {
  const linha =
    document.createElement(
      "div"
    );
  linha.className =
    "pessoa-form";
  linha.innerHTML = `
    <input
      type="text"
      class="input-pessoa"
      placeholder="Nome do convidado"
      value="${escaparHTML(nome)}"
    >
    <button
      type="button"
      class="remover-pessoa"
      title="Remover pessoa"
    >
      <i class="fa-regular fa-trash-can"></i>
    </button>
  `;
  linha
    .querySelector(
      ".remover-pessoa"
    )
    .addEventListener(
      "click",
      () => {
        linha.remove();
        if (
          listaPessoasForm
            .querySelectorAll(
              ".pessoa-form"
            )
            .length === 0
        ) {
          adicionarCampoPessoa();
        }
      }
    );
  listaPessoasForm
    .appendChild(linha);
}
adicionarPessoa
  ?.addEventListener(
    "click",
    () => {
      adicionarCampoPessoa();
    }
  );
function pegarPessoasFormulario() {
  const inputs =
    listaPessoasForm
      .querySelectorAll(
        ".input-pessoa"
      );
  const pessoas = [];
  inputs.forEach(
    (input) => {
      const nome =
        input.value.trim();
      if (nome) {
        pessoas.push({
          id: gerarId(),
          nome,
          status: "pendente"
        });
      }
    }
  );
  return pessoas;
}
/* =========================================
   SEGURANÇA HTML
========================================= */
function escaparHTML(texto = "") {
  return texto
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
/* =========================================
   FORMATAR TIPO
========================================= */
function formatarTipo(tipo) {
  const tipos = {
    comum: "Comum",
    padrinhos: "Padrinhos",
    pais: "Pais",
    celebrante: "Celebrante"
  };
  return tipos[tipo] || tipo;
}
function classeTipo(tipo) {
  if (
    tipo === "padrinhos"
  ) {
    return "padrinhos";
  }
  if (
    tipo === "pais"
  ) {
    return "pais";
  }
  if (
    tipo === "celebrante"
  ) {
    return "celebrante";
  }
  return "";
}
/* =========================================
   NOVO CONVITE
========================================= */
function prepararNovoConvite() {
  formConvite.reset();
  conviteId.value = "";
  listaPessoasForm.innerHTML = "";
  adicionarCampoPessoa();
  tituloModalConvite.textContent =
    "Criar convite";
  salvarConvite.innerHTML = `
    Criar convite
  `;
  abrirModal(
    "modalConvite"
  );
}
document
  .getElementById(
    "botaoNovoConvite"
  )
  ?.addEventListener(
    "click",
    prepararNovoConvite
  );
document
  .getElementById(
    "novoConviteInterno"
  )
  ?.addEventListener(
    "click",
    prepararNovoConvite
  );
/* =========================================
   SALVAR CONVITE
========================================= */
formConvite
  ?.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();
      const nome =
        nomeConvite.value.trim();
      const tipo =
        tipoConvite.value;
      const mensagem =
        mensagemConvite.value.trim();
      const musica =
        musicaConvite.value.trim();
      const pessoas =
        pegarPessoasFormulario();
      if (!nome) {
        alert(
          "Informe o nome do convite."
        );
        return;
      }
      if (!tipo) {
        alert(
          "Selecione o tipo do convite."
        );
        return;
      }
      if (
        pessoas.length === 0
      ) {
        alert(
          "Adicione pelo menos uma pessoa ao convite."
        );
        return;
      }
      if (
        conviteId.value
      ) {
        const indice =
          convites.findIndex(
            (convite) =>
              convite.id ===
              conviteId.value
          );
        if (
          indice !== -1
        ) {
          const pessoasAntigas =
            convites[indice].pessoas;
          const pessoasAtualizadas =
            pessoas.map(
              (pessoa) => {
                const antiga =
                  pessoasAntigas.find(
                    (item) =>
                      item.nome
                        .toLowerCase() ===
                      pessoa.nome
                        .toLowerCase()
                  );
                if (antiga) {
                  return {
                    ...antiga,
                    nome: pessoa.nome
                  };
                }
                return pessoa;
              }
            );
          convites[indice] = {
            ...convites[indice],
            nome,
            tipo,
            mensagem,
            musica,
            pessoas:
              pessoasAtualizadas // O spread acima preserva o slug original.
          };
        }
      } else {
        convites.push({
          id: gerarId(),
          nome,
          tipo,
          pessoas,
          mensagem,
          musica,
          slug:
            criarSlugUnico(nome),
          criadoEm:
            new Date()
              .toISOString()
        });
      }
      salvarConvites();
      atualizarTudo();
      fecharModal(
        "modalConvite"
      );
      abrirPagina(
        "convites"
      );
      const saved = convites.find(item => item.id === conviteId.value);
      if (saved?.acessoFotos && window.publicarConviteProtegido) {
        try {
          await window.publicarConviteProtegido(saved);
        } catch (error) {
          alert('Alterações salvas neste navegador. O link online ainda não foi atualizado. ' + error.message);
        }
      }
    }
  );
/* =========================================
   EDITAR
========================================= */
window.editarConvite =
  function(id) {
    const convite =
      convites.find(
        (item) =>
          item.id === id
      );
    if (!convite) {
      return;
    }
    conviteId.value =
      convite.id;
    nomeConvite.value =
      convite.nome;
    tipoConvite.value =
      convite.tipo;
    mensagemConvite.value =
      convite.mensagem || "";
    musicaConvite.value =
      convite.musica || "";
    listaPessoasForm.innerHTML =
      "";
    convite.pessoas.forEach(
      (pessoa) => {
        adicionarCampoPessoa(
          pessoa.nome
        );
      }
    );
    tituloModalConvite.textContent =
      "Editar convite";
    salvarConvite.innerHTML = `
      Salvar alterações
    `;
    abrirModal(
      "modalConvite"
    );
  };
/* =========================================
   EXCLUIR
========================================= */
window.excluirConvite =
  async function(id) {
    const convite =
      convites.find(
        (item) =>
          item.id === id
      );
    if (!convite) {
      return;
    }
    const confirmar =
      window.confirm(
        `Deseja excluir o convite "${convite.nome}"?`
      );
    if (!confirmar) {
      return;
    }
    try {
      await window.revogarConviteProtegido?.(convite);
    } catch (error) {
      alert(error.message);
      return;
    }
    convites =
      convites.filter(
        (item) =>
          item.id !== id
      );
    salvarConvites();
    atualizarTudo();
  };
/* =========================================
   COPIAR LINK
========================================= */
window.copiarLinkConvite =
  async function(id) {
    const convite =
      convites.find(
        (item) =>
          item.id === id
      );
    if (!convite) {
      return;
    }
    let pasta =
      window.location.href;
    pasta =
      pasta.substring(
        0,
        pasta.lastIndexOf("/") + 1
      );
    let token;
    try {
      token = await window.publicarConviteProtegido(convite);
    } catch (error) {
      alert(error.message);
      return;
    }
    const link = `${pasta}convite.html?c=${encodeURIComponent(convite.slug)}#acesso=${token}`;
    try {
      await navigator
        .clipboard
        .writeText(link);
      alert(
        "Link copiado!"
      );
    } catch {
      window.prompt(
        "Copie o link:",
        link
      );
    }
  };
/* =========================================
   RENDERIZAR CONVITES
========================================= */
let filtroAtual =
  "todos";
function renderizarConvites() {
  if (!listaConvites) {
    return;
  }
  const pesquisa =
    document
      .getElementById(
        "pesquisaConvites"
      )
      ?.value
      .trim()
      .toLowerCase() || "";
  const filtrados =
    convites.filter(
      (convite) => {
        const tipoOk =
          filtroAtual === "todos" ||
          convite.tipo === filtroAtual;
        const texto =
          [
            convite.nome,
            convite.tipo,
            ...convite.pessoas.map(
              (pessoa) =>
                pessoa.nome
            )
          ]
            .join(" ")
            .toLowerCase();
        const pesquisaOk =
          texto.includes(
            pesquisa
          );
        return (
          tipoOk &&
          pesquisaOk
        );
      }
    );
  listaConvites.innerHTML = "";
  if (
    filtrados.length === 0
  ) {
    listaConvites.innerHTML = `
      <div class="convites-vazio">
        <i class="fa-regular fa-envelope"></i>
        <strong>
          Nenhum convite encontrado
        </strong>
        <span>
          Crie um novo convite ou altere os filtros.
        </span>
      </div>
    `;
    return;
  }
  filtrados.forEach(
    (convite) => {
      const quantidade =
        convite.pessoas.length;
      const confirmados =
        convite.pessoas.filter(
          (pessoa) =>
            pessoa.status ===
            "confirmado"
        ).length;
      let statusTexto =
        "Pendente";
      let statusClasse =
        "pendente";
      if (
        confirmados === quantidade &&
        quantidade > 0
      ) {
        statusTexto =
          "Confirmado";
        statusClasse =
          "confirmado";
      }
      const linha =
        document.createElement(
          "div"
        );
      linha.className =
        "tabela-linha";
      linha.innerHTML = `
        <div>
          <strong>
            ${escaparHTML(convite.nome)}
          </strong>
          <span>
            /convite/${escaparHTML(convite.slug)}
          </span>
        </div>
        <div>
          <span
            class="badge ${classeTipo(convite.tipo)}"
          >
            ${formatarTipo(convite.tipo)}
          </span>
        </div>
        <div>
          ${
            quantidade === 1
              ? "1 pessoa"
              : `${quantidade} pessoas`
          }
        </div>
        <div>
          <span
            class="status ${statusClasse}"
          >
            ${statusTexto}
          </span>
        </div>
        <div class="acoes-tabela">
          <button
            type="button"
            title="Copiar link"
            onclick="copiarLinkConvite('${convite.id}')"
          >
            <i class="fa-regular fa-copy"></i>
          </button>
          <button
            type="button"
            title="Editar"
            onclick="editarConvite('${convite.id}')"
          >
            <i class="fa-regular fa-pen-to-square"></i>
          </button>
          <button
            type="button"
            title="Excluir"
            class="excluir"
            onclick="excluirConvite('${convite.id}')"
          >
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </div>
      `;
      listaConvites
        .appendChild(
          linha
        );
    }
  );
}
/* =========================================
   FILTROS
========================================= */
document
  .querySelectorAll(
    ".filtro"
  )
  .forEach((filtro) => {
    filtro.addEventListener(
      "click",
      () => {
        document
          .querySelectorAll(
            ".filtro"
          )
          .forEach(
            (item) => {
              item.classList.remove(
                "ativo"
              );
            }
          );
        filtro.classList.add(
          "ativo"
        );
        filtroAtual =
          filtro.dataset.filtro;
        renderizarConvites();
      }
    );
  });
document
  .getElementById(
    "pesquisaConvites"
  )
  ?.addEventListener(
    "input",
    renderizarConvites
  );
/* =========================================
   CONVIDADOS
========================================= */
function renderizarConvidados() {
  if (!listaConvidados) {
    return;
  }
  listaConvidados.innerHTML =
    "";
  const pessoas = [];
  convites.forEach(
    (convite) => {
      convite.pessoas.forEach(
        (pessoa) => {
          pessoas.push({
            ...pessoa,
            conviteNome:
              convite.nome,
            conviteTipo:
              convite.tipo
          });
        }
      );
    }
  );
  if (
    pessoas.length === 0
  ) {
    listaConvidados.innerHTML = `
      <div class="convites-vazio">
        <i class="fa-solid fa-users"></i>
        <strong>
          Nenhum convidado cadastrado
        </strong>
        <span>
          Os convidados serão adicionados
          através dos convites.
        </span>
      </div>
    `;
    return;
  }
  pessoas.forEach(
    (pessoa) => {
      const linha =
        document.createElement(
          "div"
        );
      linha.className =
        "tabela-linha";
      const statusTexto =
        pessoa.status === "confirmado"
          ? "Confirmado"
          : pessoa.status === "nao_vai"
            ? "Não irá"
            : "Pendente";
      const statusClasse =
        pessoa.status === "confirmado"
          ? "confirmado"
          : "pendente";
      linha.innerHTML = `
        <div>
          <strong>
            ${escaparHTML(pessoa.nome)}
          </strong>
        </div>
        <div>
          ${escaparHTML(pessoa.conviteNome)}
        </div>
        <div>
          <span
            class="badge ${classeTipo(pessoa.conviteTipo)}"
          >
            ${formatarTipo(pessoa.conviteTipo)}
          </span>
        </div>
        <div>
          <span
            class="status ${statusClasse}"
          >
            ${statusTexto}
          </span>
        </div>
        <div></div>
      `;
      listaConvidados
        .appendChild(
          linha
        );
    }
  );
}
/* =========================================
   DASHBOARD
========================================= */
function atualizarDashboard() {
  const totalConvidados =
    convites.reduce(
      (total, convite) =>
        total +
        convite.pessoas.length,
      0
    );
  const pendentes =
    convites.reduce(
      (total, convite) => {
        return (
          total +
          convite.pessoas.filter(
            (pessoa) =>
              pessoa.status ===
              "pendente"
          ).length
        );
      },
      0
    );
  const elementoTotal =
    document.getElementById(
      "totalConvidados"
    );
  const elementoPendentes =
    document.getElementById(
      "totalPendentes"
    );
  if (elementoTotal) {
    elementoTotal.textContent =
      totalConvidados;
  }
  if (elementoPendentes) {
    elementoPendentes.textContent =
      pendentes;
  }
  renderizarConvitesRecentes();
}
function renderizarConvitesRecentes() {
  const container =
    document.getElementById(
      "convitesRecentes"
    );
  if (!container) {
    return;
  }
  container.innerHTML = "";
  if (
    convites.length === 0
  ) {
    container.innerHTML = `
      <div class="estado-vazio-mini">
        Nenhum convite criado ainda.
      </div>
    `;
    return;
  }
  const recentes =
    [...convites]
      .reverse()
      .slice(0, 3);
  recentes.forEach(
    (convite) => {
      const iniciais =
        convite.nome
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map(
            (palavra) =>
              palavra[0]
          )
          .join("")
          .toUpperCase();
      const item =
        document.createElement(
          "div"
        );
      item.className =
        "atividade";
      item.innerHTML = `
        <div class="avatar">
          ${escaparHTML(iniciais)}
        </div>
        <div>
          <p>
            <strong>
              ${escaparHTML(convite.nome)}
            </strong>
            • ${formatarTipo(convite.tipo)}
          </p>
          <span>
            ${convite.pessoas.length}
            ${
              convite.pessoas.length === 1
                ? "pessoa"
                : "pessoas"
            }
          </span>
        </div>
      `;
      container.appendChild(
        item
      );
    }
  );
}
/* =========================================
   ESTILO ATIVIDADE
========================================= */
function adicionarEstilosAtividade() {
  if (
    document.getElementById(
      "estilosAtividade"
    )
  ) {
    return;
  }
  const style =
    document.createElement(
      "style"
    );
  style.id =
    "estilosAtividade";
  style.innerHTML = `
    .lista-atividade {
      display: flex;
      flex-direction: column;
    }
    .atividade {
      padding: 14px 0;
      display: flex;
      align-items: center;
      gap: 13px;
      border-bottom: 1px solid #f0ece5;
    }
    .atividade:last-child {
      border-bottom: none;
    }
    .avatar {
      width: 40px;
      height: 40px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: #efebe3;
      color: #0b2342;
      font-family: "Cormorant Garamond", serif;
      font-size: 15px;
      font-weight: 600;
    }
    .atividade p {
      margin: 0;
      color: #636a73;
      font-size: 11px;
      line-height: 1.5;
    }
    .atividade p strong {
      color: #202732;
    }
    .atividade span {
      display: block;
      margin-top: 4px;
      color: #a2a6ad;
      font-size: 9px;
    }
  `;
  document.head
    .appendChild(
      style
    );
}
adicionarEstilosAtividade();
/* =========================================
   PRESENTES
========================================= */
/* =========================================
   ATUALIZAÇÃO GERAL
========================================= */
function atualizarTudo() {
  renderizarConvites();
  renderizarConvidados();
  atualizarDashboard();
}
/* =========================================
   INICIALIZAÇÃO
========================================= */
if (
  listaPessoasForm &&
  listaPessoasForm.children.length === 0
) {
  adicionarCampoPessoa();
}
atualizarTudo();
function criarSlugUnico(nome) {
  const base = criarSlug(nome) || "convite";
  let slug = base;
  let sufixo = 2;
  while (convites.some(convite => convite.slug === slug)) slug = base + "-" + sufixo++;
  return slug;
}

/* FOTOS / SUPABASE STORAGE
 * Antes de admin.js, configure window.CASAMENTO_FOTOS = {
 *   client: clienteSupabaseAutenticado, bucket: "", prefix: ""
 * };
 * Use supabase-js v2 e uma sessão de administrador. Não use service_role.
 * bucket e prefix devem corresponder à configuração real e às políticas RLS.
 * Subpastas: capa, destaque, galeria, madrinhas e padrinhos.
 * Nenhum arquivo, Base64 ou URL temporária é gravado no localStorage.
 */
(() => {
  const root = document.getElementById('fotos');
  if (!root) return;
  const labels = { capa:'Capa do convite', destaque:'Foto de destaque', galeria:'Galeria', madrinhas:'Madrinhas', padrinhos:'Padrinhos' };
  const groups = Object.keys(labels);
  const saved = Object.fromEntries(groups.map(key => [key, []]));
  const drafts = Object.fromEntries(groups.map(key => [key, []]));
  const input = document.getElementById('selecionarFotos');
  const status = document.getElementById('fotosStatus');
  const connection = document.getElementById('fotosConexao');
  let selectedGroup = 'galeria';
  let busy = false;
  let ready = false;
  let config;
  let bucket;
  let reloadQueued = false;
  const configured = () => Boolean(config?.client?.storage && config.bucket?.trim() && config.prefix?.trim());
  const folder = key => `${config.prefix.replace(/^\/+|\/+$/g, '')}/${key}`;
  function say(message, error = false) {
    status.textContent = message;
    status.classList.toggle('erro', error);
  }
  function pending() { return groups.some(key => drafts[key].length); }
  function release(item) { if (item?.file) URL.revokeObjectURL(item.url); }
  function button(text, action, secondary = false) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = secondary ? 'botao-secundario' : 'botao-principal';
    el.textContent = text;
    el.disabled = busy;
    el.addEventListener('click', action);
    return el;
  }
  function choose(key) {
    selectedGroup = key;
    input.multiple = key === 'galeria';
    input.value = '';
    input.click();
  }
  function card(key, item, gallery = false) {
    const el = document.createElement('article');
    el.className = 'foto-card';
    const title = document.createElement('h4');
    title.textContent = gallery ? 'Foto da galeria' : labels[key];
    el.append(title);
    const preview = document.createElement('div');
    preview.className = 'foto-preview';
    if (item) {
      const img = document.createElement('img');
      img.src = item.url;
      img.alt = gallery ? `Foto da galeria: ${item.name}` : labels[key];
      img.addEventListener('error', () => {
        preview.textContent = 'Prévia indisponível. Use Atualizar fotos para tentar novamente.';
      });
      preview.append(img);
    } else {
      const text = document.createElement('span');
      text.textContent = 'Nenhuma imagem escolhida';
      preview.append(text);
    }
    el.append(preview);
    const caption = document.createElement('p');
    caption.className = 'foto-legenda';
    caption.textContent = item ? (item.file ? 'Prévia • ainda não salva' : 'Salva no Storage') : 'JPG, PNG ou WebP • até 6 MB';
    el.append(caption);
    const actions = document.createElement('div');
    actions.className = 'foto-acoes';
    if (!gallery) actions.append(button(item ? 'Trocar foto' : 'Escolher foto', () => choose(key), true));
    if (item?.file) {
      const save = button('Salvar foto', () => upload(key, item));
      save.disabled = busy || !ready;
      save.title = ready ? 'Enviar imagem ao Storage' : 'Configure a conexão e atualize as fotos para salvar';
      actions.append(save);
    }
    if (item) {
      const remove = button(item.file ? 'Descartar prévia' : 'Remover', () => removePhoto(key, item), true);
      remove.classList.add('foto-remover');
      actions.append(remove);
    }
    el.append(actions);
    return el;
  }
  function render() {
    const main = document.getElementById('fotosPrincipais');
    const attire = document.getElementById('fotosTrajes');
    const gallery = document.getElementById('galeriaFotos');
    main.replaceChildren(); attire.replaceChildren(); gallery.replaceChildren();
    for (const key of ['capa','destaque','madrinhas','padrinhos']) {
      (key === 'capa' || key === 'destaque' ? main : attire).append(card(key, drafts[key][0] || saved[key][0]));
    }
    for (const item of [...saved.galeria, ...drafts.galeria]) gallery.append(card('galeria', item, true));
    if (!gallery.children.length) {
      const empty = document.createElement('p');
      empty.className = 'fotos-vazia';
      empty.textContent = 'As lembranças do casal aparecerão aqui. Adicione suas primeiras fotos.';
      gallery.append(empty);
    }
    document.getElementById('adicionarFotosGaleria').disabled = busy;
    document.getElementById('recarregarFotos').disabled = busy;
    root.setAttribute('aria-busy', String(busy));
    const logout = document.getElementById('sairFotos');
    if (logout) logout.disabled = busy;
    connection.textContent = ready
      ? 'Fotos carregadas. Escolha uma imagem, confira a prévia e clique em Salvar foto. O envio depende das permissões do administrador.'
      : 'Entre com o administrador para salvar. As prévias não salvas são temporárias e serão descartadas ao fechar ou recarregar a página.';
    if (!busy && reloadQueued) {
      reloadQueued = false;
      queueMicrotask(reload);
    }
  }
  async function signed(path) {
    const { data, error } = await bucket.createSignedUrl(path, 3600);
    if (error) throw error;
    if (!data?.signedUrl) throw new Error('O Storage não retornou a prévia.');
    return data.signedUrl;
  }
  async function loadGroup(key) {
    const records = [];
    for (let offset = 0; ; offset += 100) {
      const { data, error } = await bucket.list(folder(key), { limit:100, offset, sortBy:{ column:'name', order:'desc' } });
      if (error) throw error;
      if (!Array.isArray(data)) throw new Error('Não foi possível listar as imagens.');
      for (const file of data) {
        if (!file.id || !/\.(jpg|jpeg|png|webp)$/i.test(file.name)) continue;
        const path = `${folder(key)}/${file.name}`;
        records.push({ path, name:file.name, url:await signed(path) });
      }
      if (data.length < 100) break;
    }
    return records;
  }
  async function reload() {
    if (busy) { reloadQueued = true; return; }
    config = window.CASAMENTO_FOTOS;
    ready = false;
    groups.forEach(key => { saved[key] = []; });
    if (!configured()) { render(); say('Faça login acima para carregar e salvar suas fotos.'); return; }
    busy = true; render(); say('Carregando fotos…');
    try {
      bucket = config.client.storage.from(config.bucket);
      const loaded = await Promise.all(groups.map(loadGroup));
      groups.forEach((key, i) => { saved[key] = loaded[i]; });
      ready = true;
      say('Fotos atualizadas.');
    } catch (error) { say(`Não foi possível carregar as fotos: ${error.message || 'verifique a conexão e as permissões.'}`, true); }
    finally { busy = false; render(); }
  }
  async function validate(file) {
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error(`${file.name}: use JPG, PNG ou WebP.`);
    if (!file.size || file.size > 6 * 1024 * 1024) throw new Error(`${file.name}: a foto deve ter até 6 MB e não pode estar vazia.`);
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return { file, url, name:file.name };
    } catch { URL.revokeObjectURL(url); throw new Error(`${file.name}: não foi possível abrir a imagem.`); }
  }
  input.addEventListener('change', async () => {
    if (busy) return;
    const key = selectedGroup;
    const files = Array.from(input.files || []);
    if (!files.length) return;
    busy = true; render();
    const errors = [];
    let count = 0;
    for (const file of key === 'galeria' ? files : files.slice(0,1)) {
      try {
        const item = await validate(file);
        if (key !== 'galeria') { drafts[key].forEach(release); drafts[key] = []; }
        drafts[key].push(item); count++;
      } catch (error) { errors.push(error.message); }
    }
    input.value = '';
    busy = false; render();
    say([count ? `${count} prévia(s) pronta(s). ${ready ? 'Clique em Salvar foto para enviar.' : 'O salvamento depende da configuração do Storage.'}` : '', ...errors].filter(Boolean).join(' '), errors.length > 0);
  });
  async function upload(key, item) {
    if (busy || !ready || config !== window.CASAMENTO_FOTOS || !drafts[key].includes(item)) return;
    busy = true; render(); say('Salvando foto…');
    let path;
    let uploaded = false;
    let committed = false;
    try {
      const extension = { 'image/jpeg':'jpg', 'image/png':'png', 'image/webp':'webp' }[item.file.type];
      path = `${folder(key)}/${Date.now()}-${gerarId()}.${extension}`;
      const { error } = await bucket.upload(path, item.file, { contentType:item.file.type, cacheControl:'3600', upsert:false });
      if (error) throw error;
      uploaded = true;
      const next = { path, name:item.name, url:await signed(path) };
      const previous = saved[key];
      saved[key] = key === 'galeria' ? [next, ...previous] : [next];
      drafts[key] = drafts[key].filter(candidate => candidate !== item);
      release(item);
      committed = true;
      if (key !== 'galeria' && previous.length) {
        const { error:deleteError } = await bucket.remove(previous.map(photo => photo.path));
        if (deleteError) {
          saved[key].push(...previous);
          say('Nova foto salva. Não foi possível apagar a versão anterior do Storage; verifique as permissões de exclusão antes da próxima troca.', true);
          return;
        }
      }
      say('Foto salva no Storage.');
    } catch (error) {
      let cleanup = '';
      if (uploaded && !committed) {
        try {
          const { error:removeError } = await bucket.remove([path]);
          if (removeError) cleanup = ` O upload ficou no Storage em ${path}; verifique-o antes de tentar novamente.`;
        } catch { cleanup = ` Verifique o arquivo ${path} no Storage antes de tentar novamente.`; }
      }
      say(`Não foi possível concluir: ${error.message || 'verifique sua conexão.'}${cleanup}`, true);
    } finally { busy = false; render(); }
  }
  async function removePhoto(key, item) {
    if (busy) return;
    if (item.file) {
      release(item);
      drafts[key] = drafts[key].filter(candidate => candidate !== item);
      render(); say('Prévia descartada.'); return;
    }
    if (!ready || config !== window.CASAMENTO_FOTOS || !window.confirm(`Remover esta imagem de ${labels[key]} do Storage?`)) return;
    busy = true; render(); say('Removendo foto…');
    try {
      const targets = key === 'galeria' ? [item] : saved[key];
      const { error } = await bucket.remove(targets.map(photo => photo.path));
      if (error) throw error;
      saved[key] = saved[key].filter(photo => !targets.includes(photo));
      say('Foto removida.');
    } catch (error) { say(`Não foi possível remover: ${error.message || 'verifique as permissões.'}`, true); }
    finally { busy = false; render(); }
  }
  document.getElementById('adicionarFotosGaleria').addEventListener('click', () => choose('galeria'));
  document.getElementById('recarregarFotos').addEventListener('click', reload);
  window.addEventListener('casamento:fotos-auth', () => {
    ready = false;
    reload();
  });
  window.addEventListener('beforeunload', event => {
    if (pending() || busy) { event.preventDefault(); event.returnValue = ''; }
  });
  window.addEventListener('pagehide', event => {
    if (!event.persisted) groups.forEach(key => drafts[key].forEach(release));
  });
  reload();
})();
