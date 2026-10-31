# Servidor de desenvolvimento Expo (Metro) em container.
FROM node:22-alpine

ENV EXPO_NO_TELEMETRY=1 \
    NODE_ENV=development

WORKDIR /app

# Instala dependências primeiro: aproveita cache de camadas enquanto package*.json não muda.
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci && chown -R node:node /app

COPY --chown=node:node . .

# Roda sem privilégios de root.
USER node

# 8081 = Metro (app no Expo Go e versão web)
EXPOSE 8081

# --lan: aceita conexões da rede (celular). O IP anunciado no QR vem de REACT_NATIVE_PACKAGER_HOSTNAME.
CMD ["npx", "expo", "start", "--lan", "--port", "8081"]
