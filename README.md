# Portfólio Luan — Site v5 para GitHub Pages

Este ZIP contém **somente o site publicado**. Não inclui o editor visual.

## Publicação
1. Extraia `portfolio-luan-v5-site.zip`.
2. Envie `index.html`, `css/`, `js/`, `assets/`, `data/` e `.nojekyll` à raiz do repositório GitHub Pages.
3. Em Settings > Pages, escolha `main` e `/ (root)`.
4. Confira o site no computador e celular e teste os links.

## Edição sem código
Use o arquivo **separado** `portfolio-luan-v5-editor.zip`. Extraia e abra `editor/index.html`, importe o ZIP *do site*, edite e exporte um novo ZIP *do site*, sem editor. Nunca publique a pasta `editor`.

## Áudio e animações
- O som só fica ativo depois que um MP3 é configurado e habilitado no editor. A reprodução é tentada automaticamente nas seções escolhidas. O único controle visível é **silenciar/reativar** no cabeçalho.
- Navegadores podem bloquear reprodução automática com som até o primeiro gesto do visitante. Nesse caso, o site tenta novamente após a interação, sem botão de início.
- Quando sai da região configurada, quando silencia ou reativa, a trilha reinicia no início na próxima execução.
- No desktop, há partículas em movimento, apresentação animada, janela de código flutuante e animações de interação. Respeita `prefers-reduced-motion`.

## Conteúdo
- Gestão de Obras (destaque) e Projeto Questões.
- `data/projetos.json`, `data/perfil.json` e `data/site.json` são mantidos sincronizados pelo editor, com `js/*-data.js` como fallback local.
- Ícones sociais e tecnológicos em `assets/icons/`.
- As capturas foram enviadas pelo autor e os nomes de clientes foram protegidos.

Não publique arquivos do programa Gestão de Obras, dados pessoais de clientes ou o editor.
