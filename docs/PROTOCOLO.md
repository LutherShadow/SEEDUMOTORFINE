# PROTOCOLO DE INVESTIGACIÓN

# Sistema de Evaluación del Desarrollo Motriz Fino y Estilos de Aprendizaje en Infantes de Preescolar mediante Inteligencia Artificial

---

## INFORMACIÓN GENERAL

### Título del Proyecto
**Desarrollo y Validación de un Sistema Web Basado en Inteligencia Artificial para la Evaluación Integral del Desarrollo Motriz Fino y Estilos de Aprendizaje en Población Infantil de Educación Preescolar**

### Título Corto
**SEEDU Motor Fine: Sistema de Evaluación Psicopedagógica Asistida por IA**

### Acrónimo del Proyecto
**SEEDU-MF**

### Número de Protocolo
**ITSZ-INF-2025-001**

### Versión del Protocolo
**Versión 2.0 - Fecha: 17 de Noviembre de 2025**

### Investigador Principal
- **Nombre:** José Antonio Mercado Santiago
- **Afiliación:** Instituto Tecnológico Superior de Zacapoaxtla
- **Programa:** Ingeniería Informática
- **Número de Control:** 21ZP0024
- **Correo:** joseantonio.mercado@itsz.edu.mx

### Asesor Académico
- **Nombre:** José Miguel Méndez Alonso
- **Afiliación:** Instituto Tecnológico Superior de Zacapoaxtla
- **Correo:** miguel.mendez@itsz.edu.mx

### Institución Responsable
**Instituto Tecnológico Superior de Zacapoaxtla**
- Carretera Acuaco-Zacapoaxtla Km. 8, Col. Totoltepec
- Zacapoaxtla, Puebla, C.P. 73680
- Teléfono: (797) 975 0517

### Fecha de Inicio
18 de Agosto de 2025

### Fecha de Finalización Estimada
18 de Diciembre de 2025

### Tipo de Estudio
- Investigación aplicada en tecnología educativa
- Desarrollo de software con validación piloto
- Estudio cuasi-experimental de usabilidad y efectividad

---

## I. RACIONAL Y ANTECEDENTES

### 1.1 Planteamiento del Problema

El desarrollo motriz fino durante la etapa preescolar (3-6 años) es un predictor crítico del éxito académico futuro, especialmente en actividades que requieren coordinación mano-ojo, destreza manual y precisión de movimientos. Las deficiencias en este ámbito pueden derivar en:

- Dificultades en el aprendizaje de la escritura
- Baja autoestima por frustración en actividades manuales
- Rezago en habilidades artísticas y expresivas
- Problemas de atención y concentración

Sin embargo, la evaluación sistemática del desarrollo motriz fino enfrenta múltiples desafíos:

1. **Sobrecarga laboral docente:** Ratios de 25-30 alumnos por educador dificultan el seguimiento individualizado
2. **Subjetividad en la evaluación:** Variabilidad inter-evaluador en la interpretación de desempeño
3. **Fragmentación de información:** Datos dispersos en formatos no digitales
4. **Ausencia de análisis longitudinal:** Dificultad para rastrear progreso a lo largo del tiempo
5. **Desconexión entre evaluación motriz y pedagógica:** Falta de integración con estilos de aprendizaje y hábitos de estudio

Además, los instrumentos de evaluación tradicionales (como el Test de Beery-VMI o el TVPS) requieren:
- Capacitación especializada para su aplicación
- Costos de adquisición elevados
- Tiempo extenso de aplicación y calificación manual

Estos factores limitan el acceso a herramientas de evaluación de calidad, especialmente en contextos educativos con recursos limitados.

### 1.2 Revisión de Literatura

#### Desarrollo Motriz Fino en Preescolar

Diversos estudios han demostrado la importancia del desarrollo motriz fino:

- **Gesell (1940)** estableció escalas de desarrollo motor que siguen siendo referencia en pediatría
- **Piaget (1952)** vinculó el desarrollo motor con el desarrollo cognitivo durante el período preoperacional
- **Beery & Beery (2010)** desarrollaron el Test VMI (Visual-Motor Integration) ampliamente utilizado

Investigaciones recientes destacan:
- Correlación entre habilidades motrices finas a los 5 años y desempeño en matemáticas y lectura a los 8 años (Cameron et al., 2012)
- Impacto de intervenciones tempranas en motricidad sobre el rendimiento académico (Carlson et al., 2008)

#### Estilos de Aprendizaje y Cuestionarios Psicopedagógicos

El concepto de estilos de aprendizaje, aunque debatido, sigue siendo relevante en la práctica educativa:

- **Kolb (1984):** Modelo de aprendizaje experiencial
- **Honey & Mumford (1992):** Cuestionario CHAEA adaptado por Alonso et al. para contexto hispanohablante
- **Pauk (2010):** Sistema Cornell de toma de notas como estrategia metacognitiva
- **Davis (1989):** Modelo TAM (Technology Acceptance Model) para evaluación de aceptación tecnológica

Estos instrumentos han sido validados en múltiples poblaciones y contextos educativos.

#### Inteligencia Artificial en Evaluación Educativa

