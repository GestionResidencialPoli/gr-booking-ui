# GR Booking UI

Microfrontend de zonas comunes y reservas de Gestión Residencial: consulta y reserva para RESIDENTE, configuración y supervisión para ADMINISTRACION.

## Por qué existe este repositorio

Sigue el mismo patrón que `gr-wall-ui`: un repo por dominio, simétrico con su microservicio (`gr-booking-microservice`), en vez de vivir dentro de las apps por rol.

## Biblioteca compartida

Consume, como dependencias npm normales:

- [`@gestionresidencial/shared-ui`](https://www.npmjs.com/package/@gestionresidencial/shared-ui)
- [`@gestionresidencial/auth-client`](https://www.npmjs.com/package/@gestionresidencial/auth-client)

## Cómo se llega aquí

Sin login propio: un usuario autenticado en `gr-common-ui` (residente) o `gr-admin-ui` (administración) navega al módulo de zonas comunes; esa app inicia un salto SSO (`initiateSsoHandoff`) hacia `/auth/sso/callback` de este origen.

## Backend

`/api/v1/zonas-comunes` y `/api/v1/reservas` (`gr-booking-microservice`) a través del gateway. Ver `AGENTS.md` para el contrato completo.

## Desarrollo local

```bash
pnpm install
pnpm dev   # puerto 3004
```
