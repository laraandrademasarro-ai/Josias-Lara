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
      if (!convite.acessoFotos) {
        const bytes = crypto.getRandomValues(new Uint8Array(32));
        convite.acessoFotos = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
        salvarConvites();
      }
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(convite.acessoFotos));
      const token_hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
      const dados = {
        id: convite.id, slug: convite.slug, nome: convite.nome, tipo: convite.tipo,
        mensagem: convite.mensagem || '', musica: convite.musica || '', pessoas: convite.pessoas
      };
      const { error } = await supabase.from('casamento_convites_privados').upsert({
        id: convite.id, slug: convite.slug, token_hash, dados, atualizado_em: new Date().toISOString()
      }, { onConflict: 'id' });
      if (error) {
        // A mensagem anterior escondia também conflitos de nomes e falhas de conexão.
        // Não inclui details: esse campo pode conter o hash do código de acesso.
        const code = error.code ? ` (${error.code})` : '';
        const reason = error.message || 'O Supabase não informou o motivo.';
        throw new Error(`Não foi possível sincronizar o convite${code}.\n\n${reason}`);
      }
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