La aplicación de IA en educación ha crecido exponencialmente:

- **Sistemas de tutoría inteligente (ITS):** Personalización adaptativa del aprendizaje
- **Learning Analytics:** Análisis predictivo de deserción y rendimiento
- **Clasificación automática:** Evaluación asistida por ML de ensayos y respuestas abiertas
- **Sistemas de recomendación:** Sugerencias pedagógicas basadas en perfiles de estudiantes

Sin embargo, existe una brecha en la aplicación de IA específicamente en evaluación de desarrollo motriz en edades tempranas.

### 1.3 Justificación

El presente proyecto se justifica por:

1. **Necesidad social:** Democratizar el acceso a herramientas profesionales de evaluación psicopedagógica
2. **Innovación tecnológica:** Aplicar IA en un dominio poco explorado (desarrollo motriz infantil)
3. **Impacto pedagógico:** Facilitar intervenciones tempranas y personalizadas
4. **Escalabilidad:** Solución cloud-native accesible desde cualquier dispositivo
5. **Costo-beneficio:** Alternativa asequible frente a instrumentos comerciales
6. **Base para investigación:** Generación de datasets estructurados para estudios longitudinales

### 1.4 Objetivos

#### Objetivo General

Diseñar, desarrollar, implementar y validar un sistema web integral basado en tecnologías modernas (React, Supabase) e Inteligencia Artificial que permita a profesionales de la educación y la psicopedagogía realizar evaluaciones estandarizadas del desarrollo motriz fino en infantes de preescolar, aplicar cuestionarios psicopedagógicos validados (Cornell, CHAEA, TAM), y generar análisis automatizados con recomendaciones personalizadas para la toma de decisiones pedagógicas.

#### Objetivos Específicos

**Desarrollo Tecnológico:**
1. Implementar un sistema de gestión de perfiles de infantes con datos demográficos y académicos
2. Desarrollar módulo de evaluación de 8 actividades motrices estandarizadas con puntuación 0-10
3. Integrar 3 cuestionarios psicopedagógicos estandarizados (208 preguntas totales)
4. Diseñar y entrenar modelo de clasificación supervisada para categorizar nivel de desarrollo motriz
5. Implementar Edge Functions para generación de recomendaciones personalizadas mediante IA
6. Desarrollar sistema de reportes profesionales (PDF/Excel)
7. Crear funcionalidad de seguimiento longitudinal con comparación de intervalos

**Validación:**
8. Evaluar la usabilidad del sistema mediante pruebas con usuarios reales (psicopedagogos, educadores)
9. Medir la precisión del modelo de IA en la clasificación de nivel de desarrollo motriz
10. Analizar el impacto del sistema en la eficiencia del proceso de evaluación

**Transferencia:**
11. Documentar técnica y pedagógicamente el sistema para facilitar su adopción
12. Capacitar a usuarios piloto en el uso efectivo de la plataforma

### 1.5 Hipótesis

**H1:** El sistema SEEDU Motor Fine reduce significativamente el tiempo requerido para realizar evaluaciones del desarrollo motriz fino en comparación con métodos tradicionales (reducción esperada ≥30%).

**H2:** El modelo de clasificación por IA alcanza una precisión (accuracy) ≥80% en la categorización del nivel de desarrollo motriz (Alto, Medio, Bajo).

**H3:** Los usuarios perciben el sistema como fácil de usar (puntuación SUS ≥70) y útil para su práctica profesional (≥80% de intención de uso continuo).

**H4:** Las recomendaciones generadas por IA son valoradas como pertinentes y aplicables por al menos el 75% de los usuarios.

---

## II. DISEÑO DEL ESTUDIO

### 2.1 Tipo de Estudio

- **Fase 1 (Desarrollo):** Investigación aplicada con metodología ágil (Scrum)
- **Fase 2 (Validación):** Estudio cuasi-experimental pre-post sin grupo control
- **Enfoque:** Mixto (cuantitativo y cualitativo)

### 2.2 Población de Estudio

#### Usuarios del Sistema (Evaluadores)
- **Población objetivo:** Psicopedagogos, educadores preescolares, estudiantes de psicopedagogía
- **Criterios de inclusión:**
  - Título o formación en psicología, pedagogía, educación o áreas afines
  - Experiencia mínima de 1 año en evaluación infantil (profesionales) o estar cursando prácticas (estudiantes)
  - Acceso a internet y dispositivo (computadora/tablet)
  - Consentimiento informado para participar en el estudio de validación

- **Criterios de exclusión:**
  - Usuarios sin formación pedagógica o psicopedagógica
  - Imposibilidad de asistir a sesión de capacitación inicial

- **Tamaño de muestra (Fase de validación):** 15-20 usuarios

#### Sujetos Evaluados (Infantes)
- **Población objetivo:** Infantes de 3 a 6 años en educación preescolar
- **Criterios de inclusión:**
  - Edad entre 3 años 0 meses y 6 años 11 meses
  - Matrícula activa en institución de educación preescolar
  - Consentimiento informado de padres/tutores
  - Asentimiento verbal del infante (cuando sea posible por edad)

