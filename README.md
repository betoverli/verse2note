# Verse2Note

Picker de referências bíblicas. Escolha livro, capítulo e versos; copie um texto rico com deep link para o app de Bíblia (YouVersion, Logos, Tecarta e outros). Coleções por tema. Planos de leitura de capítulos inteiros.

Live: [verse2note.com](https://verse2note.com)

Português, English, Español. PWA offline. Conta opcional (Google, X ou e-mail).

## Local

```bash
npm install
npm run dev
```

Abre em `http://localhost:8080`.

## Stack

TanStack Start, React, Tailwind v4. Persistência no aparelho (`localStorage`).

## App iOS

O site continua a ser o site. O app de iPhone é uma capa nativa (Capacitor) cuja janela abre `https://verse2note.com`. Ícone, ecrã de abertura, avisos da Apple, folha de partilha e abertura da Bíblia (YouVersion e outras) são nativos. O login com Google ou X abre o navegador do sistema e volta para o app, porque a Apple e o Google recusam esse login dentro da janela embutida. E-mail e senha continuam na janela do app.

Quem usa o site no navegador não vê diferença. As funções nativas só acordam dentro do app.

Não é preciso um Mac para o dia a dia. O GitHub Actions compila num Mac da nuvem.

### O endereço é http ou https?

`http://verse2note.com` já responde com um redirecionamento para `https://verse2note.com` e o site pede HTTPS aos navegadores (HSTS). O app abre o endereço **https**.

Não há exceção de rede insegura no app, de propósito. A Apple bloqueia sites `http://` dentro do app, e o cookie de sessão (`__Host-…`, marcado como seguro) nem sequer é gravado em HTTP. Se alguém apontar o app para um endereço `http://`, o login deixa de funcionar. Não mude isso.

### O que já corre sem conta de programador Apple

Em cada pull request, o fluxo **iOS** compila o app para o simulador **sem assinatura**. Isso prova que o projeto abre. Não instala no iPhone e não envia avisos.

### Quando a conta Apple Developer estiver paga

A conta custa cerca de 99 dólares por ano, em [developer.apple.com](https://developer.apple.com). Sem ela não há TestFlight nem App Store, e os avisos nativos não saem do aparelho.

O identificador do app é `com.verse2note.app`. Use esse nome em todo o lado. A versão visível está em `ios/App/App.xcodeproj/project.pbxproj` (`MARKETING_VERSION`, hoje `1.0`). O número de build do TestFlight sobe sozinho a cada envio.

#### 1. No site da Apple

1. Em Certificates, Identifiers & Profiles, crie um App ID `com.verse2note.app` e marque **Push Notifications**.
2. Crie uma chave **Apple Push Notifications service (APNs)**. Transfira o ficheiro `.p8` uma única vez. Anote o Key ID e o Team ID (10 letras/números).
3. Crie um certificado **Apple Distribution**, exporte-o do Porta-chaves como `.p12` com uma senha, e passe a Base64:
   `base64 -i certificado.p12 | pbcopy` (num Mac) ou peça a alguém com Mac. Guarde a senha.
4. Crie um perfil de provisionamento **App Store** para esse App ID, com esse certificado. Transfira o `.mobileprovision` e passe a Base64 da mesma forma.
5. Em Users and Access → Integrations, crie uma chave de API do App Store Connect com acesso de desenvolvedor. Transfira o `.p8`. Anote o Issuer ID e o Key ID (é outra chave, diferente da de avisos).
6. Em App Store Connect, crie a ficha do app Verse2Note com o mesmo identificador.

#### 2. Segredos no GitHub (compilação e TestFlight)

No repositório: Settings → Secrets and variables → Actions → New repository secret.

| Nome | O que é |
| --- | --- |
| `APPLE_TEAM_ID` | Team ID, 10 caracteres |
| `APP_STORE_CONNECT_ISSUER_ID` | Issuer ID da chave de API |
| `APP_STORE_CONNECT_KEY_ID` | Key ID da chave de API (não a de avisos) |
| `APP_STORE_CONNECT_PRIVATE_KEY` | Conteúdo do `.p8` da API, ou o mesmo ficheiro em Base64 |
| `IOS_DISTRIBUTION_CERTIFICATE_P12_BASE64` | O `.p12` em Base64 |
| `IOS_DISTRIBUTION_CERTIFICATE_PASSWORD` | Senha desse `.p12` |
| `IOS_PROVISIONING_PROFILE_BASE64` | O `.mobileprovision` em Base64 |

Quando os sete existirem: Actions → **iOS** → Run workflow → marque **Enviar ao TestFlight**. Sem os segredos, esse passo recusa e não envia nada. O build do simulador não precisa deles.

#### 3. Variáveis no servidor (para os avisos saírem)

O envio do aviso fica no site, ao lado dos avisos que o navegador já recebe. Na Vercel (ou onde o site corre), acrescente:

| Nome | O que é |
| --- | --- |
| `APNS_KEY_ID` | Key ID da chave de avisos |
| `APNS_TEAM_ID` | O mesmo Team ID |
| `APNS_PRIVATE_KEY` | Conteúdo do `.p8` de avisos. Se a quebra de linha desaparecer, troque cada quebra por `\n` |
| `APNS_TOPIC` | Opcional. Por omissão `com.verse2note.app` |
| `APNS_ENVIRONMENT` | Opcional. `production` para TestFlight e App Store. `sandbox` só para um app instalado pelo Xcode em modo de desenvolvimento |

Sem estas variáveis o site continua igual e os avisos do navegador continuam. Os avisos do iPhone só passam a sair depois disto **e** de publicar esta versão do site.

#### 4. Publicar o site

O app mostra o site que está no ar. Ícone e ecrã de abertura já vêm no app. Partilha nativa, avisos e o login pelo navegador do sistema passam a funcionar quando esta versão estiver em verse2note.com.

### Desenvolvimento

```bash
npm run ios:check
npm run ios:sync
```

`ios:sync` copia a configuração para o projeto Xcode. Para apontar o app a outro site HTTPS durante um teste: `CAPACITOR_SERVER_URL=https://exemplo.com npm run ios:sync`. Não use `http://`.

## API / agentes

- Docs: [/for-ai](https://verse2note.com/for-ai)
- `GET /api/link?ref=João+3:16`
- `GET /api/collections?id=salvation`
- `GET /api/plans?id=gospels-30&day=1`
- Skill: [/skill.md](https://verse2note.com/skill.md)
- MCP: `POST /api/mcp` (`verse2note_link`, `verse2note_collection`, `verse2note_plan`)
- LLMs: [/llms.txt](https://verse2note.com/llms.txt)
- Sitemap: [/sitemap.xml](https://verse2note.com/sitemap.xml)
