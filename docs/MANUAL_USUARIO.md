# SEEDU Motor Fine - Manual de Usuario

## 👤 Guía de Funcionalidades

**Versión:** 2.0.0  
**Última actualización:** Diciembre 2025  
**Público objetivo:** Evaluadores y profesionales de educación especial

---

## 📋 Índice

1. [Introducción](#1-introducción)
2. [Primeros Pasos](#2-primeros-pasos)
3. [Gestión de Niños](#3-gestión-de-niños)
4. [Realizar Evaluaciones](#4-realizar-evaluaciones)
5. [Visualizar Reportes](#5-visualizar-reportes)
6. [Perfil de Usuario](#6-perfil-de-usuario)
7. [Preguntas Frecuentes](#7-preguntas-frecuentes)

---

---

## 1. Introducción

### 1.1 ¿Qué es SEEDU Motor Fine?

SEEDU Motor Fine es una herramienta profesional para la evaluación del desarrollo motor fino en niños, que incluye:

- **8 pruebas estandarizadas** de motricidad fina
- **Análisis automático** de resultados
- **Generación de reportes** en múltiples formatos
- **Seguimiento** del progreso de cada niño

![Pantalla principal del sistema]
*Captura de la pantalla principal mostrando el dashboard con estadísticas*

### 1.2 Acceso al Sistema

**Requisitos técnicos:**
- Navegador web actualizado (Chrome, Firefox o Edge)
- Conexión a internet estable
- Resolución mínima recomendada: 1280x720px

**Niveles de acceso:**
1. **Administradores**: Acceso completo al sistema
2. **Evaluadores**: Gestión de niños y evaluaciones
3. **Visualizadores**: Solo lectura de reportes

---

## 2. Primeros Pasos

### 2.1 Inicio de Sesión

1. Abra su navegador web
2. Ingrese a la URL: `https://seedumotorfine.netlify.app/`
3. Complete el formulario de acceso:
   - Correo electrónico
   - Contraseña

![Pantalla de inicio de sesión]
*Formulario de inicio de sesión con campos de usuario y contraseña*

### 2.2 Recuperación de Contraseña

1. Haga clic en "¿Olvidó su contraseña?"
2. Ingrese su correo electrónico
3. Siga las instrucciones que recibirá por correo
4. Establezca una nueva contraseña

> ⚠️ **Importante:** El enlace de recuperación tiene una validez de 24 horas

### 2.3 Registro de Nuevo Usuario

Si es su primera vez usando el sistema:

1. En la página de inicio de sesión, haga clic en **"Registrarse"**
2. Complete el formulario con:
   - **Correo electrónico** (será su usuario)
   - **Contraseña** (mínimo 6 caracteres)
   - **Institución educativa**
3. Haga clic en **"Registrarse"**
4. Recibirá un correo de confirmación

### 2.4 Panel Principal (Dashboard)

Al iniciar sesión, accederá al panel principal que muestra:

- **Resumen de actividad reciente**
- **Estadísticas clave** (niños registrados, evaluaciones)
- **Accesos rápidos** a funciones principales

![Vista del Dashboard]
*Panel de control principal con estadísticas y accesos directos*

**Elementos principales:**
1. **Menú lateral**: Navegación entre secciones
2. **Barra superior**: Búsqueda y perfil de usuario
3. **Área de trabajo**: Contenido principal

---

## 3. Gestión de Niños

### 3.1 Lista de Niños

1. En el menú lateral, seleccione **"Niños"**
2. Visualice la lista completa de niños registrados
3. Utilice los filtros para:
   - Buscar por nombre
   - Filtrar por edad o escuela
   - Ordenar por fecha de registro

![Lista de niños registrados]
*Vista de la lista de niños con opciones de búsqueda y filtrado*

### 3.2 Agregar Nuevo Niño

1. Haga clic en **"+ Agregar Niño"**
2. Complete el formulario con:

   | Campo | Obligatorio | Descripción |
   |-------|-------------|-------------|
   | Nombre completo | Sí | Nombre y apellidos |
   | Fecha de nacimiento | Sí | Formato DD/MM/AAAA |
   | Género | No | Selección de lista desplegable |
   | Grado escolar | No | Ej: Preescolar, 1° Básico |
   | Escuela | No | Nombre de la institución |
   | Observaciones | No | Información adicional |

3. Haga clic en **"Guardar"**
4. Recibirá confirmación del registro exitoso

### 3.3 Editar Información

1. En la lista de niños, busque el perfil a modificar
2. Haga clic en **"Editar"** (ícono de lápiz)
3. Realice los cambios necesarios
4. Guarde los cambios con **"Actualizar"**

> 🔄 **Nota:** Los cambios se reflejarán en todas las evaluaciones asociadas

### 3.4 Eliminar Registro

1. Localice al niño en la lista
2. Haga clic en **"Eliminar"** (ícono de papelera)
3. Confirme la acción en el cuadro de diálogo

> ⚠️ **Importante:** Esta acción es irreversible y eliminará:
> - Todas las evaluaciones asociadas
> - Historial de progreso
> - Documentos adjuntos

### 3.5 Exportar Datos

1. Seleccione los niños a exportar
2. Haga clic en **"Exportar"**
3. Elija el formato:
   - Excel (.xlsx)
   - PDF
   - CSV

![Opciones de exportación]
*Menú de exportación mostrando los formatos disponibles*

---

## 4. Realizar Evaluaciones

### 4.1 Tipos de Pruebas

El sistema incluye 8 pruebas estandarizadas:

| # | Nombre | Descripción | Material Necesario |
|---|--------|-------------|-------------------|
| 1 | Coordinación óculo-manual | Habilidad para coordinar vista y manos | Pelotas, aros |
| 2 | Precisión motriz | Control en movimientos finos | Lápices, plantillas |
| 3 | Control de presión | Manejo de la fuerza aplicada | Hojas, lápices de colores |
| 4 | Destreza digital | Movimientos independientes de dedos | Cuentas, hilo |
| 5 | Coordinación bimanual | Uso coordinado de ambas manos | Tijeras, papel |
| 6 | Velocidad de ejecución | Rapidez en tareas motrices | Cronómetro, plantillas |
| 7 | Precisión en recorte | Habilidad con tijeras | Tijeras, plantillas |
| 8 | Grafomotricidad | Control en trazos escritos | Lápiz, papel |

![Ejemplo de prueba de motricidad]
*Ejemplo de plantilla para evaluación de coordinación óculo-manual*

### 4.2 Crear una Nueva Evaluación

**Pasos completos:**

1. Vaya a la sección **"Evaluaciones"**
2. Haga clic en **"+ Nueva Evaluación"**
3. **Seleccione el niño** de la lista desplegable
4. Complete las 8 pruebas:
   - Ingrese la **puntuación** (0-10) para cada prueba
   - Añada **observaciones específicas** de cada prueba (opcional pero recomendado)
5. Agregue **observaciones generales** de la sesión (opcional)
6. Revise todos los datos
7. Haga clic en **"Guardar Evaluación"**

### 4.3 Análisis Automático con IA

Inmediatamente después de guardar:

1. El sistema **analiza automáticamente** los resultados
2. Clasifica el nivel de desarrollo en:
   - **Alto** (8-10 puntos promedio)
   - **Medio** (5-7 puntos promedio)
   - **Bajo** (0-4 puntos promedio)
3. Genera **recomendaciones personalizadas**
4. Calcula un **nivel de confianza** del análisis

> 🤖 **IA trabajando:** El análisis tarda aproximadamente 2-3 segundos

### 4.4 Ver Evaluaciones Anteriores

1. En la sección "Evaluaciones", verá la lista de todas las evaluaciones
2. **Filtros disponibles:**
   - Por nombre de niño
   - Por fecha de evaluación
   - Por clasificación (Alto/Medio/Bajo)
3. Haga clic en una evaluación para ver los detalles completos

### 4.5 Editar una Evaluación

> ℹ️ **Nota:** Al editar, el análisis de IA se recalculará automáticamente

**Pasos:**
1. Localice la evaluación en la lista
2. Haga clic en **"Editar"**
3. Modifique las puntuaciones u observaciones necesarias
4. Haga clic en **"Guardar Cambios"**
5. El sistema regenerará el análisis de IA

---

## 5. Visualizar Reportes

### 5.1 Acceder a los Reportes

1. Vaya a la sección **"Reportes"**
2. Seleccione un niño de la lista
3. Seleccione una evaluación específica
4. Verá el reporte completo en pantalla

### 5.2 Contenido del Reporte

El reporte incluye:

**1. Información del Niño:**
- Nombre completo
- Edad
- Grado escolar
- Fecha de evaluación

**2. Resultados por Prueba:**
- Tabla con las 8 puntuaciones
- Observaciones específicas de cada prueba

**3. Visualización Gráfica:**
- Gráfico de barras con las puntuaciones
- Gráfico de radar comparativo

**4. Análisis de IA:**
- Clasificación del nivel de desarrollo
- Porcentaje de confianza del análisis
- Recomendaciones personalizadas detalladas

**5. Observaciones Generales:**
- Comentarios del evaluador sobre la sesión

### 5.3 Exportar Reporte a PDF

**Pasos para generar PDF:**

1. Con el reporte abierto, haga clic en **"Descargar PDF"**
2. El sistema generará el documento profesional
3. Se descargará automáticamente a su carpeta de descargas
4. El PDF incluye:
   - Encabezado con logo institucional
   - Toda la información del reporte
   - Gráficos en alta calidad
   - Espacio para firma del evaluador

**Nombre del archivo:** `Evaluacion_[NombreNiño]_[Fecha].pdf`

### 5.4 Exportar Datos a Excel

Para análisis estadístico más profundo:

1. En la sección "Reportes", haga clic en **"Exportar a Excel"**
2. Seleccione el rango de fechas (opcional)
3. Seleccione los niños a incluir (o todos)
4. Haga clic en **"Generar Excel"**
5. Se descargará un archivo `.xlsx` con:
   - Hoja 1: Datos de los niños
   - Hoja 2: Todas las evaluaciones
   - Hoja 3: Análisis de IA
   - Formato tabla para análisis de datos

### 5.5 Comparar Evaluaciones

Para ver el progreso de un niño a lo largo del tiempo:

1. En "Reportes", seleccione un niño
2. Haga clic en **"Comparar Evaluaciones"**
3. Seleccione 2 o más evaluaciones
4. Verá:
   - Gráficos comparativos
   - Evolución de puntuaciones
   - Cambios en clasificación de IA
   - Análisis de progreso

---

## 6. Perfil de Usuario

### 6.1 Ver y Editar Perfil

1. Haga clic en el **ícono de usuario** (esquina superior derecha)
2. Seleccione **"Mi Perfil"**
3. Verá su información:
   - Nombre completo
   - Correo electrónico
   - Institución
   - Rol (Evaluador/Administrador)

### 6.2 Actualizar Información Personal

1. En la página de perfil, haga clic en **"Editar"**
2. Modifique los campos:
   - Nombre completo
   - Institución
3. Haga clic en **"Guardar Cambios"**

> ℹ️ **Nota:** El correo electrónico no se puede cambiar desde aquí

### 6.3 Cambiar Contraseña

1. En el perfil, haga clic en **"Cambiar Contraseña"**
2. Ingrese:
   - Contraseña actual
   - Nueva contraseña (mínimo 6 caracteres)
   - Confirmar nueva contraseña
3. Haga clic en **"Actualizar Contraseña"**

### 6.4 Cerrar Sesión

1. Haga clic en el ícono de usuario
2. Seleccione **"Cerrar Sesión"**
3. Será redirigido a la página de inicio de sesión

---

## 7. Preguntas Frecuentes

### 7.1 Sobre el Sistema

**P: ¿Puedo usar el sistema en mi tablet o celular?**  
R: Sí, el sistema es completamente responsive y funciona en dispositivos móviles y tablets.

**P: ¿Se guardan automáticamente los cambios?**  
R: No, debe hacer clic en "Guardar" para que los cambios se registren en el sistema.

**P: ¿Puedo ver los datos de otros evaluadores?**  
R: No, por seguridad y privacidad, cada evaluador solo ve sus propios datos.

### 7.2 Sobre Evaluaciones

**P: ¿Puedo pausar una evaluación y continuarla después?**  
R: No, debe completar la evaluación en una sola sesión. Sin embargo, puede guardar como borrador (próximamente).

**P: ¿Qué pasa si me equivoco en una puntuación?**  
R: Puede editar la evaluación en cualquier momento. El análisis de IA se recalculará automáticamente.

**P: ¿Cuántas evaluaciones puedo hacer al mismo niño?**  
R: Ilimitadas. Se recomienda realizar evaluaciones periódicas (cada 3-6 meses) para seguimiento.

**P: ¿Qué significa el porcentaje de confianza?**  
R: Indica qué tan seguro está el sistema de IA sobre su clasificación. Un 95% significa alta confianza.

### 7.3 Sobre Reportes

**P: ¿Los reportes PDF incluyen gráficos?**  
R: Sí, incluyen todos los gráficos y tablas visibles en pantalla.

**P: ¿Puedo personalizar el diseño del PDF?**  
R: Por ahora no, pero está en el roadmap de futuras versiones.

**P: ¿Puedo imprimir los reportes?**  
R: Sí, puede usar la función de impresión del navegador o imprimir el PDF descargado.

### 7.4 Soporte Técnico

**P: ¿Qué hago si olvidé mi contraseña?**  
R: Contacte al administrador del sistema para que la restablezca.

**P: ¿Qué hago si encuentro un error?**  
R: Tome captura de pantalla y contacte al administrador del sistema con los detalles.

**P: ¿Mis datos están seguros?**  
R: Sí, el sistema usa Row Level Security (RLS) y encriptación. Solo usted puede acceder a sus datos.

---

## 8. Consejos y Mejores Prácticas

### 8.1 Para Realizar Evaluaciones de Calidad

✅ **HACER:**
- Crear un ambiente tranquilo y cómodo para el niño
- Explicar claramente cada prueba antes de comenzar
- Registrar observaciones detalladas durante la evaluación
- Completar la evaluación el mismo día de la aplicación
- Revisar todos los datos antes de guardar

❌ **EVITAR:**
- Realizar evaluaciones cuando el niño está cansado o enfermo
- Apresurarse en las pruebas
- Olvidar registrar observaciones importantes
- Comparar en voz alta con otros niños

### 8.2 Para Interpretar Resultados

- El análisis de IA es una **herramienta de apoyo**, no un diagnóstico
- Considere siempre el **contexto del niño** (edad, desarrollo, condiciones)
- Use las recomendaciones como **punto de partida**, no como receta
- Combine los resultados con su **experiencia profesional**
- Realice **seguimiento periódico** para ver evolución

### 8.3 Para Aprovechar el Sistema al Máximo

- Registre todos los niños con los que trabaja
- Realice evaluaciones periódicas (trimestral o semestralmente)
- Use la función de comparación para ver progreso
- Exporte datos a Excel para análisis institucional
- Mantenga su perfil actualizado

---

## 9. Glosario de Términos

| Término | Definición |
|---------|------------|
| **Motricidad Fina** | Habilidad de realizar movimientos precisos con músculos pequeños (manos, dedos) |
| **Evaluación** | Aplicación de las 8 pruebas estandarizadas a un niño |
| **Clasificación IA** | Categorización automática del nivel de desarrollo (Alto/Medio/Bajo) |
| **Confianza** | Porcentaje de certeza del sistema sobre su análisis |
| **Estilo de Aprendizaje** | Preferencia en la forma de procesar y aprender información |
| **Dashboard** | Panel principal con resumen de estadísticas |
| **RLS** | Row Level Security - Sistema de seguridad que protege los datos |

---

## 10. Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| `Ctrl + S` | Guardar (en formularios) |
| `Esc` | Cerrar diálogo/modal |
| `Tab` | Navegar entre campos |
| `Enter` | Confirmar acción |

---

## 11. Contacto y Soporte

**Para soporte técnico:**
- Consulte la documentación técnica
- Contacte al administrador de su institución

**Para sugerencias:**
- Envíe sus ideas de mejora al equipo de desarrollo

---

## Anexo: Checklist de Evaluación

### Antes de la Evaluación

- [ ] Verificar que el niño esté en condiciones óptimas (descansado, alimentado)
- [ ] Preparar materiales necesarios para las 8 pruebas
- [ ] Asegurar un espacio tranquilo y sin distracciones
- [ ] Tener acceso al sistema con sesión iniciada
- [ ] Verificar que la información del niño está actualizada en el sistema

### Durante la Evaluación

- [ ] Explicar claramente cada prueba antes de comenzar
- [ ] Observar y registrar comportamientos relevantes
- [ ] Mantener un ambiente positivo y motivador
- [ ] Registrar puntuaciones objetivas basadas en criterios establecidos
- [ ] Anotar observaciones específicas de cada prueba

### Después de la Evaluación

- [ ] Ingresar todos los datos al sistema inmediatamente
- [ ] Revisar que todas las puntuaciones estén correctas
- [ ] Agregar observaciones generales de la sesión
- [ ] Verificar que el análisis de IA se haya generado
- [ ] Generar y descargar el reporte PDF
- [ ] Archivar el reporte en el expediente del niño

---

**¡Gracias por usar SEEDU Motor Fine!**

Este manual será actualizado periódicamente. Versión actual: 1.0.0 - Noviembre 2025
