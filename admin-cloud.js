(() => {
  function client() {
    const current = window.CASAMENTO_FOTOS?.client;
    if (!current) throw new Error('Entre em Fotos com o administrador antes de gerar ou atualizar links protegidos.');
    return current;
  }
  const inflight = new Map();
  window.publicarConviteProtegido = function(convite) {
    const previous = inflight.get(convite.id);
    const task = (async () => {
      if (previous) await previous.catch(() => {});
      const supabase = client();
      const found=await supabase.from('casamento_convites_privados').select('id,slug,token_hash,acesso_admin').eq('id',convite.id).maybeSingle();
      if(found.error) throw Error('Confira o login do administrador e o SQL 10.');
      if(found.data?.acesso_admin) convite.acessoFotos=found.data.acesso_admin;
      if(found.data && !convite.acessoFotos) throw Error('Compartilhe este convite pelo navegador que gerou o link original.');
      if (!convite.acessoFotos) {
        const bytes = crypto.getRandomValues(new Uint8Array(32));
        convite.acessoFotos = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
        salvarConvites();
      }
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(convite.acessoFotos));
      const token_hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
      if(found.data && found.data.token_hash !== token_hash) throw Error('A chave deste navegador não corresponde ao link original. Nenhum link foi alterado.');
      const dados = {
        id: convite.id, slug: convite.slug, nome: convite.nome, tipo: convite.tipo,
        mensagem: convite.mensagem || '', musica: convite.musica || '', pessoas: convite.pessoas
      };
      const originalSlug = convite.slug;
      let candidate = originalSlug;
      let error;
      let checkedNew = false;
      for (let attempt = 0; attempt < 100; attempt++) {
        ({ error } = await supabase.from('casamento_convites_privados').upsert({
          id: convite.id, slug: candidate, token_hash, no_painel:true, acesso_admin:convite.acessoFotos, dados: { ...dados, slug: candidate }, atualizado_em: new Date().toISOString()
        }, { onConflict: 'id' }));
        if (!error) {
          if (candidate !== originalSlug) {
            convite.slug = candidate;
            salvarConvites();
            if (typeof atualizarTudo === 'function') atualizarTudo();
          }
          break;
        }
        if (error.code !== '23505' || !error.message?.includes('casamento_convites_privados_slug_key')) break;
        if (!checkedNew) {
          const existing = await supabase.from('casamento_convites_privados').select('id,slug').eq('id', convite.id).maybeSingle();
          if (existing.error) { error = existing.error; break; }
          // Só atribui outro endereço a um cadastro que ainda não existe no servidor.
          if (existing.data) break;
          checkedNew = true;
        }
        candidate = originalSlug + '-' + (attempt + 2);
        // Evita também colisões com os outros cadastros deste navegador.
        while (typeof convites !== 'undefined' && convites.some(item => item.id !== convite.id && item.slug === candidate)) {
          candidate += '-2';
        }
      }
      if (error) {
        // A mensagem anterior escondia também conflitos de nomes e falhas de conexão.
        // Não inclui details: esse campo pode conter o hash do código de acesso.
        const code = error.code ? ` (${error.code})` : '';
        const reason = error.message || 'O Supabase não informou o motivo.';
        throw new Error(`Não foi possível sincronizar o convite${code}.\n\n${reason}`);
      }
      convite._online=true; salvarConvites();
      return convite.acessoFotos;
    })();
    inflight.set(convite.id, task);
    task.finally(() => { if (inflight.get(convite.id) === task) inflight.delete(convite.id); }).catch(() => {});
    return task;
  };
  window.revogarConviteProtegido = async function(convite) {
    if (!convite.acessoFotos) return;
    const pending = inflight.get(convite.id);
    if (pending) await pending;
    const { data, error } = await client().from('casamento_convites_privados').delete().eq('id', convite.id).select('id');
    if (error || !data?.length) throw new Error('Não foi possível confirmar a revogação do link. O convite foi mantido; confira a conexão e suas permissões.');
  };
})();
(() => {
  const notice=document.getElementById('listaOnlineStatus');
  const read=document.getElementById('lerListaOnline'), share=document.getElementById('compartilharLocais');
  let revision=0;
  async function load(){
    const n=++revision, cfg=window.CASAMENTO_FOTOS;
    if(!cfg){convites=convites.filter(c=>!c._online);atualizarTudo();read.disabled=share.disabled=true;notice.textContent='Entre em Fotos como administrador para acessar a lista compartilhada.';return;}
    read.disabled=share.disabled=true;
    try{
      const cloud=[];
      for(let i=0;;i+=100){
        const {data,error}=await cfg.client.from('casamento_convites_privados').select('id,slug,dados,acesso_admin').eq('no_painel',true).order('id').range(i,i+99);
        if(error)throw error;
        cloud.push(...data);if(data.length<100)break;
      }
      if(n!==revision || cfg!==window.CASAMENTO_FOTOS)return;
      const ids=new Set(cloud.map(c=>c.id));
      const drafts=convites.filter(c=>!c._online && !ids.has(c.id));
      convites=[...drafts,...cloud.map(c=>({...c.dados,id:c.id,slug:c.slug,acessoFotos:c.acesso_admin,_online:true}))];
      salvarConvites();atualizarTudo();
      notice.textContent=cloud.length+' convite(s) compartilhado(s).'+(drafts.length?' Apenas neste navegador: '+drafts.length+'. Use Compartilhar para incluí-los.':'');
    } catch{if(n===revision)notice.textContent='Não foi possível carregar a lista. Confira o login e o SQL 10. Os dados locais não foram removidos.';}
    finally{if(n===revision)read.disabled=share.disabled=false;}
  }
  share.onclick=async()=>{
    const cfg=window.CASAMENTO_FOTOS;if(!cfg)return;
    const drafts=convites.filter(c=>!c._online);if(!drafts.length){await load();return;}
    if(!confirm('Compartilhar '+drafts.length+' convite(s) deste navegador com os demais administradores?'))return;
    read.disabled=share.disabled=true;
    let err='';
    for(const c of drafts){
      if(cfg!==window.CASAMENTO_FOTOS)break;
      try{await window.publicarConviteProtegido(c);}catch(e){err=e.message;break;}
    }
    await load();if(err)notice.textContent+=' '+err;
  };
  read.onclick=load;
  window.addEventListener('casamento:fotos-auth',load);
  load();
})();
