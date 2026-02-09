# Caliape Enterprise API Docs

Este repositorio publica la documentación de la Enterprise API en GitHub Pages.

## Estructura

- `index.html`: landing pública.
- `openapi.yaml`: especificación OpenAPI (sin credenciales).
- `swagger/`: Swagger UI configurado para cargar `../openapi.yaml`.

> Nota: actualmente Swagger UI se carga desde CDN para simplificar el despliegue. Si necesitás
> servir los assets locales, descargá los archivos `dist` de Swagger UI y reemplazá los links
> del HTML por archivos locales.

## Checklist de publicación

1. **GitHub Pages**
   - Settings → Pages → Source: Deploy from a branch.
   - Branch: `main` / Folder: `/ (root)`.
   - Guardar y esperar la URL temporal `https://<org>.github.io/<repo>/`.

2. **Custom domain**
   - Settings → Pages → Custom domain → `api.caliape.com`.
   - Verificar que se haya creado el archivo `CNAME` en el repo.

3. **DNS**
   - Crear registro CNAME:
     - Host/Name: `api`
     - Target/Value: `<org>.github.io`
   - Esperar propagación.

4. **HTTPS**
   - Volver a Settings → Pages y habilitar **Enforce HTTPS** cuando esté disponible.

## Verificación final

- `https://api.caliape.com/` (landing)
- `https://api.caliape.com/openapi.yaml` (spec)
- `https://api.caliape.com/swagger/` (Swagger UI)

## Onboarding rápido (referencia)

1. Obtener JWT en `/auth/jwt` usando `x-enterprise-key`.
2. Usar `x-enterprise-jwt` en todos los endpoints.
3. Sin headers válidos, las requests deben fallar con 401/403.
