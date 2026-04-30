# Caliape Recorder Integration API Docs

Este repositorio publica la documentación de la Recorder Integration API en GitHub Pages.

## Estructura

- `index.html`: landing pública.
- `recorder-api.yaml`: especificación OpenAPI (sin credenciales).
- `docs/`: Swagger UI configurado para cargar `../recorder-api.yaml`.

> Nota: actualmente Swagger UI se carga desde CDN para simplificar el despliegue. Si necesitás
> servir los assets locales, descargá los archivos `dist` de Swagger UI y reemplazá los links
> del HTML por archivos locales.

## Checklist de publicación

1. **Actualizar spec y ejemplos**
   - Reemplazar `recorder-api.yaml`.
   - Actualizar `ejemplos/codeExamplesByOperation.js` con snippets para todos los endpoints.
   - Correr `ruby scripts/validate-docs.rb`.

2. **GitHub Pages**
   - Settings → Pages → Source: Deploy from a branch.
   - Branch: `main` / Folder: `/ (root)`.
   - Guardar y esperar la URL temporal `https://<org>.github.io/<repo>/`.

3. **Custom domain**
   - Settings → Pages → Custom domain → `api.caliape.com`.
   - Verificar que se haya creado el archivo `CNAME` en el repo.

4. **DNS**
   - Crear registro CNAME:
     - Host/Name: `api`
     - Target/Value: `<org>.github.io`
   - Esperar propagación.

5. **HTTPS**
   - Volver a Settings → Pages y habilitar **Enforce HTTPS** cuando esté disponible.

## Validación local

```sh
ruby scripts/validate-docs.rb
```

El script valida que el YAML sea parseable, que las referencias locales existan, que Swagger UI cargue `recorder-api.yaml`, que los ejemplos JS sean sintácticamente válidos y que cada operación de la spec tenga snippets en curl, Python y TypeScript.

## Smoke tests contra la API

Configurar `.env` con credenciales reales y una `AUDIO_URL` HTTPS alcanzable por el backend. `RETURN_ORIGIN` puede quedar como `http://localhost:3000`: no se contacta por red, sólo se valida que el backend lo asocie a la sesión. El archivo local queda ignorado por git; `.env.example` documenta las variables.

```sh
scripts/test-endpoints.sh
python3 scripts/test-endpoints.py
node --experimental-strip-types scripts/test-endpoints.ts
```

Los scripts recorren todos los endpoints de la spec usando un `external_case_id` único si no se define `EXTERNAL_CASE_ID`. También verifican que `/v1-recorder-sessions` devuelva el mismo `RETURN_ORIGIN` enviado y, con `RUN_NEGATIVE_TESTS=true`, que rechace un origin inválido. `RUN_PROCESSING_ENDPOINTS` y `RUN_LEGACY_ENDPOINTS` permiten desactivar llamadas que pueden disparar procesamiento/consumo.

## Verificación final

- `https://api.caliape.com/` (landing)
- `https://api.caliape.com/recorder-api.yaml` (spec)
- `https://api.caliape.com/swagger/` (Swagger UI)

## Onboarding rápido (referencia)

1. Obtener JWT en `/v1-auth-token` usando `x-enterprise-key`.
2. Crear sesiones efímeras en `/v1-recorder-sessions` cuando el flujo use Recorder Web.
3. Usar `x-enterprise-jwt` server-side o `x-recorder-session-token` desde Recorder Web según corresponda.
4. Sin headers válidos, las requests deben fallar con 401/403.
