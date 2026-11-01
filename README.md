# Aurora App — Frontend (Expo + React Native + TypeScript)

App mobile/web que consome a API do backend (`/v1`: auth, social, `users/me`).

## Rodar com um comando (Docker)

```bash
cp .env.example .env      # ajuste HOST_IP e EXPO_PUBLIC_API_URL se for usar no celular
docker compose up --build
```

- **Navegador:** http://localhost:8081
- **Celular:** instale o Expo Go, ligue na mesma rede Wi-Fi e leia o QR dos logs (precisa de `HOST_IP` no `.env`).
- O backend deve estar rodando (`docker compose up` no repo do backend, porta 3333).
  Para testar na web, inclua `http://localhost:8081` em `CORS_ORIGINS` do backend.

### URL da API
| Onde o app roda | `EXPO_PUBLIC_API_URL` |
|---|---|
| Navegador / iOS Simulator | `http://localhost:3333` |
| Emulador Android | `http://localhost:3333` (convertido automaticamente para `10.0.2.2`) |
| Celular físico | `http://<IP-do-PC>:3333` |

Variáveis `EXPO_PUBLIC_*` são embutidas no bundle: **são públicas**. Nunca coloque segredos nelas.

## Sem Docker
```bash
npm ci && npm start     # npm run typecheck | npm test
```

## Arquitetura (camadas)
```
app/                     rotas (expo-router) — só telas finas
src/presentation/        UI: componentes, AuthProvider (estado), login social
src/application/         SessionManager (tokens + refresh single-flight), container (injeção)
src/infra/               HttpClient (fetch, timeout, retry em 401), APIs, storage seguro
src/domain/              tipos e validações (sem dependência de React/rede)
src/config/              leitura de env / resolução da URL da API
```

## Funcionalidades
- Login e-mail/senha, cadastro (nome, e-mail, telefone, endereço), perfil com edição, logout.
- Botões Google e Facebook (desabilitados até configurar os IDs públicos).
- Tokens no **expo-secure-store** (Keychain/Keystore). Na **web ficam só em memória** (sem armazenamento seguro no navegador).
- **Refresh automático:** ao receber 401, renova o token e repete a requisição uma vez. O backend rotaciona o refresh token e trata reuso como roubo, então o refresh é *single-flight* (várias requisições simultâneas → um único `/auth/refresh`).

## Login social — o que precisa configurar
- Google: crie OAuth Client IDs (web/iOS/Android) e preencha `EXPO_PUBLIC_GOOGLE_*`; o mesmo ID web deve estar em `GOOGLE_CLIENT_IDS` no backend.
- Facebook: `EXPO_PUBLIC_FACEBOOK_APP_ID` (o *secret* fica **somente** no backend).
- No Expo Go o redirecionamento OAuth é limitado; para fluxo completo use um *development build* (`expo-dev-client`).

## Fluxo "Descubra um destino" (fictício, só front)

Rota `/discover` (aba **Descubra** do planejador → botão "Descubra um destino"). Questionário em 9 etapas → até 10 destinos (um card por vez) → favoritos → comparação lado a lado.

- Lógica pura e testada em `src/domain/discover/` (`matching.ts` filtra o inviável e ranqueia; `compare.ts` monta a comparação).
- Catálogo local fictício em `catalog.ts`. Pets/acessibilidade só aparecem como adequados quando `verified: true`; caso contrário a UI mostra "Confirme antes de reservar".
- Imagens (JPG, ~1,5 MB no total) geradas proceduralmente por `scripts/generate-discover-photos.py` — **não são fotos reais**. Para trocar, substitua os arquivos em `assets/images/discover/photos/` ou edite `src/presentation/discover/assets.ts` (único mapeamento).
- Ícones (PNG branco 96px, tingidos via `tintColor`) gerados por `scripts/generate-discover-icons.py`. O questionário só abre pelo banner "Ainda não sabe para onde ir?" da tela Nova viagem.
