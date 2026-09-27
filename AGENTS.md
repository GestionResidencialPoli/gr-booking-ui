# gr-booking-ui — contexto para agentes

Microfrontend de zonas comunes y reservas (épica `GR-9` en Jira, historias GR-62 a GR-69). Next.js 16 (App Router). RESIDENTE reserva y consulta sus reservas; ADMINISTRACION configura zonas, bloqueos y supervisa/cancela cualquier reserva.

## Convención de código

Sin comentarios en el código, salvo que el nombre no baste para explicarlo.

## Backend

Todo pasa por el gateway (`BACKEND_API_URL`, `http://localhost:4000` en local). El dominio vive en `gr-booking-microservice` bajo `/api/v1/zonas-comunes` y `/api/v1/reservas`.

### Endpoints

- `GET /zonas-comunes?incluirInactivas=` — lista zonas (admin ve inactivas).
- `GET /zonas-comunes/{id}`
- `GET /zonas-comunes/{id}/disponibilidad?desde=YYYY-MM-DD&hasta=YYYY-MM-DD` — máx. 60 días de rango; sin parámetros trae 6 días desde hoy.
- `POST /zonas-comunes` (admin) — body `ZonaComunInput`.
- `PUT /zonas-comunes/{id}` (admin)
- `PATCH /zonas-comunes/{id}/activacion` (admin) — body `{ activa: boolean }`.
- `GET /zonas-comunes/{id}/bloqueos` (admin)
- `GET /zonas-comunes/{id}/bloqueos/reservas-afectadas?inicio=&fin=` (admin) — formato `YYYY-MM-DDTHH:MM` local, previsualiza antes de crear el bloqueo.
- `POST /zonas-comunes/{id}/bloqueos` (admin) — body `{ inicio, fin, motivo, cancelarReservasAfectadas }`.
- `DELETE /zonas-comunes/{id}/bloqueos/{bloqueoId}` (admin)
- `POST /reservas` (residente) — body `{ zonaId, fecha: "YYYY-MM-DD", horaInicio: "HH:MM" }`.
- `GET /reservas/mias` (residente) — `{ apartamento, proximas, pasadas }`.
- `PATCH /reservas/{id}/cancelacion` (residente, propia)
- `GET /reservas?zonaId=&desde=&hasta=&estado=&page=&size=` (admin)
- `PATCH /reservas/{id}/cancelacion-administrativa` (admin) — body `{ motivo }` obligatorio.

Todas las respuestas exitosas vienen envueltas en `{ payload }` (lecturas y escrituras individuales) o `{ payload: PageResult<T> }` (listados paginados). Errores: `{ error: { code, message, details? } }`.

### `ZonaComunInput` (creación/edición)

```ts
{ nombre, descripcion?, horaApertura: "HH:MM", horaCierre: "HH:MM", duracionFranjaMinutos, aforo,
  anticipacionMinimaHoras, anticipacionMaximaDias, anticipacionCancelacionHoras, confirmarFranjaIncompleta }
```

Si la duración no cabe un número entero de veces en el horario, el backend responde 422 `FRANJA_INCOMPLETA` con `{ minutosUltimaFranja, franjasPorDia }` en `details`: el formulario debe mostrar esa info y reenviar con `confirmarFranjaIncompleta: true` si el administrador confirma.

### Estados de franja (`disponibilidad`)

`DISPONIBLE | PARCIAL | COMPLETA | BLOQUEADA | FUERA_DE_ANTICIPACION`. `FranjaDisponibilidadDto` trae `cuposRestantes` y, si está bloqueada, `motivoBloqueo`. **Esta consulta es informativa, no reserva nada** — la validación real ocurre al confirmar (ver siguiente sección).

### Códigos de error que la UI debe mapear a mensaje

- `POST /reservas` → 409 `FRANJA_SIN_CUPO` (la franja se agotó entre que se consultó y se confirmó: recargar disponibilidad y pedir elegir otra), 422 `ZONA_INACTIVA` / `FRANJA_BLOQUEADA` / `FRANJA_PASADA` / `ANTICIPACION_MINIMA` / `ANTICIPACION_MAXIMA` / `LIMITE_RESERVAS_ACTIVAS` / `SIN_PAZ_Y_SALVO` / `FRANJA_INVALIDA` / `SIN_APARTAMENTO` / `APARTAMENTO_INACTIVO`.
- `PATCH /reservas/{id}/cancelacion` → 403 `RESERVA_AJENA`, 422 `RESERVA_PASADA` / `ANTICIPACION_CANCELACION`. Cancelar una reserva ya cancelada es idempotente (200, sin error).
- `POST /zonas-comunes` → 409 `ZONA_DUPLICADA`, 422 `HORARIO_INVALIDO` / `DURACION_FRANJA_INVALIDA` / `FRANJA_INCOMPLETA` (ver arriba).
- `PUT/PATCH /zonas-comunes/{id}` → 409 `ZONA_CON_RESERVAS_FUTURAS` / `AFORO_MENOR_QUE_OCUPACION`.
- Bloqueos → 422 `RANGO_INVALIDO`, 404 `ZONA_NO_ENCONTRADA` / `BLOQUEO_NO_ENCONTRADO`.

Usar siempre `apiFetch` de `@gestionresidencial/auth-client` (CSRF, `credentials: "include"`, reintento tras 401 ya resueltos).

## Concurrencia del lado del cliente (no solo del servidor)

GR-73 CA-3 exige que el botón de confirmar quede deshabilitado mientras la petición está en curso: un doble clic no debe generar dos peticiones. El servidor ya resuelve la condición de carrera real (fila `FOR UPDATE` + restricción de exclusión), pero el síntoma de un doble clic del propio usuario es el mismo 409 y debe evitarse en el cliente para no confundirlo con una carrera real contra otro residente.

## Zona horaria

Las horas de las zonas (`horaApertura`, `horaCierre`) y las franjas se calculan en hora de Colombia (`TIMEZONE_OFFSET=-05:00` en el backend) independientemente de la zona horaria del navegador. No usar `Date` del navegador para decidir si una franja ya pasó o para formatear horas: comparar strings `HH:MM` tal como los entrega el backend.

## Autenticación

Igual que gr-wall-ui: puente SSO (`/auth/sso/callback`, `SsoCallbackScreen`), `proxy.ts` protege todo lo demás. Las audiencias `residente` y `admin` son válidas aquí (nunca `vigilante`); el gating de páginas solo-admin ocurre con `requiredRole="ADMINISTRACION"` en `AuthenticatedShell`.

## Gitflow

Igual que los demás repos `gr-*`: `feature/GR-000-descripcion` desde `develop`, commits `tipo(scope): GR-000 descripcion breve`, PR por work item vinculado a Jira.