- **Criterios de exclusión:**
  - Diagnóstico previo de discapacidad motora severa que impida realizar las actividades
  - Condiciones médicas que contraindiquen la evaluación según criterio médico

- **Tamaño de muestra:** Al menos 100 infantes evaluados durante la fase piloto

### 2.3 Duración del Estudio

- **Fase de desarrollo:** 8 semanas (Agosto-Octubre 2025)
- **Fase de validación piloto:** 4 semanas (Octubre-Noviembre 2025)
- **Análisis de resultados:** 2 semanas (Diciembre 2025)
- **Duración total:** 14 semanas aproximadamente

### 2.4 Variables del Estudio

#### Variables Independientes
- Uso del sistema SEEDU Motor Fine vs. método tradicional
- Características del usuario (experiencia, formación)
- Características del infante (edad, género, contexto socioeconómico)

#### Variables Dependientes

**Eficiencia del proceso:**
- Tiempo de evaluación por infante (minutos)
- Tiempo de generación de reporte (minutos)
- Número de evaluaciones completadas por sesión

**Usabilidad del sistema:**
- Puntuación en System Usability Scale (SUS)
- Facilidad de uso percibida (escala Likert 1-5)
- Satisfacción del usuario (escala Likert 1-5)

**Precisión del modelo de IA:**
- Accuracy, Precision, Recall, F1-Score
- Matriz de confusión
- Concordancia con clasificación de expertos (Kappa de Cohen)

**Utilidad pedagógica:**
- Pertinencia de recomendaciones (escala Likert 1-5)
- Aplicabilidad de sugerencias (escala Likert 1-5)
- Intención de uso continuo (%)

**Desempeño motriz del infante:**
- Puntuación por actividad (0-10)
- Puntuación total (0-80)
- Clasificación del nivel (Alto/Medio/Bajo)

#### Variables de Control
- Entorno de evaluación (presencial/remoto)
- Dispositivo utilizado (computadora/tablet)
- Conectividad a internet

---

## III. METODOLOGÍA DE INTERVENCIÓN

### 3.1 Desarrollo del Sistema

#### Stack Tecnológico

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS + Shadcn/ui
- React Router, React Hook Form, Zod
- Recharts, jsPDF, XLSX

**Backend:**
- Supabase (PostgreSQL + Edge Functions)
- Row Level Security (RLS)
- Supabase Auth
- Real-time subscriptions

**Machine Learning:**
- Algoritmo: Random Forest / SVM
- Training: Python + scikit-learn
- Deployment: Edge Functions (Deno)

#### Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (React)                   │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │  Dashboard  │ │  Evaluations │ │ Questionnaires│  │
│  └─────────────┘ └──────────────┘ └──────────────┘  │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │   Reports   │ │   Children   │ │    Profile   │  │
│  └─────────────┘ └──────────────┘ └──────────────┘  │
└────────────────────┬────────────────────────────────┘
                     │ API Calls (REST)
┌────────────────────▼────────────────────────────────┐
│              BACKEND (Supabase)                      │
│  ┌────────────────────────────────────────────────┐ │
│  │          PostgreSQL Database                    │ │
│  │  - profiles  - children  - evaluations          │ │
│  │  - questionnaires  - ai_results  - responses    │ │
│  └────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────┐ │
│  │          Edge Functions (Serverless)            │ │
│  │  - generate-suggestions (IA recommendations)    │ │
│  │  - initialize-questionnaires (data seeding)     │ │
│  └────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────┐ │
│  │        Supabase Auth (Authentication)           │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### 3.2 Actividades de Evaluación Motriz

El sistema evalúa 8 actividades estandarizadas:

| # | Actividad | Descripción | Materiales | Criterios de Evaluación |
|---|-----------|-------------|------------|-------------------------|
| 1 | Punzar | Perforar papel siguiendo líneas | Punzón, papel, corcho | Precisión, control de fuerza, seguimiento de patrón |
| 2 | Enhebrar | Pasar cordón por orificios | Cordón, plantilla con orificios | Coordinación bilateral, paciencia |
| 3 | Recortar líneas rectas | Cortar papel siguiendo líneas rectas | Tijeras, papel con líneas | Control de tijeras, precisión lineal |
| 4 | Recortar líneas curvas | Cortar papel siguiendo líneas curvas | Tijeras, papel con curvas | Control de tijeras, precisión curvilínea |
| 5 | Rasgar papel | Rasgar papel en tiras | Papel periódico | Coordinación bimanual, fuerza digital |
| 6 | Arrugar papel | Formar bola con papel | Papel | Fuerza de prensión, coordinación |
| 7 | Modelar figuras simples | Crear formas básicas con plastilina | Plastilina | Representación tridimensional básica |
| 8 | Modelar figuras complejas | Crear figuras elaboradas | Plastilina | Creatividad, destreza avanzada |

**Sistema de Puntuación:**
- **0-3 puntos:** Nivel bajo - No logra realizar la actividad o requiere asistencia total
- **4-6 puntos:** Nivel medio - Realiza la actividad con errores o asistencia parcial
- **7-10 puntos:** Nivel alto - Realiza la actividad correctamente de forma autónoma

