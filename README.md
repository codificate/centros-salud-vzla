# Centros de Salud · Venezuela

Plataforma web para dar visibilidad a las necesidades reales de los centros de salud venezolanos, a través de las voces de quienes están en la primera línea. Permite al personal médico certificado **registrar y actualizar los insumos** que requieren clínicas y hospitales del país, armando una red de información transparente y enfocada en la acción.

## ¿De qué se trata?

> Resumen tomado de la pantalla **"Acerca de"** ([`components/AboutUsScreen.tsx`](components/AboutUsScreen.tsx)).

- **Propósito.** Herramienta tecnológica para que el personal de salud reporte qué insumos hacen falta en cada centro. La veracidad de esa información puede salvar vidas.
- **Confianza y ética.** Reportar es exclusivo para personal de salud certificado. Se valida la identidad con la **Cédula de Identidad** y el número del **MPPS** (Ministerio del Poder Popular para la Salud).
- **Privacidad.** El registro usa IA para leer la cédula de forma automatizada y efímera. **Nunca se guarda la foto de la cédula**; solo se almacena el número de documento encriptado junto a la credencial del MPPS. Los datos no se venden ni se comparten con terceros.
- **Nuestra postura.** Es una iniciativa civil y tecnológica de ayuda a la sociedad. **No pretende sustituir ni eximir** las responsabilidades constitucionales del Estado de dotar los centros médicos y garantizar el derecho a la salud.

## Stack

| Pieza | Tecnología |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| UI | React 18 + Tailwind CSS 3 |
| Íconos | `@tabler/icons-react` |
| Mapas | Leaflet + `react-leaflet` |
| Auth | Firebase Auth (Google) + cookie de token |
| OCR cédula | Google Generative AI (Gemini) |
| Backend | API externa (ver `lib/api`) consumida vía Server Actions |
| Deploy | Vercel (`pnpm`) |

## Correr local

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # build produccion
pnpm lint       # eslint
pnpm test       # node --test sobre lib/**
```

Variables de entorno necesarias: config de Firebase (`lib/firebase/config.ts`), `GEMINI_API_KEY` (OCR de cédula) y la URL de la API backend (`lib/api/config.ts`).

## Estructura del proyecto

```
app/                         Rutas (App Router)
├─ layout.tsx                Providers globales: AuthProvider + SignUpFlowProvider
├─ page.tsx                  "/"  → lista/mapa de centros (público)
├─ acerca/page.tsx           "/acerca" → Acerca de
├─ onboarding/page.tsx       "/onboarding" → registro (cédula + MPPS + centro)
├─ dashboard/page.tsx        "/dashboard" → panel del usuario (protegido)
├─ insumos/centro/[centroId] "/insumos/centro/:id" → insumos públicos de un centro
├─ api/cedula/route.ts       POST → OCR + verificación de cédula (Node runtime)
├─ actions/                  Server Actions (centros, insumos, usuarios, tiposInsumos)
├─ error.tsx / loading.tsx   Estados de error y carga
└─ globals.css

components/                  UI (screens + piezas reutilizables)
├─ CentrosClient.tsx         Contenedor "/": buscador + toggle lista/mapa + drawer
├─ CentrosList.tsx           Lista de centros
├─ CentrosMap.tsx            Mapa con todos los centros
├─ CentroDrawer.tsx          Panel de detalle de un centro + acciones
├─ CentroMap.tsx             Mini-mapa de un centro
├─ PublicInsumosByCentro.tsx Insumos públicos de un centro
├─ SignUpOnboardingScreen.tsx Flujo de registro (subir cédula, validar, asociar centro)
├─ DashboardScreen.tsx       Panel: centros asociados + reporte de insumos
├─ AboutUsScreen.tsx         "/acerca"
├─ Navbar.tsx                Navegación (Inicio / Acerca / Dashboard según sesión)
├─ UserCentroAssociated.tsx  Centro asociado al usuario en el dashboard
├─ CentroAutocomplete.tsx    Autocompletar centro
├─ TiposInsumosAutocomplete.tsx Autocompletar tipo de insumo
├─ CentroInsumoItem.tsx / InsumosPanel.tsx / InsumoPriorityBadge.tsx  Insumos
├─ SignupGoogleDialog.tsx / ExitConfirmDialog.tsx / ErrorDialog.tsx   Diálogos
├─ hooks/useSignupFlow.ts    Lógica compartida del flujo de registro
└─ providers/
   ├─ AuthProvider.tsx       Sesión de Firebase (user, loading, logout)
   └─ SignUpFlowProvider.tsx Guarda el centro elegido entre "/" y "/onboarding"

lib/
├─ api/                      Cliente HTTP de la API backend (centros, insumos, usuarios, auth, tipos)
├─ firebase/                 client, config, cookie de token, login con Google
├─ genai/cedula.ts           Extracción de datos de cédula con Gemini
├─ cedulave/verify.ts        Verificación del número de cédula
├─ centros.ts / geo.ts / screen.ts  Tipos y utilidades (distancia, pantalla, etc.)

