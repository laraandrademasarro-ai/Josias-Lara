(() => {
  const form = document.getElementById('formLoginFotos');
  const message = document.getElementById('loginFotosStatus');
  const account = document.getElementById('contaFotos');
  const logout = document.getElementById('sairFotos');
  const submit = document.getElementById('entrarFotos');
  const password = document.getElementById('senhaFotos');
  const settings = window.CASAMENTO_SUPABASE;
  let currentUser = null;
  let authBusy = false;

  function say(text, error = false) {
    message.textContent = text;
    message.classList.toggle('erro', error);
  }
  if (!settings || !window.supabase?.createClient) {
    submit.disabled = true;
    say('Não foi possível carregar a conexão. Confira sua internet e recarregue a página.', true);
    return;
  }

  const client = window.supabase.createClient(settings.url, settings.publishableKey, {
    auth: {
      storage: window.sessionStorage,
      storageKey: 'lara-josias-admin-auth',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    }
  });

  function sessionChanged(session) {
    const nextUser = session?.user?.id || null;
    const changed = nextUser !== currentUser;
    currentUser = nextUser;
    form.hidden = Boolean(nextUser);
    account.hidden = !nextUser;
    document.getElementById('emailContaFotos').textContent = session?.user?.email || '';
    if (changed || !window.CASAMENTO_FOTOS) {
      window.CASAMENTO_FOTOS = nextUser ? {
        client, bucket: settings.bucket, prefix: settings.prefix
      } : null;
    }
    if (nextUser) say('Login realizado. As permissões das fotos são verificadas pelo Supabase.');
    else say('Entre com o usuário administrador cadastrado no Supabase para salvar fotos.');
    if (changed) window.dispatchEvent(new Event('casamento:fotos-auth'));
  }

  // Não faz chamadas assíncronas ao Supabase dentro do callback de autenticação.
  client.auth.onAuthStateChange((_event, session) => {
    setTimeout(() => sessionChanged(session), 0);
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (authBusy) return;
    authBusy = true;
    submit.disabled = true;
    say('Entrando…');
    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: document.getElementById('emailFotos').value.trim(),
        password: password.value
      });
      if (error) throw error;
      sessionChanged(data.session);
    } catch (error) {
      say(error.code === 'invalid_credentials'
        ? 'E-mail ou senha incorretos. Use o usuário de Authentication → Users.'
        : error.code === 'email_not_confirmed'
          ? 'Confirme o e-mail desse usuário no Supabase antes de entrar.'
          : 'Não foi possível entrar. Confira a conexão e o usuário cadastrado no Supabase.', true);
    } finally {
      password.value = '';
      authBusy = false;
      submit.disabled = false;
    }
  });

  logout.addEventListener('click', async () => {
    if (authBusy || document.getElementById('fotos').getAttribute('aria-busy') === 'true') return;
    authBusy = true;
    logout.disabled = true;
    try {
      const { error } = await client.auth.signOut({ scope: 'local' });
      if (error) throw error;
      sessionChanged(null);
    } catch {
      say('Não foi possível sair. Confira a conexão e tente novamente.', true);
    } finally {
      authBusy = false;
      logout.disabled = false;
    }
  });
})();
