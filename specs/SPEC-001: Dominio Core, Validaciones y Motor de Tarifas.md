# SPEC-001: Dominio Core, Validaciones y Motor de Tarifas

* **Estado:** Actualizado para revisión (SDD), v2
* **Capa:** Lógica de dominio (TypeScript puro, desacoplado de React/UI y del DOM)
* **Metodología:** TDD (Vitest)

---

## 1. Tipos del Dominio

Los identificadores del código (tipos, campos y funciones) van en **inglés**. Los textos visibles para el usuario (labels y mensajes de error) y los valores de `Sex` van en español.

```ts
/** Values sent as-is to Make. */
export type Sex = 'femenino' | 'masculino'

export interface Participant {
  id: string                     // local identifier
  firstName: string
  lastName: string
  rut: string                    // as typed by the user; normalized on validation/submission
  sex: Sex | ''                  // '' = not selected
  age: number | null             // integer; null = not entered; under 1 year old = 0
  email: string                  // '' = empty
  phone: string                  // '' = empty
  needsTransport: boolean | null // null = not answered (required: explicit Yes / No)
  isPrincipal: boolean
}

export interface PaymentData {
  depositMadeBy: string
  voucher: File | null
}

export type ParticipantField = Exclude<keyof Participant, 'id' | 'isPrincipal'>
export type ParticipantErrors = Partial<Record<ParticipantField, string>>
```

* `needsTransport` es `boolean | null` porque el campo es obligatorio: el usuario debe elegir explícitamente **Sí** o **No**. Un checkbox desmarcado no cuenta como respuesta.
* `createEmptyParticipant(id: string, isPrincipal: boolean): Participant` crea un participante con todos los campos vacíos y sin respuestas preseleccionadas.

---

## 2. Motor de Tarifas

### 2.1. Tarifa por edad

* **Firma:** `getFare(age: number): number`
* **Reglas** (montos en CLP, enteros):

| Rango de edad | Tarifa |
| --- | --- |
| 0 a 5 años | `0` |
| 6 a 10 años | `4500` |
| 11 años en adelante | `9000` |

### 2.2. Resumen del registro

* **Firma:** `calculateRegistrationSummary(participants: Participant[]): RegistrationSummary`

```ts
export interface RegistrationSummary {
  items: { id: string; fullName: string; age: number; fare: number }[]
  total: number // integer CLP, sum of fares
}
```

* Se llama solo con participantes ya validados (`age` no nula).
* `fullName` = `getFullName(p)` = `` `${firstName.trim()} ${lastName.trim()}` ``.

---

## 3. Validaciones y Normalización

### 3.1. RUT chileno

* **Firmas:**
  * `normalizeRut(rut: string): string`: quita puntos, guiones y espacios, pasa la `k` a mayúscula y devuelve `"12345678-5"`.
  * `formatRut(rut: string): string`: formato de visualización **`26905429-8`** (sin puntos, con guion antes del dígito verificador). Si el usuario no escribió el guion, lo agrega (`"269054298"` → `"26905429-8"`). Formatea aunque el dígito verificador sea incorrecto, para que el error se entienda. Si la entrada no tiene forma de RUT (1 a 8 dígitos + dígito verificador), la devuelve sin cambios.
  * `validateRut(rut: string): boolean`
* **Reglas:**
  * Normaliza antes de validar.
  * Acepta como dígito verificador un número (`0-9`) o `K`/`k`.
  * Valida el dígito verificador con el algoritmo **Módulo 11**.
  * Retorna `false` si el RUT está vacío, tiene un largo inválido o el dígito verificador no coincide.

### 3.2. Correo electrónico

* **Firma:** `validateEmail(email: string): boolean`
* Valida la estructura estándar `usuario@dominio.ext`, sin espacios y con un dominio que tenga extensión.
* **Participante principal:** el correo es obligatorio y debe pasar `validateEmail`.
* **Participantes adicionales:** el correo es opcional. Si está vacío es válido; si tiene texto, debe pasar `validateEmail`.

### 3.3. Teléfono

* **Firmas:**
  * `normalizePhone(phone: string): string`: devuelve el formato canónico `+569XXXXXXXX`, sin espacios.
  * `formatPhone(phone: string): string`: devuelve el formato de visualización `+56 9 XXXX XXXX`.
  * `validatePhone(phone: string): boolean`
* **Reglas de normalización (autocompletado del `+56`):**
  * Quita espacios, guiones y paréntesis.
  * Si el número empieza con `9` y tiene 9 dígitos, antepone `+56` (`"912345678"` → `"+56912345678"`).
  * Si empieza con `56`, antepone `+` (`"56912345678"` → `"+56912345678"`).
  * Si ya empieza con `+56`, lo deja tal cual.
