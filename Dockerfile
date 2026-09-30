FROM node:22-alpine

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ARG BACKEND_API_URL=http://localhost:4000
ARG NEXT_PUBLIC_AUTH_UI_URL=http://localhost:3002
ENV BACKEND_API_URL=$BACKEND_API_URL
ENV NEXT_PUBLIC_AUTH_UI_URL=$NEXT_PUBLIC_AUTH_UI_URL

COPY package.json ./
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build

EXPOSE 3004
CMD ["npm", "run", "start"]