### 3.3 Cuestionarios Psicopedagógicos Integrados

#### 1. Cornell Note-Taking System Assessment (44 preguntas)
**Objetivo:** Evaluar hábitos y técnicas de estudio organizadas

**Dimensiones:**
- Organización de información
- Técnicas de revisión
- Estrategias metacognitivas
- Aplicación del método Cornell

**Formato:** Escala Likert 1-5 (Nunca - Siempre)

#### 2. CHAEA - Cuestionario Honey-Alonso (80 preguntas)
**Objetivo:** Identificar estilo de aprendizaje predominante

**Dimensiones (20 preguntas cada una):**
- **Activo:** Aprende experimentando, improvisando, viviendo experiencias
- **Reflexivo:** Aprende observando, analizando, reflexionando antes de actuar
- **Teórico:** Aprende integrando conocimientos en teorías lógicas y estructuradas
- **Pragmático:** Aprende aplicando ideas en la práctica, siendo eficiente

**Formato:** Dicotómico (Acuerdo/Desacuerdo)

#### 3. TAM - Technology Acceptance Model (84 preguntas)
**Objetivo:** Evaluar aceptación y disposición hacia tecnología educativa

**Dimensiones:**
- Utilidad percibida
- Facilidad de uso percibida
- Actitud hacia el uso
- Intención de uso
- Uso real

**Formato:** Escala Likert 1-7 (Totalmente en desacuerdo - Totalmente de acuerdo)

### 3.4 Modelo de Inteligencia Artificial

#### Objetivo
Clasificar automáticamente el nivel de desarrollo motriz fino de un infante en tres categorías:
- **Alto:** Puntuación total ≥ 56 (promedio ≥7/10 por actividad)
- **Medio:** Puntuación total 32-55 (promedio 4-6.9/10)
- **Bajo:** Puntuación total ≤31 (promedio <4/10)

#### Proceso de Entrenamiento

**1. Recolección de Dataset:**
- Mínimo 120 evaluaciones etiquetadas por expertos
- Distribución balanceada entre clases (40 Alto, 40 Medio, 40 Bajo)
- Variables de entrada: Puntuaciones de 8 actividades, edad, género

**2. Preprocesamiento:**
- Normalización de puntuaciones
- Encoding de variables categóricas
- Split: 70% entrenamiento, 15% validación, 15% prueba

**3. Selección de Algoritmo:**
Comparación de:
- Random Forest Classifier
- Support Vector Machine (SVM)
- Gradient Boosting
- Selección del modelo con mayor F1-Score macro

**4. Validación:**
- Validación cruzada k-fold (k=5)
- Análisis de matriz de confusión
- Cálculo de métricas: Accuracy, Precision, Recall, F1-Score por clase

**5. Deployment:**
- Serialización del modelo entrenado
- Deployment en Edge Function de Supabase
- Inferencia en tiempo real al completar evaluación

#### Generación de Recomendaciones

Mediante Edge Function que genera sugerencias personalizadas considerando:
- Perfil motriz del infante
- Estilo de aprendizaje (si disponible)
- Edad y contexto educativo
- Áreas de fortaleza y debilidad

### 3.5 Procedimientos de Evaluación

#### Flujo de Trabajo del Evaluador

1. **Registro y Autenticación**
   - Crear cuenta con correo y contraseña
   - Verificación de email
   - Completar perfil profesional

2. **Registro del Infante**
   - Ingresar datos demográficos (nombre, fecha de nacimiento, género, grado, escuela)
   - Asociación con el evaluador

3. **Evaluación Motriz**
   - Seleccionar infante a evaluar
   - Registrar fecha de evaluación
   - Aplicar las 8 actividades motrices
   - Asignar puntuación (0-10) y observaciones cualitativas a cada actividad
   - Agregar observaciones generales
   - Guardar evaluación

4. **Análisis por IA (Automático)**
   - El sistema clasifica automáticamente el nivel de desarrollo
   - Genera recomendaciones personalizadas
   - Calcula confianza del modelo

5. **Aplicación de Cuestionarios (Opcional)**
   - Seleccionar cuestionario (Cornell, CHAEA, TAM)
   - Responder preguntas
   - El sistema calcula automáticamente dimensiones y estilos dominantes

6. **Generación de Reportes**
   - Visualizar dashboard con métricas
   - Exportar reporte en PDF (incluye gráficos, clasificación, recomendaciones)
   - Exportar datos a Excel para análisis estadístico

7. **Seguimiento Longitudinal**
   - Realizar evaluaciones de seguimiento en intervalos definidos
   - Comparar evolución mediante gráficos de progreso
   - Identificar tendencias de mejora o estancamiento

---

## IV. SEGUIMIENTO Y EVALUACIÓN

### 4.1 Cronograma de Actividades