* **Validación:** después de normalizar, el número debe cumplir `/^\+569\d{8}$/`.
* **Obligatoriedad:** es obligatorio para el principal. Para los adicionales es opcional, con la misma regla que el correo (vacío es válido; si tiene texto, debe ser un teléfono válido).

### 3.4. Nombre y apellido

* Cada campo es obligatorio y se valida después de aplicar `trim()`.
* Largo: entre 1 y **250** caracteres.

### 3.5. Edad

* Obligatoria. Debe ser un **entero** entre `0` y `120`.
* A un menor de 1 año se le ingresa `0`.
* Se rechazan los decimales, los negativos y `null`.

### 3.6. Sexo

* Obligatorio. Valores permitidos: `'femenino'` o `'masculino'`.

### 3.7. Validación de participante

* **Firma:** `validateParticipant(p: Participant, otherRuts: string[]): ParticipantErrors`
* Devuelve un objeto con un mensaje en español por cada campo inválido. Un objeto vacío (`{}`) significa que el participante es válido.
* `otherRuts` son los RUT de los **demás** participantes del registro. Si `normalizeRut(p.rut)` coincide con alguno de ellos normalizado, el error de `rut` es `"Este RUT ya fue ingresado en este registro"`.
* El correo y el teléfono son obligatorios u opcionales según `p.isPrincipal`.
* `needsTransport === null` produce un error.

### 3.8. Voucher

* **Firma:** `validateVoucher(file: File | null): string | null`. Devuelve un mensaje de error, o `null` si el archivo es válido.
* Es obligatorio.
* Tipos permitidos: `image/png` e `image/jpeg` (extensiones `.png`, `.jpg`, `.jpeg`).
* Tamaño máximo: **5 MB** (`file.size <= 5 * 1024 * 1024` bytes), medido sobre el archivo original antes de codificarlo en base64. En base64 queda en unos ~6,7 MB.

---

## 4. Motor de Autocompletado de Correo

* **Firma:** `getEmailSuggestions(input: string, domains?: string[]): string[]`
* **Dominios por defecto:** `['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'live.com']`. Se pueden reemplazar por parámetro.
* **Reglas:**
  * Si el `input` no contiene `@`, retorna `[]`.
  * Si el `input` termina en `@` (`"juan@"`), retorna todos los dominios concatenados (`["juan@gmail.com", "juan@hotmail.com", ...]`).
  * Si el `input` tiene texto después del `@` (`"juan@gm"`), retorna solo los dominios que empiezan con ese prefijo.
  * Si el `input` ya coincide exactamente con una opción completa, retorna `[]`.
  * **No distingue mayúsculas:** el prefijo y la coincidencia exacta se comparan en minúsculas. La parte antes del `@` se conserva tal como la escribió el usuario (`"JOSE@GM"` → `["JOSE@gmail.com"]`).

---

## 5. Construcción del Payload para Make

* **Firma:** `buildMakePayload(participants: Participant[], payment: Pick<PaymentData, 'depositMadeBy'>, voucherDataUrl: string): MakePayload`
* Es una función pura. La conversión del `File` a data URL ocurre en la capa de infraestructura (SPEC-002 §4).

```ts
export interface MakePayload {
  amount: number          // integer CLP = calculateRegistrationSummary(...).total
  depositMadeBy: string   // payment.depositMadeBy.trim()
  voucher: string         // data URL: "data:image/png;base64,..." or "data:image/jpeg;base64,..."
  participants: {
    nameAndLastName: string       // getFullName(p)
    rut: string                   // normalizeRut → "12345678-5"
    age: number
    sex: Sex                      // 'femenino' | 'masculino'
    phone: string                 // normalizePhone → "+56912345678", or '' when empty
    email: string                 // trimmed, or '' when empty
    needsTransport: boolean
    is_contact_principal: boolean // = isPrincipal
  }[]
}
```

* El arreglo `participants` mantiene el orden del wizard, con el participante principal primero.

---

## 6. Matriz de Casos de Prueba (TDD)

