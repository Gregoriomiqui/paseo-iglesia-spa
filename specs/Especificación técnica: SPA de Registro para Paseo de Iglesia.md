# Especificación Técnica (Spec v1.0): SPA de Registro para Paseo de Iglesia

## 1. Resumen Ejecutivo y Alcance

Desarrollo de una **Single Page Application (SPA)** para agilizar el proceso de inscripción y registro de un paseo de iglesia.

* **Volumen estimado de asistentes:** Entre 150 y 200 personas (con estimación inicial de 250 a 300), estableciendo un máximo proyectado de 250 personas.


* **Objetivo principal:** Permitir que un participante principal registre a su grupo familiar en un flujo por pasos (*multi-step*), calcular automáticamente el monto total según edades, adjuntar el comprobante de pago y enviar los datos a una automatización externa para validación y emisión de entrada digital.



---

## 2. Stack Tecnológico y Metodología

* **Core Frontend:** React con TypeScript y Vite.js.


* **Estilos (CSS):** Tailwind CSS (único sistema de estilos).


* **Estándares:** Buenas prácticas de programación y estilo de programación moderno.


* **Metodologías obligatorias:**
* **SDD (Spec-Driven Development):** Cada funcionalidad debe pasar primero por un *spec* y ser revisada antes de implementarse.


* **TDD (Test-Driven Development):** Desarrollo guiado por pruebas.





---

## 3. Reglas de Negocio y Avisos Obligatorios en UI

La SPA debe mostrar de forma visible (en la parte superior o en una sección dedicada del formulario) la siguiente información general:

### 3.1. Estructura de Tarifas por Edad

La aplicación debe calcular automáticamente el monto total a pagar al finalizar el registro según la edad de cada participante:

| Rango de Edad | Valor por Participante |
| --- | --- |
| 0 a 5 años | $0 (No pagan)

 |
| 6 a 10 años | $4.500 pesos

 |
| 11 años en adelante | $9.000 pesos |

### 3.2. Condiciones de Transporte (Buses de Acercamiento)

La página debe indicar explícitamente las siguientes reglas:

* **Menores de 2 años:** Viajarán en brazos en los buses de acercamiento en caso de que el bus vaya lleno (*full*). En ese escenario, los padres o apoderados deben ceder el asiento del menor y llevarlo en brazos.


* **Trayecto de ida:** El bus saldrá únicamente desde la iglesia, no tendrá paradas en el camino y llegará directo al recinto.


* **Horarios:** La hora fijada será comunicada posteriormente durante los servicios de la iglesia previos al evento/paseo. La hora de salida también se comunicará el mismo día o un día antes de la salida.


* **Trayecto de regreso:** No habrá paradas intermedias; la única parada de regreso será en la iglesia.



---

## 4. Especificación Funcional y Flujo del Formulario (Multi-Step)

El formulario se estructurará en múltiples pasos (*steps*) por participante, permitiendo la inscripción de un grupo familiar.

### 4.1. Restricciones de Participantes

* **Límite por inscripción:** Máximo 5 participantes por registro.


* **Participante Principal:** Debe existir obligatoriamente una persona designada como principal, quien realiza el registro.



### 4.2. Campos por Participante y Reglas de Obligatoriedad

| Campo | Participante Principal | Participantes Adicionales (hasta 4) |
| --- | --- | --- |
| **Nombre**

 | Obligatorio

 | Obligatorio

 |
| **Apellido**

 | Obligatorio

 | Obligatorio

 |
| **RUT**

 | Obligatorio

 | Obligatorio

 |
| **Sexo**

 | Obligatorio

 | Obligatorio

 |
| **Edad**

 | Obligatorio

 | Obligatorio

 |
| **Correo electrónico**

 | **Obligatorio** (único correo principal al que llegará toda la información) | **Opcional** |
| **Número telefónico**

 | **Obligatorio** (contacto principal) | **Opcional** |
| **Requerimiento de transporte**

 | Obligatorio (indicar si necesita transporte)

 | Obligatorio (indicar si necesita transporte)

 |

### 4.3. Cálculo y Resumen

* Al finalizar el ingreso de los participantes, la SPA debe mostrar el cálculo automático del monto total a pagar según las edades registradas.



### 4.4. Último Step: Pago y Comprobante

El paso final del formulario debe incluir:

* **Persona depositante:** Campo obligatorio para indicar quién realizó el depósito.


* **Voucher / Comprobante de pago:** Campo para adjuntar el comprobante de pago como imagen (PNG, JPG o JPEG). Se envía a Make codificado en base64 (ver SPEC-002 §4).



---

## 5. Integración y Flujo de Procesamiento (Backend / Make)

Toda la información capturada por la SPA se enviará a una **API de Make**, donde se ejecutará el siguiente flujo:

1. **Validación de Pago:** Procesamiento y validación del pago/voucher mediante Inteligencia Artificial.


2. **Persistencia:** Registro de las inscripciones en una hoja de cálculo de **Google Sheets**.


3. **Generación de Código QR:** Creación de un código QR asociado a la inscripción del lote de personas registradas.


4. **Confirmación Digital:** Una vez efectuado y validado el pago/voucher y confirmada la inscripción, se enviará al correo electrónico principal el mensaje con la entrada digital y el código QR.