| Fase | Actividad | Semanas | Responsable |
|------|-----------|---------|-------------|
| **1. Análisis** | Levantamiento de requerimientos | 1-2 | Investigador + Asesor |
| | Diseño de arquitectura y BD | 2 | Investigador |
| **2. Desarrollo MVP** | Setup del proyecto | 3 | Investigador |
| | Autenticación y perfiles | 3-4 | Investigador |
| | Módulo de gestión de infantes | 4-5 | Investigador |
| | Formulario de evaluación motriz | 5-6 | Investigador |
| | Dashboard básico | 6 | Investigador |
| **3. Cuestionarios** | Sistema de cuestionarios | 7-8 | Investigador |
| | Migración de datos (Cornell, CHAEA, TAM) | 8-9 | Investigador |
| | Cálculo de dimensiones | 9-10 | Investigador |
| | Interfaz de administración | 10 | Investigador |
| **4. Módulo IA** | Recolección de dataset | 11 | Investigador + Colaboradores |
| | Entrenamiento de modelo | 11-12 | Investigador |
| | Edge Function de inferencia | 12 | Investigador |
| | Generación de recomendaciones | 13 | Investigador |
| **5. Reportes** | Generación de PDF | 14 | Investigador |
| | Exportación a Excel | 14 | Investigador |
| | Seguimiento longitudinal | 15 | Investigador |
| **6. Validación** | Capacitación de usuarios | 16 | Investigador |
| | Pruebas piloto | 16-18 | Usuarios piloto |
| | Recolección de feedback | 17-19 | Investigador |
| | Análisis de resultados | 19-20 | Investigador + Asesor |
| **7. Cierre** | Documentación final | 20 | Investigador |
| | Presentación de resultados | 20 | Investigador |

### 4.2 Variables de Medición (Endpoints)

#### Endpoints Primarios
1. **Usabilidad:** Puntuación en System Usability Scale (SUS) ≥70
2. **Precisión de IA:** Accuracy del modelo de clasificación ≥80%
3. **Eficiencia:** Reducción del tiempo de evaluación ≥30% vs. método tradicional

#### Endpoints Secundarios
1. Satisfacción del usuario (escala Likert 1-5) ≥4.0
2. Intención de uso continuo ≥80%
3. Pertinencia de recomendaciones de IA (escala Likert 1-5) ≥4.0
4. Completitud de datos capturados ≥95%
5. Tasa de error en el sistema <5%

### 4.3 Instrumentos de Medición

#### Para Usabilidad
- **System Usability Scale (SUS):** Cuestionario estándar de 10 ítems
- **Cuestionario de satisfacción personalizado:** 15 preguntas sobre funcionalidades específicas
- **Entrevistas semiestructuradas:** Para obtener feedback cualitativo

#### Para Precisión de IA
- **Validación cruzada con expertos:** 30 casos evaluados por el sistema y por 3 expertos independientes
- **Métricas de clasificación:** Accuracy, Precision, Recall, F1-Score, Matriz de confusión

#### Para Eficiencia
- **Registro de tiempos:** Medición automática de tiempo de evaluación en el sistema
- **Comparación con línea base:** Encuesta sobre tiempo promedio en método tradicional

---

## V. CONSIDERACIONES DE SEGURIDAD Y EVENTOS ADVERSOS

### 5.1 Riesgos Potenciales

#### Para los Usuarios (Evaluadores)
- **Riesgo mínimo:** Fatiga visual por uso prolongado de pantalla
- **Mitigación:** Recomendaciones de descanso, diseño ergonómico de interfaz

#### Para los Sujetos Evaluados (Infantes)
- **Riesgo mínimo:** Las actividades son lúdicas y no invasivas
- **Riesgo de ansiedad:** Algunos infantes pueden sentir presión durante la evaluación
- **Mitigación:** 
  - Capacitación a evaluadores en manejo de ansiedad infantil
  - Permitir pausas durante la evaluación
  - Derecho de retiro sin consecuencias

#### Riesgos de Seguridad de Datos
- **Exposición de datos personales sensibles**
- **Mitigación:**
  - Implementación de Row Level Security (RLS) en Supabase
  - Cifrado de datos en tránsito (HTTPS) y en reposo
  - Autenticación robusta (email verificado, contraseñas hasheadas)
  - Cumplimiento de principios de protección de datos personales
  - Respaldos automáticos diarios

### 5.2 Plan de Monitoreo de Eventos Adversos

- **Reporte de errores del sistema:** Logging automático de errores en Supabase
- **Canal de reporte de usuarios:** Formulario de contacto y soporte técnico
- **Revisión semanal:** Análisis de logs y reportes por parte del investigador
- **Escalamiento:** Eventos graves reportados inmediatamente al asesor académico

### 5.3 Criterios de Interrupción

El estudio se interrumpirá si:
- Se detecta una brecha de seguridad que comprometa datos personales
- Más del 30% de los usuarios piloto reportan experiencia negativa severa
- El modelo de IA presenta una tasa de error superior al 50%
- Solicitud expresa de la institución responsable

---

## VI. GESTIÓN Y ANÁLISIS DE DATOS

### 6.1 Recolección de Datos

#### Datos Cuantitativos
- **Evaluaciones motrices:** Puntuaciones de actividades, fechas, observaciones
- **Respuestas a cuestionarios:** 208 preguntas de Cornell, CHAEA y TAM
- **Métricas de uso:** Tiempos de evaluación, número de sesiones, funcionalidades usadas
- **Métricas de modelo IA:** Clasificaciones, scores de confianza
- **Cuestionarios de usabilidad:** SUS, escalas Likert