| ID | Módulo | Escenario | Entrada | Resultado esperado |
| --- | --- | --- | --- | --- |
| `T-01` | Tarifa | Límite inferior gratis | `0` | `0` |
| `T-02` | Tarifa | Fin del tramo gratis | `5` | `0` |
| `T-03` | Tarifa | Inicio del tramo infantil | `6` | `4500` |
| `T-04` | Tarifa | Fin del tramo infantil | `10` | `4500` |
| `T-05` | Tarifa | Inicio del tramo adulto | `11` | `9000` |
| `T-06` | Resumen | Grupo mixto | edades `[35, 8, 3]` | `total = 13500`, 3 items con su tarifa |
| `V-01` | RUT | Válido con formato | `"12.345.678-5"` | `true` |
| `V-02` | RUT | Válido sin puntos ni guion y con `k` | `"10000013k"` | `true` |
| `V-03` | RUT | Dígito verificador incorrecto | `"12.345.678-9"` | `false` |
| `V-04` | RUT | Normalización | `"10.000.013-k"` | `"10000013-K"` |
| `V-23` | RUT | Formato sin guion | `"269054298"` / `"10000013k"` | `formatRut` → `"26905429-8"` / `"10000013-K"` |
| `V-24` | RUT | Formato con puntos o ya formateado | `"26.905.429-8"` / `"26905429-8"` | `"26905429-8"` |
| `V-05` | Email | Correo válido | `"usuario@gmail.com"` | `true` |
| `V-06` | Email | Correo mal formado | `"usuario@gmail"` / `"usuario@.com"` | `false` |
| `V-07` | Email | Adicional vacío vs. inválido | `""` / `"mal-correo"` | `""` es válido; `"mal-correo"` da error |
| `V-08` | Teléfono | Autocompletado del `+56` | `"9 1234 5678"` | `normalizePhone` → `"+56912345678"` |
| `V-09` | Teléfono | Ya trae `+56` | `"+56 9 1234 5678"` | `"+56912345678"`, válido |
| `V-10` | Teléfono | Número inválido | `"12345"` / `"+56 2 2123 4567"` | `false` |
| `V-11` | Teléfono | Principal vacío vs. adicional vacío | `""` | principal da error; adicional es válido |
| `V-12` | Nombre | Largo máximo | 250 chars / 251 chars | válido / error |
| `V-13` | Nombre | Solo espacios | `"   "` | error |
| `V-14` | Edad | Bebé menor de 1 año | `0` | válido |
| `V-15` | Edad | Decimal / negativo / nulo | `2.5` / `-1` / `null` | error |
| `V-16` | Sexo | Sin seleccionar | `''` | error |
| `V-17` | Participante | RUT duplicado en el registro | `rut "12.345.678-5"`, `otherRuts ["123456785"]` | error de `rut` |
| `V-18` | Participante | Transporte sin responder | `needsTransport: null` | error de `needsTransport` |
| `V-19` | Participante | Participante válido completo | todos los campos OK | `{}` |
| `V-20` | Voucher | Tipo permitido | `image/jpeg` | `null` |
| `V-21` | Voucher | Tipo no permitido / ausente | `application/pdf` / `null` | mensaje de error |
| `V-22` | Voucher | Límite de tamaño | `image/png` de exactamente 5 MB / de 5 MB + 1 byte | `null` / mensaje de error |
| `A-01` | Autocomplete | Sin `@` | `"jose"` | `[]` |
| `A-02` | Autocomplete | Recién escrito el `@` | `"jose@"` | todos los dominios (`"jose@gmail.com"`, `"jose@yahoo.com"`, …) |
| `A-03` | Autocomplete | Filtro parcial | `"jose@ya"` | `["jose@yahoo.com"]` |
| `A-04` | Autocomplete | Dominio ya completo | `"jose@gmail.com"` | `[]` |
| `A-05` | Autocomplete | Mayúsculas | `"JOSE@GM"` | `["JOSE@gmail.com"]` |
| `P-01` | Payload | Mapeo completo | principal + 1 adicional sin correo ni teléfono | claves `amount`, `depositMadeBy`, `voucher`, `participants`; el adicional va con `email: ''`, `phone: ''` y `is_contact_principal: false` |
| `P-02` | Payload | Normalización en el envío | rut `"12.345.678-5"`, teléfono `"912345678"` | `rut: "12345678-5"`, `phone: "+56912345678"` |

> Nota: los IDs se renumeraron respecto del anexo anterior, cuyo `V-12` a `V-17` pasó a `V-01` a `V-07`. El antiguo `V-13` (`"11111111k"`) era un RUT inválido: el dígito verificador de 11.111.111 es `1`. Se reemplazó por `"10000013k"`.

---

## 7. Reglas de UI/UX

Las reglas de interacción (auto-focus, dropdown de correo, formato del teléfono al salir del campo y navegación al eliminar participantes) se especifican únicamente en **SPEC-002 §3**.
