/* =========================================
   PARAMETROS E DADOS
========================================= */

const parametros = new URLSearchParams(
  window.location.search
);

const slug = parametros.get("c");

let convites = JSON.parse(
  localStorage.getItem("convitesCasamento")
) || [];

let convite = convites.find(
  (item) => item.slug === slug
);


/* =========================================
   ELEMENTOS
========================================= */

const siteConvite =
  document.getElementById("siteConvite");

const conviteErro =
  document.getElementById("conviteErro");

const nomeConviteHero =
  document.getElementById("nomeConviteHero");

const heroTipo =
  document.getElementById("heroTipo");

const mensagemHero =
  document.getElementById("mensagemHero");

const tituloBoasVindas =
  document.getElementById("tituloBoasVindas");

const textoBoasVindas =
  document.getElementById("textoBoasVindas");

const manualPadrinhos =
  document.getElementById("manualPadrinhos");

const secaoEspecial =
  document.getElementById("secaoEspecial");

const especialMiniTitulo =
  document.getElementById("especialMiniTitulo");

const especialTitulo =
  document.getElementById("especialTitulo");

const especialTexto =
  document.getElementById("especialTexto");

const especialConteudo =
  document.getElementById("especialConteudo");

const listaPessoas =
  document.getElementById("listaPessoas");

const secaoPresentes =
  document.getElementById("secaoPresentes");

const botaoEntrar =
  document.getElementById("botaoEntrar");

const audioConvite =
  document.getElementById("audioConvite");

const controleMusica =
  document.getElementById("controleMusica");

const iconeMusica =
  document.getElementById("iconeMusica");

const textoRecado =
  document.getElementById("textoRecado");

const contadorRecado =
  document.getElementById("contadorRecado");


/* =========================================
   INICIALIZACAO
========================================= */

async function iniciarConvite() {
  if (window.temAcessoConvite) {
    conviteErro.classList.add('ativo');
    conviteErro.querySelector('h1').textContent = 'Abrindo seu convite';
    conviteErro.querySelector('p').textContent = 'Estamos preparando os detalhes para você…';
    try {
      convite = await window.carregarConvitePrivado();
      // Mantém o comportamento local já existente do RSVP e dos recados.
      const index = convites.findIndex(item => item.id === convite.id);
      if (index < 0) convites.push(convite);
      else {
        const local = convites[index];
        convite.pessoas = convite.pessoas.map(person => {
          const previous = local.pessoas.find(item => item.id === person.id);
          return previous ? { ...person, status: previous.status } : person;
        });
        convites[index] = { ...local, ...convite };
      }
      localStorage.setItem('convitesCasamento', JSON.stringify(convites));
    } catch (error) {
      conviteErro.querySelector('h1').textContent = 'Não foi possível abrir';
      conviteErro.querySelector('p').textContent = error.message || 'Confira sua conexão e recarregue a página.';
      return;
    }
  }
  if (!convite) {
    conviteErro.classList.add('ativo');
    return;
  }
  conviteErro.classList.remove('ativo');
  siteConvite.classList.add('ativo');
  carregarConvite();
}
iniciarConvite();


/* =========================================
   CARREGAR CONVITE
========================================= */

function carregarConvite() {
  nomeConviteHero.textContent =
    convite.nome;

  if (convite.mensagem) {
    mensagemHero.textContent =
      convite.mensagem;
  }

  manualPadrinhos.classList.remove(
    "ativo"
  );

  secaoEspecial.classList.remove(
    "ativo"
  );

  secaoPresentes.style.display =
    "";

  switch (convite.tipo) {
    case "padrinhos":
      configurarPadrinhos();
      break;

    case "pais":
      configurarPais();
      break;

    case "celebrante":
      configurarCelebrante();
      break;

    default:
      configurarComum();
  }

  renderizarPessoas();

  configurarMusica();
}


/* =========================================
   COMUM
========================================= */

function configurarComum() {
  heroTipo.textContent =
    "Você é nosso convidado";

  tituloBoasVindas.textContent =
    "Que alegria ter você conosco";

  textoBoasVindas.textContent =
    "Há momentos que ganham ainda mais significado quando compartilhados com pessoas especiais. Será uma alegria ter você conosco neste novo capítulo da nossa história.";
}


/* =========================================
   PADRINHOS
========================================= */

function configurarPadrinhos() {
  heroTipo.textContent =
    "Um convite muito especial";

  tituloBoasVindas.textContent =
    "Queremos vocês ainda mais perto";

  textoBoasVindas.textContent =
    "Existem pessoas que não poderiam apenas assistir a esse momento. Queremos vocês ao nosso lado, fazendo parte dele de uma maneira ainda mais especial.";

  manualPadrinhos.classList.add(
    "ativo"
  );
}


/* =========================================
   PAIS
========================================= */