#### Datos Cualitativos
- **Observaciones de evaluadores:** Texto libre en campos de observaciones
- **Entrevistas semiestructuradas:** Audio/texto transcrito
- **Feedback abierto:** Comentarios en formularios de satisfacción

### 6.2 Almacenamiento y Gestión

- **Base de datos:** PostgreSQL en Supabase (cloud-hosted)
- **Respaldos:** Automáticos diarios, retención 30 días
- **Control de versiones de código:** Git (repositorio privado)
- **Documentación:** Markdown en carpeta `/docs` del proyecto

### 6.3 Métodos Estadísticos

#### Análisis Cuantitativo
- **Estadística descriptiva:** Media, mediana, desviación estándar de puntuaciones y tiempos
- **Pruebas de hipótesis:** 
  - Prueba t de Student o Wilcoxon para comparación de tiempos (antes/después)
  - Chi-cuadrado para distribución de clasificaciones
- **Métricas de clasificación:** Accuracy, Precision, Recall, F1-Score, Kappa de Cohen
- **Nivel de significancia:** α = 0.05
- **Software:** Python (pandas, scipy, scikit-learn), R (opcional)

#### Análisis Cualitativo
- **Análisis temático:** Identificación de temas recurrentes en entrevistas
- **Análisis de contenido:** Categorización de observaciones cualitativas
- **Software:** NVivo o análisis manual con codificación

### 6.4 Manejo de Datos Faltantes

- **Evaluaciones incompletas:** Excluir del análisis si faltan >25% de datos
- **Respuestas faltantes en cuestionarios:** Imputación por media de dimensión (si <10% faltante) o exclusión
- **Documentación:** Registrar todos los casos de datos faltantes y razones

---

## VII. ASPECTOS ÉTICOS

### 7.1 Declaración de Cumplimiento

Este protocolo se adhiere a:
- Principios éticos de la Declaración de Helsinki
- Normas institucionales del ITSZ
- Reglamento de Residencias Profesionales del Tecnológico Nacional de México

### 7.2 Consentimiento Informado

#### Para Usuarios (Evaluadores)
- Documento de consentimiento informado que explique:
  - Objetivos del estudio
  - Uso del sistema y recolección de datos de uso
  - Confidencialidad de información
  - Voluntariedad y derecho de retiro
  - Beneficios y riesgos mínimos
- Firma digital o física antes de inicio de participación

#### Para Padres/Tutores de Infantes
- Documento de consentimiento informado que explique:
  - Naturaleza no invasiva de las actividades
  - Uso de datos del infante (anónimos en publicaciones)
  - Confidencialidad y protección de datos
  - Voluntariedad y derecho de retiro sin afectar servicios educativos
  - Beneficio potencial de identificación temprana de necesidades
- Firma física requerida

#### Asentimiento Infantil
- Para infantes de 4-6 años, explicación verbal simplificada y asentimiento verbal

### 7.3 Confidencialidad y Protección de Datos

- **Anonimización:** Datos publicados no incluyen nombres reales, se usan códigos de identificación
- **Acceso restringido:** Solo investigador principal y asesor tienen acceso a datos identificables
- **Separación de datos:** Consentimientos firmados almacenados físicamente, separados de datos digitales
- **Destrucción de datos:** Datos personales identificables serán eliminados 5 años después del cierre del estudio

### 7.4 Beneficios y Compensación

- **Para evaluadores:** 
  - Acceso gratuito al sistema durante y después del estudio
  - Capacitación en uso de herramientas digitales de evaluación
  - Certificado de participación en proyecto de investigación

- **Para infantes:**
  - Evaluación profesional gratuita de desarrollo motriz
  - Reporte con recomendaciones personalizadas para padres/tutores
  - No hay compensación monetaria

### 7.5 Manejo de Incidentales

Si durante la evaluación se identifica un infante con necesidades especiales no diagnosticadas:
- Comunicación confidencial a padres/tutores
- Recomendación de evaluación especializada externa
- Seguimiento ético sin generar alarma innecesaria

---

## VIII. CALIDAD Y MONITOREO

### 8.1 Sistema de Aseguramiento de Calidad

- **Revisiones de código:** Peer review de componentes críticos
- **Testing:**
  - Unit tests para funciones críticas
  - Integration tests para flujos completos
  - User acceptance testing (UAT) con usuarios piloto

- **Documentación:**
  - Manual técnico para desarrolladores
  - Manual de usuario para evaluadores
  - Documentación en código (comentarios, JSDoc)

### 8.2 Monitoreo del Sistema

- **Métricas técnicas:**
  - Uptime del servidor (objetivo >99%)
  - Tiempos de respuesta de API (<500ms promedio)
  - Tasa de errores (<1%)

- **Monitoreo de uso:**
  - Número de usuarios activos
  - Número de evaluaciones completadas
  - Funcionalidades más/menos utilizadas

- **Herramientas:**
  - Supabase Dashboard para métricas de BD y API
  - Google Analytics (opcional) para métricas de uso

