# Lara & Josias — configuração do Supabase

Os arquivos já usam a URL e a chave pública fornecidas em supabase-config.js.
O bucket é privado, casamento-fotos, com a pasta lara-josias.

## Finalizar no painel do Supabase

O primeiro SQL das fotos e o administrador já foram criados, conforme informado.

1. No SQL Editor, cole supabase/02-convites-privados.sql. Troque SEU_EMAIL_AQUI pelo mesmo administrador do primeiro SQL e execute.
2. Em Edge Functions, crie uma função pelo editor chamada convite-privado. Substitua index.ts pelo conteúdo de supabase/functions/convite-privado/index.ts e faça o deploy.
3. Nas configurações dessa função, desative Verify JWT (verificação de JWT legado). A função valida o código aleatório do convite antes de consultar os dados e as fotos. As chaves de servidor vêm do ambiente do Supabase; nunca copie chaves secretas para o site.

Documentação: https://supabase.com/docs/guides/functions/quickstart-dashboard e https://supabase.com/docs/guides/functions/function-configuration

## Usar o Admin

Abra admin.html pelo servidor local que você já utiliza, por exemplo o Live Server do VS Code. Mantenha o mesmo endereço/porta para acessar os convites existentes nesse navegador.

Em Fotos, entre com o e-mail e a senha de Authentication → Users. Escolha as fotos e clique em Salvar foto. Atualizar fotos busca as imagens já salvas e renova as prévias. A sessão fica no armazenamento da aba. Fotos e URLs temporárias não são gravadas no localStorage. O login protege as operações do Supabase; o cadastro local do Admin mantém seu comportamento anterior.

## Links dos convidados

Depois do SQL complementar, entre no Admin e clique em Copiar link em Convites. Isso sincroniza aquele convite e gera o link com ?c=slug#acesso=codigo. O slug permanece igual; cada convite possui um código aleatório de 256 bits. O banco guarda somente seu hash SHA-256. O código original fica no cadastro local do administrador.

Ao editar um convite já sincronizado, o Admin tenta atualizar a cópia online. Se falhar, ele avisa: entre novamente e use Copiar link para sincronizar antes de compartilhar.

O link completo é a credencial: quem o receber ou a quem ele for encaminhado poderá abrir aquele convite. Isso valida a posse do link, não a identidade civil do destinatário. Os convidados não precisam de conta nem senha. O slug sozinho não libera as fotos. Links antigos sem código continuam servindo apenas à prévia local existente.

Links de localhost só funcionam nesse computador. O site precisa estar hospedado para outros dispositivos. Não houve publicação do site nesta tarefa.

A função valida o slug e o código no servidor, retorna apenas aquele convite e assina as URLs das fotos por 10 minutos. O navegador renova a validação após 8 minutos. Trajes são enviados somente para convites do tipo padrinhos. A sessão do administrador nunca é carregada pelo convite público.

Excluir um convite sincronizado primeiro revoga o registro no Supabase; se a revogação não for confirmada, ele permanece no Admin. URLs de imagens já emitidas podem durar até 10 minutos, e imagens já baixadas não podem ser recolhidas. Não apague os dados locais do administrador: os códigos originais não podem ser recuperados dos hashes.

## Limites atuais

RSVP e recados mantêm o armazenamento local original: ainda não sincronizam as respostas dos convidados com o painel do casal. Esta integração sincroniza a leitura do convite e as fotos. Presentes e outras áreas demonstrativas continuam como estavam.

As permissões SQL são restritas ao administrador especificado. Políticas amplas preexistentes no projeto precisam ser revisadas pelo proprietário.

## Backup e validação

Backup anterior à integração: backups/supabase-20260924-203310.
Testes em validacao-admin usam autenticação, banco e Storage simulados. Verificam navegação, slug, prévias, upload/troca/remoção, login/logout, links protegidos, tokens inválidos/revogados, acesso sem dados locais e layout mobile.
O SQL e o envio autenticado no projeto real dependem da instalação acima e do seu login.

## Nome da função no projeto atual

A função foi criada no painel como smooth-processor. O site usa esse nome em supabase-config.js (functionName). Publique as atualizações e desative Verify JWT nessa função. O arquivo local supabase/functions/convite-privado/index.ts continua sendo a fonte do código; o nome do arquivo não define o endereço da função no painel.