function configurarPais() {
  heroTipo.textContent =
    "Para quem esteve conosco desde o começo";

  tituloBoasVindas.textContent =
    "Vocês fazem parte da nossa história";

  textoBoasVindas.textContent =
    "Antes de começarmos nossa própria família, queremos agradecer a quem esteve presente na construção das nossas vidas e caminhou conosco até aqui.";

  secaoEspecial.classList.add(
    "ativo"
  );

  especialMiniTitulo.textContent =
    "Com todo nosso amor";

  especialTitulo.textContent =
    "Obrigado por tudo";

  especialTexto.textContent =
    "Ter vocês conosco neste dia representa muito mais do que conseguimos colocar em palavras.";

  especialConteudo.innerHTML = `
    <div class="info-especial">
      <i class="fa-regular fa-heart"></i>

      <div>
        <strong>
          Um lugar especial
        </strong>

        <span>
          Vocês não são apenas convidados.
          Fazem parte da história que nos trouxe
          até este momento.
        </span>
      </div>
    </div>

    <div class="info-especial">
      <i class="fa-solid fa-people-roof"></i>

      <div>
        <strong>
          Nossa família
        </strong>

        <span>
          Este dia também celebra tudo aquilo
          que aprendemos e recebemos de vocês.
        </span>
      </div>
    </div>
  `;
}


/* =========================================
   CELEBRANTE
========================================= */

function configurarCelebrante() {
  heroTipo.textContent =
    "Temos um convite especial";

  tituloBoasVindas.textContent =
    "Gostaríamos que fizesse parte deste momento";

  textoBoasVindas.textContent =
    "Entre tantas pessoas importantes em nossa caminhada, gostaríamos de convidá-lo para uma participação muito especial no início da nossa vida juntos.";

  secaoEspecial.classList.add(
    "ativo"
  );

  especialMiniTitulo.textContent =
    "Convite para celebrar";

  especialTitulo.textContent =
    "Aceita celebrar nossa cerimônia?";

  especialTexto.textContent =
    "Será uma honra ter sua participação conduzindo este momento tão importante para nós.";

  especialConteudo.innerHTML = `
    <div class="info-especial">
      <i class="fa-regular fa-calendar"></i>

      <div>
        <strong>
          Data
        </strong>

        <span>
          06 de março de 2027.
        </span>
      </div>
    </div>

    <div class="info-especial">
      <i class="fa-regular fa-clock"></i>

      <div>
        <strong>
          Horário da cerimônia
        </strong>

        <span>
          17:00.
        </span>
      </div>
    </div>

    <div class="info-especial">
      <i class="fa-regular fa-message"></i>

      <div>
        <strong>
          Informações da cerimônia
        </strong>

        <span>
          Depois poderemos colocar aqui roteiro,
          contatos, horário recomendado de chegada
          e demais orientações.
        </span>
      </div>
    </div>
  `;

  secaoPresentes.style.display =
    "none";
}


/* =========================================
   ABRIR CONVITE
========================================= */

botaoEntrar?.addEventListener(
  "click",
  async () => {
    document
      .querySelector(".intro")
      ?.scrollIntoView({
        behavior: "smooth"
      });

    if (
      audioConvite.src
    ) {
      try {
        audioConvite.volume = 0.3;

        await audioConvite.play();

        atualizarIconeMusica();
      } catch {
        console.log(
          "O navegador bloqueou a reprodução automática."
        );
      }
    }
  }
);


/* =========================================
   RSVP
========================================= */

function renderizarPessoas() {
  listaPessoas.innerHTML = "";

  convite.pessoas.forEach(
    (pessoa) => {
      const card =
        document.createElement("div");

      card.className =
        "pessoa-card";

      const inicial =
        pessoa.nome
          .trim()
          .charAt(0)
          .toUpperCase();

      card.innerHTML = `
        <div class="pessoa-info">

          <div class="pessoa-avatar">
            ${escaparHTML(inicial)}
          </div>

          <div>
            <strong>
              ${escaparHTML(pessoa.nome)}
            </strong>

            <span>
              ${textoStatus(pessoa.status)}
            </span>
          </div>

        </div>


        <div class="rsvp-acoes">

          <button
            type="button"
            class="sim ${
              pessoa.status === "confirmado"
                ? "ativo"
                : ""
            }"
            onclick="
              responderPresenca(
                '${pessoa.id}',
                'confirmado'
              )
            "
          >
            <i class="fa-regular fa-circle-check"></i>
            Vou
          </button>


          <button
            type="button"
            class="nao ${
              pessoa.status === "nao_vai"
                ? "ativo"
                : ""
            }"
            onclick="
              responderPresenca(
                '${pessoa.id}',
                'nao_vai'
              )
            "
          >
            <i class="fa-solid fa-xmark"></i>
            Não vou
          </button>

        </div>
      `;

      listaPessoas.appendChild(
        card
      );
    }
  );
}