### 8.3 Auditorías

- **Auditoría de seguridad:** Revisión de políticas RLS y permisos (semana 15)
- **Auditoría de datos:** Validación de integridad y consistencia de BD (semana 18)
- **Auditoría de código:** Revisión de mejores prácticas y estándares (semana 19)

---

## IX. RESULTADOS ESPERADOS

### 9.1 Productos Tecnológicos

1. **Sistema web funcional SEEDU Motor Fine** desplegado en producción
2. **Modelo de IA entrenado y validado** con accuracy ≥80%
3. **Dataset estructurado** de evaluaciones motrices para investigación futura
4. **Documentación técnica completa:**
   - Manual técnico
   - Manual de usuario
   - Documentación de API
   - Guía de instalación y deployment

### 9.2 Impacto Científico

- **Publicación académica:** Artículo en revista de tecnología educativa o informática aplicada
- **Presentación en congreso:** Congreso Nacional de Informática o Congreso de Innovación Educativa
- **Transferencia de conocimiento:** Capacitación a comunidad educativa del ITSZ y región

### 9.3 Impacto Social

- **Democratización de herramientas profesionales** de evaluación psicopedagógica
- **Apoyo a educadores y psicopedagogos** en zonas con recursos limitados
- **Identificación temprana** de necesidades de intervención en desarrollo infantil
- **Base para políticas públicas** educativas basadas en datos

### 9.4 Formación Profesional

- Fortalecimiento de competencias del estudiante en:
  - Desarrollo full-stack
  - Machine Learning aplicado
  - Diseño de sistemas escalables
  - Investigación aplicada
  - Gestión de proyectos

---

## X. DIFUSIÓN DE RESULTADOS

### 10.1 Política de Publicación

- **Autoría principal:** José Antonio Mercado Santiago (investigador)
- **Coautoría:** José Miguel Méndez Alonso (asesor académico)
- **Afiliación institucional:** Instituto Tecnológico Superior de Zacapoaxtla

### 10.2 Medios de Difusión

1. **Informe técnico de residencia profesional** (documento oficial del ITSZ)
2. **Artículo científico** en revista indexada (objetivo: publicación en 2025)
3. **Presentación en congreso** nacional o internacional
4. **Repositorio de código abierto** (opcional, previa aprobación institucional)
5. **Seminario institucional** para comunidad académica del ITSZ

### 10.3 Propiedad Intelectual

- Derechos morales del estudiante reconocidos en documentación
- Código fuente y sistema propiedad del ITSZ
- Posibilidad de licenciamiento para uso externo bajo acuerdo institucional

---

## XI. PRESUPUESTO

### 11.1 Recursos Humanos

| Rol | Dedicación | Costo | Fuente |
|-----|------------|-------|--------|
| Investigador (estudiante) | 20 semanas, tiempo completo | Sin costo | Residencia profesional |
| Asesor académico | 2 hrs/semana | Sin costo | Obligación docente ITSZ |
| Usuarios piloto | Participación voluntaria | Sin costo | Colaboración |

### 11.2 Recursos Materiales

| Concepto | Cantidad | Costo Unitario | Costo Total | Fuente de Financiamiento |
|----------|----------|----------------|-------------|--------------------------|
| Computadora de desarrollo | 1 | Propiedad | $0 | Propio |
| Servicios de hosting (Netlify Free) | 6 meses | $0/mes | $0 | Gratuito |
| Supabase (Free tier) | 6 meses | $0/mes | $0 | Gratuito |
| Dominio web (opcional) | 1 año | $150 | $150 | ITSZ / Propio |
| Materiales para evaluaciones (papel, tijeras, plastilina, etc.) | Varios | - | $500 | Colaboradores |
| Impresión de documentación | 200 hojas | $1/hoja | $200 | ITSZ |
| **TOTAL** | | | **$850 MXN** | |

**Nota:** El proyecto es de bajo costo gracias al uso de tecnologías open-source y servicios gratuitos.

### 11.3 Viáticos y Transporte

- No aplica (trabajo remoto y en instalaciones del ITSZ)

---

## XII. LIMITACIONES Y FORTALEZAS

### 12.1 Limitaciones Anticipadas

1. **Tamaño de muestra limitado:** La fase de validación piloto incluye 15-20 usuarios, lo que limita la generalización de resultados de usabilidad

2. **Ausencia de grupo control:** El estudio cuasi-experimental no incluye grupo control que use método tradicional en paralelo

3. **Dataset de entrenamiento inicial pequeño:** El modelo de IA se entrena con ~120 casos, lo que puede afectar su capacidad de generalización

4. **Validación a corto plazo:** No se evalúa el impacto longitudinal del uso del sistema en la práctica educativa

5. **Contexto específico:** Validación en contexto mexicano/hispanohablante puede limitar generalización a otros contextos culturales

6. **Dependencia de conectividad:** El sistema requiere internet, lo que puede ser limitante en zonas rurales con poca conectividad

### 12.2 Fortalezas del Estudio

1. **Metodología mixta:** Combina datos cuantitativos y cualitativos para comprensión integral

