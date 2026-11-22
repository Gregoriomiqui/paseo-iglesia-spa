# SPEC-002: Arquitectura UI, Flujo Multi-Step e Integración con Make

* **Estado:** Borrador para revisión (SDD), v2
* **Capa:** Presentación (React + TypeScript + Tailwind CSS) e infraestructura (cliente HTTP)
* **Dependencias:** `SPEC-001` (tipos, validaciones, tarifas y `buildMakePayload`)
* **Metodología:** TDD (Vitest + React Testing Library)

## 1. Objetivo y Alcance

Definir la arquitectura de componentes, el manejo de estado del formulario *multi-step*, las reglas de interacción UX y el contrato de integración con el webhook de Make.

---

## 2. Arquitectura de Componentes

### 2.1. Sección informativa (`EventInfoBanner`)

Se ubica en la parte superior del formulario o en una sección dedicada. Debe mostrar:

* **Tabla de tarifas:** 0 a 5 años $0 (no pagan) · 6 a 10 años $4.500 · 11 años en adelante $9.000.
* **Condiciones de transporte (buses de acercamiento):**
  1. Los menores de 2 años viajan en brazos si el bus va lleno, cediendo el asiento.
  2. Salida única desde la iglesia, sin paradas intermedias hasta el recinto.
  3. El horario de salida se comunica en los servicios de la iglesia y/o el mismo día o el día anterior.
  4. El regreso no tiene paradas intermedias; la única parada es la iglesia.

### 2.2. Contenedor multi-step (`RegistrationWizard`)

Estado:

* `participants: Participant[]`: se inicializa con 1 elemento con `isPrincipal: true`.
* `currentStepIndex: number`: `0..participants.length - 1` son los steps de participantes y `participants.length` es el step de pago.
* `paymentData: PaymentData`: contiene `depositMadeBy` y `voucher`.
* `submissionStatus: 'idle' | 'submitting' | 'success' | 'error'`.

### 2.3. Step de participante (`ParticipantStep`)

Formulario reutilizable para el participante principal y hasta 4 adicionales (máximo 5 en total).

| Campo | Control | Notas |
| --- | --- | --- |
| Nombre | `input text` | `maxLength={250}`; recibe el auto-focus |
| Apellido | `input text` | `maxLength={250}` |
| RUT | `input text` | placeholder `12345678-5`; se formatea al salir del campo (§3.6); valida dígito verificador y duplicados (SPEC-001 §3.1, §3.7). El wizard pasa como `otherRuts` solo los RUT de los participantes **anteriores**, así que el error aparece en quien repitió el RUT y no en el original |
| Sexo | `select` o radio | opciones: Femenino / Masculino |
| Edad | `input number` | `min=0`, `step=1`; ayuda visible: "Si es menor de 1 año, ingresa 0" |
| Correo electrónico | `EmailAutocompleteInput` | obligatorio en el principal, opcional en los adicionales |
| Número telefónico | `input tel` | placeholder `+56 9 XXXX XXXX`; obligatorio en el principal, opcional en los adicionales |
| Requerimiento de transporte | radio **Sí / No** | obligatorio; sin valor preseleccionado |

* **Indicadores visuales:** en el step del principal, el correo y el teléfono se marcan como **obligatorios**. En los adicionales se marcan como **opcionales**.
* **Acciones del step:**
  * `Agregar otro participante` (solo en el último participante): se muestra mientras `participants.length < 5` y está habilitado solo si `validateParticipant` devuelve `{}`.
  * `Continuar al pago` (solo en el último participante): valida a todos los participantes. Si alguno es inválido, navega a él y muestra sus errores; si no, navega al step de pago.
  * `Siguiente participante` (en los participantes intermedios, después de haber vuelto atrás): valida el step actual y avanza al siguiente.
  * `Anterior`: vuelve al step anterior sin validar y sin perder los datos.
  * `Eliminar participante`: solo existe para participantes adicionales. Ver la regla de navegación en §3.4.

### 2.4. Componente `EmailAutocompleteInput`

* Consume `getEmailSuggestions` de SPEC-001, que no distingue mayúsculas.
* Al escribir `@`, despliega un listado flotante con los dominios.
* Permite seleccionar con clic o con teclado (`ArrowDown`, `ArrowUp`, `Enter`, `Escape`). Al seleccionar, completa el input y cierra el listado.

### 2.5. Último step: resumen y pago (`PaymentStep`)

* **Resumen:** muestra el desglose por participante y el **monto total** calculado por `calculateRegistrationSummary`.
* **Campos obligatorios:**
  * `Nombre de quien hizo el depósito` (`input text`, campo `depositMadeBy`).
  * `Voucher / comprobante de pago` (`input file` con `accept=".png,.jpg,.jpeg,image/png,image/jpeg"`), validado con `validateVoucher`.
* **Acción final:** botón `Finalizar inscripción`, deshabilitado mientras `submissionStatus === 'submitting'`.

---

## 3. Reglas de Interacción UX