middleware.ts                Protege "/dashboard/*": sin token → redirige a "/"
```

## Pantallas y rutas

| Ruta | Pantalla | Acceso | Qué hace |
|------|----------|--------|----------|
| `/` | `CentrosClient` | Público | Busca centros, cambia entre lista y mapa, abre el detalle |
| `/acerca` | `AboutUsScreen` | Público | Propósito, ética, privacidad y postura del proyecto |
| `/insumos/centro/:id` | `PublicInsumosByCentro` | Público | Insumos requeridos por un centro (vista responsive) |
| `/onboarding` | `SignUpOnboardingScreen` | Requiere sesión | Registro: subir cédula, validar identidad, asociar centro |
| `/dashboard` | `DashboardScreen` | **Protegido** | Panel del usuario: centros asociados + reportar insumos |

## Flujos principales

### 1. Explorar centros (público)

`/` carga los centros en el servidor ([`app/page.tsx`](app/page.tsx)) y los refresca en cliente ([`components/CentrosClient.tsx`](components/CentrosClient.tsx)).

```
"/" → buscar / filtrar → ver Lista o Mapa → tocar un centro → CentroDrawer
         └─ Acciones del drawer:
            • Ver insumos   → panel inline (pantalla ancha) o /insumos/centro/:id
            • Trabajo ahí   → inicia el flujo de registro (oculto si ya hay sesión)
            • Cómo llegar   → abre Google Maps con la ruta
```

> Nota: el botón **"Trabajo ahí"** se oculta cuando hay sesión de Firebase activa, para evitar que un usuario ya registrado asocie un centro nuevo desde `/`.

### 2. Registro / inicio de sesión

Lógica compartida en [`components/hooks/useSignupFlow.ts`](components/hooks/useSignupFlow.ts). Sirve igual desde el drawer de un centro o desde el Navbar.

```
Acción "Trabajo ahí" (guarda el centro en SignUpFlowProvider)
│
├─ ¿Hay sesión de Firebase?
│   ├─ No  → SignupGoogleDialog → login con Google → cookie de token → signInAction
│   └─ Sí  → signInAction
│
└─ Resultado de signInAction:
    ├─ exists / not_found → /onboarding
    └─ unauthenticated    → vuelve a pedir Google
```

### 3. Onboarding (validación de identidad)

[`components/SignUpOnboardingScreen.tsx`](components/SignUpOnboardingScreen.tsx) → `POST /api/cedula`.

```
Subir foto de cédula (JPEG/PNG)
│
├─ Gemini OCR   → extrae cédula, nombres, apellidos   (lib/genai/cedula.ts)
├─ verifyCedula → valida el número oficial            (lib/cedulave/verify.ts)
└─ isCedulaMatch: mismo número + coincide al menos un token del nombre
      │
      └─ Completar MPPS + especialidad + centro → signUpAction → sesión lista
```

La foto **no se guarda**: el OCR es efímero. Solo persisten el número de cédula (encriptado) y la credencial MPPS.

### 4. Dashboard (usuario autenticado)

Protegido por [`middleware.ts`](middleware.ts): sin cookie de token, redirige a `/`.

```
/dashboard
├─ Centros asociados al usuario   (listUserCentrosAction / addCentroAction / removeCentroAction)
└─ Reportar insumos por centro    (fetchInsumosAction / createInsumosAction)
      └─ tipo de insumo + prioridad → red de necesidades del país
```

## Analytics

Events are tracked via **Firebase Analytics (GA4)** to measure feature adoption and user flows. The **single source of truth** for all tracked events is [`lib/firebase/events.ts`](lib/firebase/events.ts), which defines the `AnalyticsEventMap` interface. To add a new event:

1. Add it to `AnalyticsEventMap` in `lib/firebase/events.ts` with its params.
2. Emit it via `track(name, params)` from `lib/firebase/analytics.ts` (client-side only).

The `AnalyticsProvider` (root layout) automatically tracks `page_view` on every route change and associates events with the Firebase user ID. Analytics is a safe no-op when `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` is unset or on the server.

**Tracked events:**

| Event | Params | Context |
|-------|--------|---------|
| `page_view` | `page_path: string` | Auto-tracked on route change |
| `login` | `method: string` | Google login |
| `logout` | *(none)* | User logout |
| `sign_up` | `method: string` | New user signup |
| `signup_step` | `step: number`, `step_name: string` | Onboarding progress |
| `signup_abandon` | `step: number` | User quits onboarding |
| `centro_select` | `centro_id: string`, `source: "list" \| "map" \| "autocomplete"` | User picks a centro |
| `centro_view_insumos` | `centro_id: string` | User views centro supplies |
| `insumo_filter` | `filter_type: string`, `value: string` | Supply filter applied |
| `map_interaction` | `action: "marker_click" \| "zoom"`, `centro_id?: string` | Map action |
| `nav_click` | `target: string` | Navigation link clicked |
| `search` | `search_term: string`, `context: string` | Search performed |

## Seguridad y privacidad

- Autenticación con Firebase; el token viaja en cookie y valida las Server Actions y `/api/cedula`.
- `middleware.ts` bloquea `/dashboard/*` sin sesión.
- La imagen de la cédula se procesa en memoria y **no se almacena**.
- Reportar insumos es exclusivo para personal de salud con identidad verificada (cédula + MPPS).