2. **Tecnología moderna y escalable:** Stack tecnológico robusto que facilita crecimiento futuro

3. **Integración de múltiples instrumentos:** Evaluación holística (motriz + estilos de aprendizaje + hábitos de estudio)

4. **Aplicación de IA en dominio poco explorado:** Contribución innovadora en evaluación del desarrollo infantil

5. **Enfoque en usabilidad:** Diseño centrado en el usuario y validación con profesionales reales

6. **Documentación exhaustiva:** Facilita replicabilidad y transferencia de conocimiento

7. **Bajo costo:** Solución accesible frente a alternativas comerciales

8. **Base para investigación longitudinal:** El sistema genera datos estructurados útiles para estudios futuros

---

## XIII. DOCUMENTOS ADJUNTOS (ANEXOS)

### Anexo A: Consentimiento Informado para Evaluadores
[Plantilla de documento con todos los elementos requeridos]

### Anexo B: Consentimiento Informado para Padres/Tutores
[Plantilla de documento con explicación accesible para no especialistas]

### Anexo C: Cuestionario de Usabilidad (SUS + Personalizado)
[Documento con System Usability Scale y preguntas adicionales]

### Anexo D: Guía de Entrevista Semiestructurada
[Preguntas guía para recolección de feedback cualitativo]

### Anexo E: Manual de Usuario del Sistema
[Disponible en `docs/MANUAL_USUARIO.md`]

### Anexo F: Manual Técnico del Sistema
[Disponible en `docs/MANUAL_TECNICO.md`]

### Anexo G: Esquema de Base de Datos
[Diagrama ER y definiciones SQL]

### Anexo H: Arquitectura del Sistema
[Diagramas de arquitectura, flujos de datos, componentes]

### Anexo I: Cronograma Detallado (Gantt)
[Diagrama de Gantt con todas las actividades y dependencias]

### Anexo J: Curriculum Vitae del Investigador Principal
[CV académico de José Antonio Mercado Santiago]

### Anexo K: Curriculum Vitae del Asesor Académico
[CV académico de José Miguel Méndez Alonso]

---

## XIV. REFERENCIAS BIBLIOGRÁFICAS

1. Gesell, A. (1940). *The First Five Years of Life: A Guide to the Study of the Preschool Child*. Harper & Brothers.

2. Piaget, J. (1952). *The Origins of Intelligence in Children*. International Universities Press.

3. Beery, K. E., & Beery, N. A. (2010). *The Beery-Buktenica Developmental Test of Visual-Motor Integration* (6th ed.). Pearson.

4. Cameron, C. E., et al. (2012). Fine motor skills and executive function both contribute to kindergarten achievement. *Child Development*, 83(4), 1229-1244.

5. Carlson, A. G., et al. (2008). Explicit capacities related to motor skills development in elementary school. *Journal of Educational Psychology*, 100(3), 615-628.

6. Kolb, D. A. (1984). *Experiential Learning: Experience as the Source of Learning and Development*. Prentice Hall.

7. Honey, P., & Mumford, A. (1992). *The Manual of Learning Styles*. Peter Honey Publications.

8. Alonso, C. M., Gallego, D. J., & Honey, P. (1994). *Los estilos de aprendizaje: Procedimientos de diagnóstico y mejora*. Ediciones Mensajero.

9. Pauk, W., & Owens, R. J. Q. (2010). *How to Study in College* (10th ed.). Cengage Learning.

10. Davis, F. D. (1989). Perceived Usefulness, Perceived Ease of Use, and User Acceptance of Information Technology. *MIS Quarterly*, 13(3), 319-340.

11. Russell, S., & Norvig, P. (2020). *Artificial Intelligence: A Modern Approach* (4th ed.). Pearson.

12. Goodfellow, I., Bengio, Y., & Courville, A. (2016). *Deep Learning*. MIT Press.

13. Brooke, J. (1996). SUS: A "quick and dirty" usability scale. In P. W. Jordan et al. (Eds.), *Usability Evaluation in Industry* (pp. 189-194). Taylor & Francis.

14. React Documentation. (2024). Retrieved from https://react.dev/

15. Supabase Documentation. (2024). Retrieved from https://supabase.com/docs

16. World Medical Association. (2013). Declaration of Helsinki: Ethical principles for medical research involving human subjects. *JAMA*, 310(20), 2191-2194.

---

## FIRMAS DE APROBACIÓN

**Investigador Principal:**

José Antonio Mercado Santiago  
Estudiante de Ingeniería Informática  
No. Control: 21ZP0024

Firma: ________________________  Fecha: _____________

---

**Asesor Académico:**

José Miguel Méndez Alonso  
Docente del ITSZ

Firma: ________________________  Fecha: _____________

---

**Jefe de División de Estudios Profesionales:**

[Nombre]  
Instituto Tecnológico Superior de Zacapoaxtla

Firma: ________________________  Fecha: _____________

---

**VERSIÓN DEL PROTOCOLO:** 2.0  
**FECHA DE ÚLTIMA ACTUALIZACIÓN:** 17 de Noviembre de 2025  
**PRÓXIMA REVISIÓN PROGRAMADA:** Enero 2026
