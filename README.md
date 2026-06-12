# CBM Clinic Platform

Web de la clínica de fisioterapia CBM (Terrassa) — [cbmfisioterapia.com](https://cbmfisioterapia.com). Angular 21 (standalone components), Supabase, Netlify.

```bash
npm start          # Dev server en http://localhost:4200/
npm run build      # Build de producción → dist/
npm test           # Tests unitarios con Vitest
```

La arquitectura del proyecto está documentada en [CLAUDE.md](CLAUDE.md) (para Claude Code) y [AGENTS.md](AGENTS.md) (para Codex, OpenCode, Cursor y demás).

---

# 🤖 Desarrollo asistido por IA — Guía completa

Este repo está equipado con la infraestructura de IA que se usa hoy en día para programar de forma profesional: **agentes especializados, skills (slash commands), hooks automáticos, servidores MCP y loops**, configurados para tres herramientas: **Claude Code**, **OpenCode** y **OpenAI Codex**.

## Mapa de archivos

```
├── CLAUDE.md                      # Contexto del proyecto para Claude Code
├── AGENTS.md                      # Contexto para Codex / OpenCode / Cursor (estándar abierto)
├── .mcp.json                      # Servidores MCP compartidos del proyecto (Claude Code)
├── opencode.json                  # Configuración de OpenCode (MCP + formatter)
├── .claude/
│   ├── settings.json              # Hooks del proyecto (se commitea, lo usa todo el equipo)
│   ├── settings.local.json        # Permisos personales (gitignored)
│   ├── agents/                    # Subagentes de Claude Code
│   │   ├── angular-expert.md
│   │   ├── seo-auditor.md
│   │   ├── test-writer.md
│   │   ├── code-reviewer.md
│   │   └── supabase-guardian.md
│   └── skills/                    # Skills = slash commands del proyecto
│       ├── new-seo-page/SKILL.md
│       ├── pre-deploy/SKILL.md
│       └── new-feature/SKILL.md
└── .opencode/
    ├── agent/                     # Subagentes de OpenCode (espejo de los de Claude)
    └── command/pre-deploy.md      # Comando /pre-deploy en OpenCode
```

---

## 1. Claude Code

### 1.1 Instalación y arranque

```bash
npm install -g @anthropic-ai/claude-code
cd cbm-clinic-platform
claude
```

Al arrancar, Claude lee automáticamente `CLAUDE.md` (arquitectura, comandos, convenciones). No hace falta explicarle el proyecto en cada sesión.

### 1.2 Agentes (subagentes especializados)

Un **agente** es un "empleado especializado": tiene su propio prompt de sistema, sus propias herramientas y su propio contexto (no contamina tu conversación principal). Viven en `.claude/agents/*.md`.

| Agente              | Para qué sirve                                                                                          | Herramientas               |
| ------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------- |
| `angular-expert`    | Crear/modificar componentes, servicios y rutas siguiendo la arquitectura del proyecto                   | lectura + escritura + bash |
| `seo-auditor`       | Auditar canonicals, JSON-LD, meta tags, redirects y prerender (solo informa)                            | solo lectura + web         |
| `test-writer`       | Escribir tests Vitest y ejecutarlos hasta que pasen                                                     | lectura + escritura + bash |
| `code-reviewer`     | Revisar el diff buscando secretos, errores de Supabase sin manejar, violaciones de capas (solo informa) | solo lectura               |
| `supabase-guardian` | SQL, RLS, migraciones y Netlify Functions con foco en seguridad                                         | lectura + escritura + bash |

**Cómo se usan** (dentro de una sesión de `claude`):

```text
> Usa el agente angular-expert para crear un componente de testimonios en vídeo
> Lanza el seo-auditor sobre las landing pages
> Pásale el diff al code-reviewer antes de commitear
```

Claude también los invoca **proactivamente** cuando la tarea encaja con la `description` del agente. Práctica muy usada hoy: lanzar varios agentes **en paralelo** (ej. `test-writer` y `seo-auditor` a la vez) porque cada uno trabaja en su propio contexto.

Para crear más: `/agents` dentro de Claude Code, o crea un `.md` nuevo en `.claude/agents/` con frontmatter `name`, `description`, `tools`, `model`.

### 1.3 Skills (slash commands del proyecto)

Una **skill** es un procedimiento empaquetado que se invoca con `/nombre`. Viven en `.claude/skills/<nombre>/SKILL.md`.

| Comando                                | Qué hace                                                                                                                               |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `/new-seo-page fisioterapia deportiva` | Crea una landing SEO completa: ruta lazy, contenido único, canonical, entrada en `routes.txt`, verificación con build                  |
| `/pre-deploy`                          | Checklist completo antes de subir: tipos, tests, prettier, build, escaneo de secretos, redirects. Termina con veredicto LISTO/NO SUBIR |
| `/new-feature pilates-terapeutico`     | Scaffolding de un feature: decide la capa correcta, crea componente standalone + ruta + test                                           |

Además de estas, Claude Code trae skills integradas muy útiles:

- `/code-review` — revisión profunda del diff actual (con `--fix` aplica los arreglos)
- `/security-review` — revisión de seguridad de los cambios de la rama
- `/simplify` — simplifica el código cambiado sin alterar comportamiento
- `/verify` — arranca la app y comprueba que un cambio funciona de verdad

### 1.4 Hooks (automatizaciones en `.claude/settings.json`)

Los **hooks** son comandos que el harness ejecuta automáticamente ante eventos. Son deterministas: ocurren SIEMPRE, no dependen de que el modelo "se acuerde". Los tres configurados (y verificados en vivo):

1. **Auto-formato** (`PostToolUse` sobre `Write|Edit`): cada vez que la IA escribe o edita un archivo, se ejecuta `npx prettier --write` sobre él. Nunca más un commit sin formatear.
2. **Bloqueo de comandos destructivos** (`PreToolUse` sobre `Bash`): si la IA intenta ejecutar `rm -rf` o `git push --force`, el hook lo **deniega antes de que se ejecute** (permite `--force-with-lease`, que es la variante segura).
3. **Notificación de escritorio** (`Stop`): cuando Claude termina una tarea, recibes un `notify-send` — puedes dejarlo trabajando e irte a otra ventana.

Gestión: comando `/hooks` dentro de Claude Code para ver/editar/desactivar. Si editas `settings.json` a mano con la sesión abierta, abre `/hooks` una vez para recargar.

### 1.5 MCP (Model Context Protocol)

**MCP** es el estándar (creado por Anthropic, hoy adoptado por OpenAI, Google, etc.) que conecta a la IA con herramientas externas: navegadores, bases de datos, documentación. Los servidores del proyecto están en `.mcp.json`:

| Servidor     | Qué aporta                                                                                                                   | Setup necesario                              |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `playwright` | La IA controla un navegador real: abre `localhost:4200`, hace clic, saca capturas, verifica que la web funciona              | Ninguno (usa npx)                            |
| `context7`   | Documentación actualizada de librerías (Angular 21, Supabase v2…) inyectada en contexto — evita que la IA use APIs obsoletas | Ninguno (usa npx)                            |
| `supabase`   | Consultar el esquema y los datos de tu proyecto Supabase en modo **solo lectura**                                            | Exportar `SUPABASE_ACCESS_TOKEN` (ver abajo) |

**Setup del MCP de Supabase** (una sola vez):

```bash
# 1. Genera un token en https://supabase.com/dashboard/account/tokens
# 2. Añádelo a tu shell (~/.bashrc):
export SUPABASE_ACCESS_TOKEN="sbp_xxxxxxxx"
```

La primera vez que abras Claude Code te pedirá aprobar los servidores de `.mcp.json`. Verifica su estado con `/mcp`. Ejemplos de uso:

```text
> Con playwright, abre localhost:4200/tratamientos y dime si el canonical es correcto
> Usa context7 para ver la API actual de signals en Angular 21
> Consulta en supabase qué columnas tiene la tabla de eventos
```

### 1.6 Loops y trabajo en segundo plano

- **`/loop`** — repite una tarea a intervalos: `/loop 10m /pre-deploy` ejecuta el checklist cada 10 minutos; sin intervalo (`/loop vigila que el build siga en verde`) la IA decide el ritmo sola. Útil para vigilar deploys de Netlify o builds largos.
- **`claude -p "prompt"`** (modo headless) — ejecuta una tarea sin sesión interactiva; es como se integra Claude en scripts y CI.
- **Tareas en segundo plano** — pide "lanza los tests en background y sigue con X"; el harness te avisa cuando terminan.

### 1.7 Flujo de trabajo recomendado (el que se usa hoy en la industria)

1. **Explorar** — "¿Cómo funciona el booking-form?" (la IA lee antes de tocar).
2. **Planificar** — `Shift+Tab` activa _plan mode_: la IA propone un plan SIN tocar código y tú lo apruebas. Para cambios grandes, esto es lo que separa un buen resultado de un desastre.
3. **Implementar** — la IA ejecuta el plan; el hook de Prettier formatea solo.
4. **Testear** — "usa test-writer para cubrir esto" (TDD con agentes: tests primero, código después, también funciona muy bien).
5. **Revisar** — `/code-review` o el agente `code-reviewer`.
6. **Verificar** — `/verify` o el MCP de playwright sobre la app real.
7. **Pre-deploy** — `/pre-deploy` antes de hacer push (Netlify despliega `main`).

---

## 2. OpenCode

[OpenCode](https://opencode.ai) es la alternativa open source orientada a terminal. Su configuración ya está en el repo.

```bash
npm install -g opencode-ai
cd cbm-clinic-platform
opencode
```

- **Contexto**: `opencode.json` apunta a `CLAUDE.md` como instrucciones (y también lee `AGENTS.md`), así las tres herramientas comparten el mismo conocimiento del proyecto.
- **Agentes** (`.opencode/agent/`): `angular-expert`, `code-reviewer` y `seo-auditor` — espejo de los de Claude. Se invocan con `@nombre`: `@code-reviewer revisa mi diff`. Los de auditoría tienen `write/edit: false`: físicamente no pueden tocar código.
- **Comandos** (`.opencode/command/`): `/pre-deploy` ejecuta el mismo checklist que en Claude Code.
- **MCP**: `opencode.json` carga `playwright` y `context7`.
- **Formatter**: OpenCode ejecuta Prettier automáticamente tras cada edición (equivalente a nuestro hook de Claude).

## 3. OpenAI Codex

Codex CLI lee automáticamente el `AGENTS.md` del repo (el estándar abierto que también usan Cursor y Gemini CLI).

```bash
npm install -g @openai/codex
cd cbm-clinic-platform
codex
```

La configuración de Codex es global, en `~/.codex/config.toml`. Recomendada para este proyecto:

```toml
# ~/.codex/config.toml
model = "gpt-5-codex"
approval_policy = "on-request"   # pide permiso para comandos, edita libre
sandbox_mode  = "workspace-write" # solo escribe dentro del repo

# Los mismos MCP que en Claude Code / OpenCode:
[mcp_servers.playwright]
command = "npx"
args = ["-y", "@playwright/mcp@latest", "--headless"]

[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp"]
```

Flujo equivalente: `codex` para sesión interactiva, `codex exec "tarea"` para modo headless/scripts.

## 4. Reglas de oro (independientes de la herramienta)

1. **El contexto manda**: `CLAUDE.md` y `AGENTS.md` son la fuente de verdad. Si cambias la arquitectura, actualízalos en el mismo PR — es la inversión con más retorno de todo este setup.
2. **Plan antes de código** en cambios grandes; deja que la IA edite directo solo en cambios pequeños.
3. **Revisión y verificación siempre**: la IA escribe rápido, pero `/code-review` + `/pre-deploy` + playwright son los que evitan que algo roto llegue a producción.
4. **Secretos jamás en el repo**: la service key de Supabase y los tokens viven en variables de entorno (Netlify UI / tu shell). Los hooks y skills escanean el diff, pero la regla es no escribirlos nunca.
5. **Agentes de solo lectura para auditar**: que el revisor no pueda editar es una garantía, no una limitación.
