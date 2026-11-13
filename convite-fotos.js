(() => {
  const settings = window.CASAMENTO_SUPABASE;
  const token = new URLSearchParams(location.hash.slice(1)).get('acesso');
  const slug = new URLSearchParams(location.search).get('c');
  window.temAcessoConvite = Boolean(token);
  let timer;
  let reservando = false;

  function tituloOpcao(g) {
    if (g.inteiro) return g.minha_reserva ? 'Cancelar reserva do presente inteiro' : g.reservado ? 'Presente inteiro já reservado' : 'Dar o presente inteiro';
    if (g.cota_ilimitada) return g.minha_reserva ? 'Cancelar minha cota' : 'Contribuir com uma cota';
    return g.minha_reserva ? 'Cancelar minha reserva' : g.reservado ? 'Já reservado' : 'Escolher este presente';
  }
  function statusOpcao(g) {
    if (g.inteiro) return g.minha_reserva ? 'Vocês escolheram o presente inteiro.' : g.reservado ? 'O presente inteiro já foi escolhido.' : 'Presente inteiro disponível.';
    if (g.cota_ilimitada) return g.minha_reserva ? 'Vocês escolheram uma cota.' : 'Cotas ilimitadas: todos podem participar.';
    return g.minha_reserva ? 'Reservado por vocês' : g.reservado ? 'Este presente já foi escolhido.' : 'Disponível para escolher';
  }
  function adicionarOpcao(card, g) {
    const label = document.createElement('p'); label.className = 'reserva-status'; label.setAttribute('role','status'); label.textContent = statusOpcao(g);
    const button = document.createElement('button'); button.className = 'presente-reservar'; button.type='button'; button.textContent=tituloOpcao(g);
    button.disabled = Boolean(g.reservado && !g.minha_reserva); button.onclick=()=>escolherPresente(g,button,label); card.append(label,button);
  }
  async function escolherPresente(gift, button, label) {
    if (reservando) return;
    const cancelar = gift.minha_reserva;
    const opcao = gift.inteiro ? 'o presente inteiro' : gift.cota_ilimitada ? 'uma cota' : 'o presente';
    if (!confirm((cancelar ? 'Cancelar sua escolha' : 'Escolher ' + opcao) + ': ' + gift.nome + '?')) return;
    reservando = true;
    button.disabled = true;
    label.textContent = 'Salvando sua escolha…';
    try {
      const response = await fetch(`${settings.url}/functions/v1/${settings.functionName}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', apikey: settings.publishableKey },
        body: JSON.stringify({ slug, token, action: (cancelar ? 'cancelar' : 'reservar') + (gift.inteiro ? '_inteiro' : ''), presenteId: gift.id }),
        cache: 'no-store', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(20000)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        if (response.status === 409) { gift.reservado = true; gift.minha_reserva = false; }
        throw new Error(result.error || 'Não foi possível confirmar a reserva. Tente novamente.');
      }
      gift.reservado = result.reservado;
      gift.minha_reserva = result.minha_reserva;
      label.textContent = statusOpcao(gift);
    } catch (error) {
      label.textContent = error.name === 'TimeoutError' || error.name === 'TypeError'
        ? 'Não foi possível confirmar. Tente novamente ou recarregue a lista para conferir sua reserva.' : error.message;
    } finally {
      reservando = false;
      button.disabled = gift.reservado && !gift.minha_reserva;
      button.textContent = tituloOpcao(gift);
    }
  }
  window.addEventListener('hashchange', () => location.reload());

  function image(url, alt) {
    const parsed = new URL(url);
    if (parsed.origin !== settings.url || !parsed.pathname.startsWith('/storage/v1/object/sign/casamento-fotos/')) {
      throw new Error('Endereço de foto inválido.');
    }
    const img = document.createElement('img');
    img.src = url;
    img.alt = alt;
    img.loading = 'lazy';
    img.referrerPolicy = 'no-referrer';
    img.className = 'foto-salva-convite';
    return img;
  }
  function render(fotos) {
    for (const [key, selector, alt] of [
      ['capa', '.intro-foto .foto-principal', 'Lara e Josias'],
      ['destaque', '.foto-frase-imagem .foto-horizontal', 'Uma lembrança de Lara e Josias']
    ]) {
      const container = document.querySelector(selector);
      container.replaceChildren();
      if (fotos[key]?.[0]) container.append(image(fotos[key][0], alt));
    }
    for (const key of ['madrinhas', 'padrinhos']) {
      const reference = document.getElementById(key === 'madrinhas' ? 'imagemMadrinhas' : 'imagemPadrinhos');
      if (!reference) continue; // O manual agora usa as artes completas do Canva.
      const container = reference.parentElement;
      if (fotos[key]?.[0]) {
        const img = image(fotos[key][0], `Referência de traje para ${key}`);
        img.id = key === 'madrinhas' ? 'imagemMadrinhas' : 'imagemPadrinhos';
        container.replaceChildren(img);
      } else {
        const img = document.getElementById(key === 'madrinhas' ? 'imagemMadrinhas' : 'imagemPadrinhos');
        img.removeAttribute('src');
        img.hidden = true;
      }
    }
    const gallery = document.querySelector('.galeria');
    gallery.replaceChildren();
    (fotos.galeria || []).forEach((url, index) => {
      const item = document.createElement('div');
      item.className = 'galeria-item';
      item.append(image(url, `Momento ${index + 1} de Lara e Josias`));
      gallery.append(item);
    });
    document.querySelector('.galeria-secao').hidden = !gallery.children.length;
  }
  window.carregarConvitePrivado = async function() {
    if (!token || !/^[0-9a-f]{64}$/.test(token) || !slug) throw new Error('Use o link completo recebido dos noivos.');
    const response = await fetch(`${settings.url}/functions/v1/${settings.functionName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: settings.publishableKey },
      body: JSON.stringify({ slug, token }),
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
      signal: AbortSignal.timeout(20000)
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const messages = {
        404: `A abertura dos convites ainda não foi ativada. Publique a função ${settings.functionName} no Supabase deste projeto.`,
        401: `A configuração de acesso precisa ser concluída: desative Verify JWT na função ${settings.functionName} do Supabase.`,
        403: 'Este link está incompleto ou seu acesso foi revogado. Peça um novo link aos noivos.'
      };
      throw new Error(messages[response.status] || 'Não foi possível carregar o convite. Tente novamente em instantes.');
    }
    if (!payload.convite || !Array.isArray(payload.convite.pessoas) || !payload.fotos) throw new Error('Resposta inválida.');
    render(payload.fotos);
    const box = document.getElementById('pixConvite');
    const key = typeof payload.pix === 'string' ? payload.pix.trim() : '';
    box.hidden = !key;
    const titular = document.getElementById('pixTitular');
    titular.textContent = key && payload.pixTitular ? 'Titular: ' + payload.pixTitular : '';
    titular.hidden = !titular.textContent;
    document.getElementById('pixValor').textContent = key;
    document.getElementById('pixCopiaStatus').textContent = '';
    document.getElementById('copiarPix').onclick = async () => {
      try {
        await navigator.clipboard.writeText(key);
        document.getElementById('pixCopiaStatus').textContent = 'Chave Pix copiada.';
      } catch { document.getElementById('pixCopiaStatus').textContent = 'Selecione a chave acima e copie manualmente.'; }
    };
    const gifts = document.getElementById('presentesConvite');
    gifts.replaceChildren();
    document.getElementById('presentesConviteStatus').textContent = payload.presentes == null
      ? 'A lista de presentes estará disponível em breve.'
      : payload.presentes.length ? '' : 'Em breve compartilharemos nossa lista de presentes.';
    for (const gift of payload.presentes || []) {
      const card = document.createElement('article'); card.className = 'presente-convite';
      if (gift.foto_url) card.append(image(gift.foto_url, gift.nome));
      const name = document.createElement('h3'); name.textContent = gift.nome;
      const description = document.createElement('p'); description.textContent = gift.descricao;
      card.append(name, description);
      adicionarOpcao(card, gift);
      if (gift.cota_ilimitada && typeof gift.inteiro_reservado === 'boolean') {
        adicionarOpcao(card, {id:gift.id, nome:gift.nome, inteiro:true, reservado:gift.inteiro_reservado, minha_reserva:gift.meu_inteiro});
      }
      gifts.append(card);
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      window.carregarConvitePrivado().catch(() => {
        // Remove fotos e conteúdo quando não é possível renovar o acesso.
        document.querySelectorAll('.foto-salva-convite').forEach(img => img.remove());
        document.getElementById('siteConvite').classList.remove('ativo');
        const error = document.getElementById('conviteErro');
        error.classList.add('ativo');
        error.querySelector('h1').textContent = 'Verifique seu acesso';
        error.querySelector('p').textContent = 'Recarregue a página para validar seu convite novamente.';
      });
    }, 8 * 60 * 1000);
    return payload.convite;
  };
})();
