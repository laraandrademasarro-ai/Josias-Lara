(() => {
  const root = document.getElementById('presentes');
  const form = document.getElementById('formPresente');
  const status = document.getElementById('presentesStatus');
  const grid = document.getElementById('listaPresentes');
  const file = document.getElementById('fotoPresente');
  const preview = document.getElementById('previaPresente');
  let rows = [], editing = null, busy = false, draftURL = null, generation = 0;
  const say = text => { status.textContent = text; document.getElementById('presenteFormStatus').textContent = text; };
  const config = () => { const c = window.CASAMENTO_FOTOS; if (!c) throw new Error('Entre em Fotos com o administrador para cadastrar presentes.'); return c; };
  function lock(value) {
    busy = value; root.setAttribute('aria-busy', String(value));
    form.querySelectorAll('input, textarea, button').forEach(el => el.disabled = value);
    grid.querySelectorAll('button').forEach(el => el.disabled = value);
    document.getElementById('novoPresente').disabled = value;
    document.getElementById('atualizarPresentes').disabled = value;
  }
  function release() { if (draftURL) URL.revokeObjectURL(draftURL); draftURL = null; }
  function open(row = null) {
    if (busy) return;
    editing = row; form.reset(); release(); preview.hidden = true; preview.removeAttribute('src');
    document.getElementById('tituloPresente').textContent = row ? 'Editar presente' : 'Adicionar presente';
    document.getElementById('nomePresente').value = row?.nome || '';
    document.getElementById('descricaoPresente').value = row?.descricao || '';
    file.required = !row;
    if (row?.url) { preview.src = row.url; preview.hidden = false; }
    document.getElementById('presenteFormStatus').textContent = '';
    abrirModal('modalPresente');
  }
  function render() {
    grid.replaceChildren();
    if (!rows.length) { const p = document.createElement('p'); p.textContent = 'Nenhum presente carregado.'; grid.append(p); }
    for (const row of rows) {
      const card = document.createElement('article'); card.className = 'presente-card';
      if (row.url) { const img = document.createElement('img'); img.src = row.url; img.alt = row.nome; card.append(img); }
      const title = document.createElement('h3'); title.textContent = row.nome;
      const description = document.createElement('p'); description.textContent = row.descricao;
      card.append(title, description);
      const reservation = document.createElement('p');
      reservation.textContent = row.reservado_por ? 'Reservado por: ' + (row.reserva_nome || 'convidado') : 'Disponível';
      card.append(reservation);
      for (const [label, action] of [['Editar', () => open(row)], ['Excluir', () => remove(row)]]) {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'botao-secundario'; button.textContent = label; button.disabled = busy; button.onclick = action; card.append(button);
      }
      grid.append(card);
    }
  }
  async function load() {
    if (busy) return;
    const revision = ++generation;
    try {
      const c = config(); lock(true); say('Carregando presentes…');
      const data = [];
      for (let start = 0; ; start += 100) {
        const result = await c.client.from('casamento_presentes').select('*').order('criado_em', { ascending: true }).order('id').range(start, start + 99);
        if (result.error) throw new Error('Não foi possível carregar os presentes. Execute o SQL dos presentes e confira suas permissões.');
        data.push(...result.data); if (result.data.length < 100) break;
      }
      for (const row of data) {
        const signed = await c.client.storage.from(c.bucket).createSignedUrl(row.foto_path, 3600);
        row.url = signed.data?.signedUrl || null;
      }
      const ids = [...new Set(data.map(row => row.reservado_por).filter(Boolean))];
      for (let start = 0; start < ids.length; start += 100) {
        const invites = await c.client.from('casamento_convites_privados').select('id,dados').in('id', ids.slice(start, start + 100));
        if (!invites.error) for (const row of data) {
          const invite = invites.data.find(item => item.id === row.reservado_por);
          if (invite) row.reserva_nome = invite.dados.nome;
        }
      }
      if (revision !== generation) return;
      rows = data; render(); say('Presentes atualizados.');
    } catch (error) { if (revision === generation) say(error.message); }
    finally { lock(false); }
  }
  file.addEventListener('change', () => {
    release(); preview.hidden = true;
    if (file.files[0]) { draftURL = URL.createObjectURL(file.files[0]); preview.src = draftURL; preview.hidden = false; }
  });
  form.addEventListener('submit', async event => {
    event.preventDefault(); if (busy) return;
    let c, path, committed = false;
    const old = editing;
    try {
      c = config();
      const nome = document.getElementById('nomePresente').value.trim();
      const descricao = document.getElementById('descricaoPresente').value.trim();
      if (!nome || !descricao) throw new Error('Informe o nome e a descrição.');
      const image = file.files[0];
      if (!image && !old) throw new Error('Escolha uma foto para o presente.');
      lock(true); say('Salvando presente…');
      if (image) {
        const ext = {'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[image.type];
        if (!ext || !image.size || image.size > 6*1024*1024) throw new Error('Use JPG, PNG ou WebP de até 6 MB.');
        const url = URL.createObjectURL(image);
        try { const test = new Image(); test.src = url; await test.decode(); } catch { throw new Error('O arquivo não é uma imagem válida.'); } finally { URL.revokeObjectURL(url); }
        path = c.prefix + '/presentes/' + crypto.randomUUID() + '.' + ext;
        const uploaded = await c.client.storage.from(c.bucket).upload(path, image, { contentType:image.type, upsert:false });
        if (uploaded.error) { path = null; throw new Error('Não foi possível enviar a foto. Confira as permissões do administrador.'); }
      }
      const payload = { nome, descricao, foto_path:path || old.foto_path };
      const table = c.client.from('casamento_presentes');
      const result = old ? await table.update(payload).eq('id', old.id).select('id') : await table.insert(payload).select('id');
      if (result.error || !result.data?.length) throw new Error('Não foi possível salvar o cadastro. Execute o SQL dos presentes e confira suas permissões.');
      committed = true;
      let cleanupWarning = '';
      if (old && path) {
        try { const removed = await c.client.storage.from(c.bucket).remove([old.foto_path]); if (removed.error) throw removed.error; }
        catch { cleanupWarning = ' A foto anterior permaneceu no Storage; confira a permissão de exclusão.'; }
      }
      fecharModal('modalPresente'); release(); form.reset(); lock(false);
      await load(); say('Presente salvo no Supabase.' + cleanupWarning);
    } catch (error) {
      let warning = '';
      if (path && !committed) {
        try { const removed = await c.client.storage.from(c.bucket).remove([path]); if (removed.error) throw removed.error; }
        catch { warning = ' A foto enviada permaneceu no Storage em ' + path + '.'; }
      }
      say(error.message + warning);
    } finally { lock(false); }
  });
  async function remove(row) {
    if (busy || !confirm('Excluir o presente "' + row.nome + '"?')) return;
    try {
      const c = config(); lock(true);
      const result = await c.client.from('casamento_presentes').delete().eq('id', row.id).select('id');
      if (result.error || !result.data?.length) throw new Error('Exclusão não confirmada. Confira suas permissões.');
      let warning = '';
      try { const removed = await c.client.storage.from(c.bucket).remove([row.foto_path]); if (removed.error) throw removed.error; }
      catch { warning = ' A foto permaneceu no Storage; confira a permissão de exclusão.'; }
      lock(false); await load(); say('Presente excluído.' + warning);
    } catch (error) { say(error.message); }
    finally { lock(false); }
  }
  document.getElementById('novoPresente').onclick = () => open();
  document.getElementById('atualizarPresentes').onclick = load;
  window.addEventListener('casamento:fotos-auth', () => {
    generation++; rows = []; render();
    if (!window.CASAMENTO_FOTOS) { release(); preview.hidden = true; form.reset(); fecharModal('modalPresente'); say('Entre em Fotos com o administrador para cadastrar presentes.'); }
    else load();
  });
  render(); say('Entre em Fotos com o administrador e clique em Atualizar presentes.');
})();