1. **Auto-focus en steps de participantes:** al montar el formulario o al llegar a un step de participante (avanzando, agregando, retrocediendo o después de eliminar), el foco se posiciona en el input `Nombre` (`ref.current?.focus()`).
2. **Excepción en el step de pago:** al entrar a `PaymentStep` **no se aplica auto-focus** en ningún campo.
3. **Feedback de validación:** los mensajes de `validateParticipant` / `validateVoucher` se muestran debajo de cada campo antes de permitir avanzar.
4. **Eliminar un participante:** se quita del arreglo y el wizard navega al **participante anterior** (`currentStepIndex = índiceEliminado - 1`). Los participantes posteriores conservan sus datos y su orden.
5. **Autocompletado del teléfono:** al salir del campo (`blur`), si el valor es un teléfono válido después de `normalizePhone`, el input se reescribe con `formatPhone`. Por ejemplo, `"912345678"` → `"+56 9 1234 5678"`.
6. **Formato del RUT:** al salir del campo (`blur`), el input se reescribe con `formatRut` en el formato `26905429-8`. Si el usuario no escribió el guion, se agrega antes del dígito verificador (`"269054298"` → `"26905429-8"`), y los puntos se quitan.

---

## 4. Integración con el Webhook de Make

### 4.1. Contrato de envío (`POST`)

* **URL:** `import.meta.env.VITE_MAKE_WEBHOOK_URL`, definida en `.env.local`. Ese archivo no se versiona porque `*.local` está en `.gitignore`. Se versiona un `.env.example`.
* **Headers:** `Content-Type: application/json`.
* **Body:** el resultado de `buildMakePayload` (SPEC-001 §5):

```json
{
  "amount": 13500,
  "depositMadeBy": "María Pérez",
  "voucher": "data:image/jpeg;base64,/9j/4AAQ...",
  "participants": [
    {
      "nameAndLastName": "María Pérez",
      "rut": "12345678-5",
      "age": 35,
      "sex": "femenino",
      "phone": "+56912345678",
      "email": "maria@gmail.com",
      "needsTransport": true,
      "is_contact_principal": true
    },
    {
      "nameAndLastName": "Tomás Pérez",
      "rut": "10000013-K",
      "age": 8,
      "sex": "masculino",
      "phone": "",
      "email": "",
      "needsTransport": true,
      "is_contact_principal": false
    }
  ]
}
```

* **Conversión del voucher:** la función de infraestructura `fileToDataUrl(file: File): Promise<string>` usa `FileReader.readAsDataURL` y entrega el string a `buildMakePayload`.
* **Cliente:** `submitRegistration(payload: MakePayload): Promise<void>` lanza un error si la respuesta no es `2xx` o si falla la red.

### 4.2. Manejo de la respuesta

* **Éxito (`2xx`):** se muestra una pantalla de confirmación que indica que el registro fue **recibido** y que, cuando se valide el pago, la entrada digital con código QR llegará al correo del participante principal. La SPA no hace seguimiento del estado del pago.
* **Error (`4xx` / `5xx` / red):** se muestra una alerta de error sin borrar los datos del formulario, para que el usuario pueda reintentar.

### 4.3. Consideración de seguridad

Toda variable `VITE_*` se incluye en el bundle público, así que cualquier persona puede ver la URL del webhook. El escenario de Make debe validar la estructura del payload antes de procesarlo.

---

## 5. Matriz de Casos de Prueba UI e Integración (TDD)

| ID | Componente / flujo | Escenario | Resultado esperado |
| --- | --- | --- | --- |
| `U-01` | `EventInfoBanner` | Renderizado inicial | Muestra las tarifas ($0, $4.500, $9.000) y las 4 reglas de transporte |
| `U-02` | `ParticipantStep` | Carga inicial del step 1 | El input `Nombre` tiene el foco (`document.activeElement`) |
| `U-03` | `RegistrationWizard` | Agregar un participante | Al pasar al step 2, el input `Nombre` recibe el foco |
| `U-04` | `RegistrationWizard` | Límite del grupo | Con 5 participantes, `Agregar otro participante` no está disponible |
| `U-05` | `EmailAutocompleteInput` | El usuario escribe `"juan@"` y hace clic en una opción | Se despliega la lista; al hacer clic, se completa el input y se cierra la lista |
| `U-06` | `PaymentStep` | Llegar al último step | Muestra el monto total correcto y **ningún input** tiene el foco |
| `U-07` | `PaymentStep` | Envío exitoso a Make | `POST` JSON con `amount`, `depositMadeBy`, `voucher` (data URL) y `participants`; muestra la pantalla de éxito |
| `U-08` | `PaymentStep` | Fallo de red en Make | Muestra un error y conserva los datos para reintentar |
| `U-09` | `RegistrationWizard` | Eliminar al participante 3 de 4 estando en su step | Quedan 3 participantes, el wizard muestra el participante 2 con el foco en `Nombre`, y el antiguo participante 4 conserva sus datos |
| `U-10` | `ParticipantStep` | Teléfono `"912345678"` y luego `blur` | El input muestra `"+56 9 1234 5678"` |
| `U-11` | `ParticipantStep` | RUT repetido en el participante 2 | Se muestra "Este RUT ya fue ingresado en este registro" y no se puede avanzar |
| `U-12` | `PaymentStep` | Adjuntar un archivo `.pdf` | Se muestra un error de tipo y no se puede finalizar |
| `U-13` | `PaymentStep` | Adjuntar una imagen de más de 5 MB | Se muestra un error de tamaño y no se puede finalizar |
| `U-14` | `ParticipantStep` | RUT `"269054298"` y luego `blur` | El input muestra `"26905429-8"` |

---

## 6. Criterios de Aceptación (Definition of Done)

1. Todos los tests de SPEC-001 y SPEC-002 (`U-01` a `U-14`) pasan en verde.
2. Los estilos se implementan **solo con Tailwind CSS** (sin CSS-in-JS ni Styled Components), con diseño responsivo *mobile-first*.
3. No hay valores hardcodeados: la URL del webhook se inyecta con `import.meta.env.VITE_MAKE_WEBHOOK_URL`.