window.responderPresenca =
  function (
    pessoaId,
    novoStatus
  ) {
    const indiceConvite =
      convites.findIndex(
        (item) =>
          item.id === convite.id
      );

    if (
      indiceConvite === -1
    ) {
      return;
    }

    const indicePessoa =
      convites[
        indiceConvite
      ].pessoas.findIndex(
        (pessoa) =>
          pessoa.id === pessoaId
      );

    if (
      indicePessoa === -1
    ) {
      return;
    }

    convites[
      indiceConvite
    ].pessoas[
      indicePessoa
    ].status =
      novoStatus;

    convite.pessoas[
      indicePessoa
    ].status =
      novoStatus;

    localStorage.setItem(
      "convitesCasamento",
      JSON.stringify(
        convites
      )
    );

    renderizarPessoas();

    if (
      novoStatus ===
      "confirmado"
    ) {
      mostrarToast(
        "Presença confirmada!"
      );
    } else {
      mostrarToast(
        "Resposta registrada."
      );
    }
  };


function textoStatus(status) {
  if (
    status === "confirmado"
  ) {
    return "Presença confirmada";
  }

  if (
    status === "nao_vai"
  ) {
    return "Não poderá comparecer";
  }

  return "Aguardando confirmação";
}


/* =========================================
   CONTAGEM REGRESSIVA
========================================= */

function atualizarContagem() {
  const casamento =
    new Date(
      "2027-03-06T17:00:00"
    );

  const agora =
    new Date();

  let diferenca =
    casamento - agora;

  if (
    diferenca < 0
  ) {
    diferenca = 0;
  }

  const dias =
    Math.floor(
      diferenca /
      86400000
    );

  const horas =
    Math.floor(
      (
        diferenca %
        86400000
      ) /
      3600000
    );

  const minutos =
    Math.floor(
      (
        diferenca %
        3600000
      ) /
      60000
    );

  const segundos =
    Math.floor(
      (
        diferenca %
        60000
      ) /
      1000
    );

  document.getElementById(
    "dias"
  ).textContent =
    formatarNumero(dias);

  document.getElementById(
    "horas"
  ).textContent =
    formatarNumero(horas);

  document.getElementById(
    "minutos"
  ).textContent =
    formatarNumero(minutos);

  document.getElementById(
    "segundos"
  ).textContent =
    formatarNumero(segundos);
}


function formatarNumero(numero) {
  return String(numero)
    .padStart(
      2,
      "0"
    );
}


atualizarContagem();

setInterval(
  atualizarContagem,
  1000
);


/* =========================================
   MUSICA
========================================= */

function configurarMusica() {
  const musica =
    convite.musica?.trim();

  if (!musica) {
    return;
  }

  audioConvite.src =
    musica;

  controleMusica.classList.add(
    "ativo"
  );
}


controleMusica?.addEventListener(
  "click",
  async () => {
    if (
      !audioConvite.src
    ) {
      return;
    }

    if (
      audioConvite.paused
    ) {
      try {
        audioConvite.volume = 0.3;

        await audioConvite.play();
      } catch {
        return;
      }
    } else {
      audioConvite.pause();
    }

    atualizarIconeMusica();
  }
);


audioConvite?.addEventListener(
  "play",
  atualizarIconeMusica
);


audioConvite?.addEventListener(
  "pause",
  atualizarIconeMusica
);


function atualizarIconeMusica() {
  if (
    audioConvite.paused
  ) {
    iconeMusica.className =
      "fa-solid fa-volume-xmark";
  } else {
    iconeMusica.className =
      "fa-solid fa-volume-high";
  }
}


/* =========================================
   RECADO
========================================= */

textoRecado?.addEventListener(
  "input",
  () => {
    contadorRecado.textContent =
      `${textoRecado.value.length} / 500`;
  }
);


document
  .getElementById(
    "formRecado"
  )
  ?.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();

      const texto =
        textoRecado.value.trim();

      if (!texto) {
        mostrarToast(
          "Escreva um recado primeiro."
        );

        return;
      }

      let recados =
        JSON.parse(
          localStorage.getItem(
            "recadosCasamento"
          )
        ) || [];

      recados.push({
        id:
          gerarId(),

        conviteId:
          convite.id,

        conviteNome:
          convite.nome,

        texto,

        criadoEm:
          new Date()
            .toISOString()
      });

      localStorage.setItem(
        "recadosCasamento",
        JSON.stringify(
          recados
        )
      );

      textoRecado.value = "";

      contadorRecado.textContent =
        "0 / 500";

      mostrarToast(
        "Recado enviado com carinho!"
      );
    }
  );


/* =========================================
   TOAST
========================================= */

let timeoutToast;


function mostrarToast(texto) {
  const toast =
    document.getElementById(
      "toast"
    );

  const toastTexto =
    document.getElementById(
      "toastTexto"
    );

  if (
    !toast ||
    !toastTexto
  ) {
    return;
  }

  toastTexto.textContent =
    texto;

  toast.classList.add(
    "ativo"
  );

  clearTimeout(
    timeoutToast
  );

  timeoutToast =
    setTimeout(
      () => {
        toast.classList.remove(
          "ativo"
        );
      },
      2500
    );
}


/* =========================================
   ID
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
   SEGURANCA
========================================= */

function escaparHTML(
  texto = ""
) {
  return String(texto)
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}
