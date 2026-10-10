(() => {
  const settings = window.CASAMENTO_SUPABASE;
  const token = new URLSearchParams(location.hash.slice(1)).get('acesso');
  const slug = new URLSearchParams(location.search).get('c');
  window.temAcessoConvite = Boolean(token);
  let timer;
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
      card.append(name, description); gifts.append(card);
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
