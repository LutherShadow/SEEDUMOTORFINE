# 🎯 SEEDU Motor Fine - Sistema de Evaluación del Desarrollo Motor Fino

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-3178C6?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Latest-3ECF8E?logo=supabase)
![License](https://img.shields.io/badge/license-Proprietary-red.svg)
![Status](https://img.shields.io/badge/status-Active-success.svg)

**Plataforma integral para la evaluación y análisis del desarrollo motor fino en niños**

[🚀 Demo](https://seedumotorfine.netlify.app/) • [📖 Documentación](#-documentación) • [🛠️ Instalación](#️-instalación)

</div>

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Documentación](#-documentación)
- [Instalación](#️-instalación)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Seguridad](#-seguridad)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

---

## Características

### Para Evaluadores
- **Gestión de Perfiles**: Registro y administración completa de niños evaluados
- **8 Pruebas Estandarizadas**: Evaluación integral del desarrollo motor fino
- **Análisis con IA**: Clasificación automática y recomendaciones personalizadas utilizando modelos avanzados
- **Reportes Profesionales**: Generación de PDF y Excel con análisis detallado
- **Estilos de Aprendizaje**: Evaluación de 7 dimensiones del aprendizaje
- **Seguimiento Longitudinal**: Historial completo de evaluaciones por niño

### Para Administradores
- **Entrenamiento de IA**: Sistema de machine learning configurable
- **Métricas Avanzadas**: F1-Score, precisión y matriz de confusión
- **Historial de Entrenamientos**: Comparación de rendimiento del modelo
- **Validación Cruzada**: Optimización continua del modelo
- **Generación de Contenido**: Creación dinámica de informes y recomendaciones

### Novedades en la Versión 2.0.0

- Integración con modelos de lenguaje avanzados para generación de contenido
- Mejoras en la interfaz de usuario y experiencia de usuario
- Optimización del rendimiento del sistema
- Soporte para múltiples formatos de exportación
- Mejoras en la seguridad y privacidad de datos

### Seguridad
- **Autenticación Robusta**: Sistema seguro con Supabase Auth
- **Row Level Security (RLS)**: Aislamiento total de datos entre usuarios
- **Protección de Datos**: Cumplimiento con normativas de privacidad

---

## Tecnologías

<table>
<tr>
<td>

**Frontend**
- ⚛️ React 18.3.1
- 📘 TypeScript 5.5+
- ⚡ Vite
- 🎨 Tailwind CSS
- 🧩 shadcn/ui
- 📊 Recharts

</td>
<td>

**Backend**
- 🗄️ Supabase (PostgreSQL)
- ⚡ Edge Functions
- 🔐 Supabase Auth
- 📦 Row Level Security

</td>
<td>

**Herramientas**
- 📝 React Hook Form
- ✅ Zod Validation
- 📄 jsPDF
- 📊 XLSX
- 🎯 Lucide React Icons

</td>
</tr>
</table>

---

## Documentación

El proyecto cuenta con documentación completa y detallada:

| Documento | Descripción | Enlace |
|-----------|-------------|--------|
| 📘 **Manual General** | Visión general del sistema, características y alcance | [Ver Manual General](docs/MANUAL_GENERAL.md) |
| 👨‍💼 **Manual de Usuario** | Guía paso a paso para evaluadores | [Ver Manual de Usuario](docs/MANUAL_USUARIO.md) |
| 🔧 **Manual Técnico** | Documentación para desarrolladores y administradores | [Ver Manual Técnico](docs/MANUAL_TECNICO.md) |
| 📋 **Documentación del Proyecto** | Arquitectura técnica completa y especificaciones | [Ver Documentación](docs/DOCUMENTACION_PROYECTO.md) |

### Accesos Rápidos

- **¿Primera vez usando el sistema?** → [Manual de Usuario](docs/MANUAL_USUARIO.md)
- **¿Necesitas instalar o configurar?** → [Manual Técnico - Instalación](docs/MANUAL_TECNICO.md#instalación-y-configuración)
- **¿Problemas o errores?** → [Manual Técnico - Troubleshooting](docs/MANUAL_TECNICO.md#troubleshooting)
- **¿Entrenar el modelo de IA?** → [Manual Técnico - IA](docs/MANUAL_TECNICO.md#inteligencia-artificial)

---

## Instalación

### Prerrequisitos

```bash
node >= 18.0.0
npm >= 9.0.0
```

### Instalación Local

```bash
# 1. Clonar el repositorio
git clone <YOUR_GIT_URL>

# 2. Navegar al directorio
cd <YOUR_PROJECT_NAME>

# 3. Instalar dependencias
npm install

# 4. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# 5. Iniciar servidor de desarrollo
npm run dev
```

### Variables de Entorno

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Para más detalles de instalación y configuración, consulta el [Manual Técnico](docs/MANUAL_TECNICO.md#instalación-y-configuración).

---

## Uso

### Para Evaluadores

1. **Registrar/Iniciar Sesión**
2. **Agregar Niños**: Registrar información básica
3. **Realizar Evaluaciones**: Aplicar las 8 pruebas psicopedagógicas
4. **Ver Análisis**: Revisar clasificación y recomendaciones de IA
5. **Generar Reportes**: Descargar PDF o Excel

### Para Administradores

1. **Acceder a Training**: Módulo de entrenamiento de IA
2. **Configurar Parámetros**: Definir muestras de entrenamiento
3. **Entrenar Modelo**: Ejecutar entrenamiento supervisado
4. **Validar Métricas**: Revisar F1-Score y matriz de confusión

Para guías detalladas, consulta el [Manual de Usuario](docs/MANUAL_USUARIO.md).

---

## Estructura del Proyecto

```
seedu-motor-fine/
├── src/
│   ├── components/         # Componentes React
│   │   ├── evaluations/    # Componentes de evaluación
│   │   └── ui/             # Componentes UI (shadcn)
│   ├── pages/              # Páginas de la aplicación
│   │   ├── Auth.tsx        # Autenticación
│   │   ├── Dashboard.tsx   # Panel principal
│   │   ├── Children.tsx    # Gestión de niños
│   │   ├── Evaluations.tsx # Evaluaciones
│   │   ├── Reports.tsx     # Reportes
│   │   ├── AITraining.tsx  # Entrenamiento IA
│   │   └── Profile.tsx     # Perfil de usuario
│   ├── integrations/       # Integraciones (Supabase)
│   ├── hooks/              # Custom hooks
│   └── lib/                # Utilidades
├── supabase/
│   ├── functions/          # Edge Functions
│   └── migrations/         # Migraciones de BD
├── docs/                   # Documentación completa
│   ├── MANUAL_GENERAL.md
│   ├── MANUAL_USUARIO.md
│   ├── MANUAL_TECNICO.md
│   └── DOCUMENTACION_PROYECTO.md
└── public/                 # Archivos estáticos
```

---

## Seguridad

- **Autenticación**: Supabase Auth con email/password
- **Row Level Security**: Políticas RLS en todas las tablas
- **Encriptación**: Datos sensibles encriptados en tránsito y reposo
- **Validación**: Validación de datos en frontend y backend

Para más información sobre seguridad, consulta el [Manual Técnico - Seguridad](docs/MANUAL_TECNICO.md#seguridad-y-privacidad).

---

## Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build
npm run lint         # Ejecutar ESLint
```

---

## Testing

El sistema incluye validación automática en:
- Formularios con React Hook Form + Zod
- Validación de fechas (no futuras)
- Validación de puntuaciones (0-10)
- Métricas de IA (precisión, F1-Score)

---

## Métricas del Modelo de IA

El modelo de clasificación incluye:
- **Accuracy**: Precisión global del modelo
- **F1-Score**: Por cada clase (Alto, Medio, Bajo)
- **Precision**: Por cada clase
- **Matriz de Confusión**: Visualización de predicciones

---

## Contribución

Para contribuir al proyecto:

1. Lee la [Documentación Técnica](docs/DOCUMENTACION_PROYECTO.md)
2. Revisa el [Manual Técnico](docs/MANUAL_TECNICO.md)
3. Contacta al equipo de desarrollo

---

## Soporte

- Documentación Completa: Ver [Documentación](docs/)
- Reportar problemas: Ver [Manual Técnico - Troubleshooting](docs/MANUAL_TECNICO.md#troubleshooting)
- Contacto: Administrador del sistema

---

## Licencia

Este software es propiedad intelectual protegida. Todos los derechos reservados.

**Copyright 2025 SEEDU Motor Fine**

---

## Características Próximas

- Soporte para múltiples idiomas
- Aplicación móvil nativa
- Integración con sistemas educativos externos
- Análisis predictivo avanzado
- Herramientas de colaboración en tiempo real
- Panel de control para administradores mejorado

---

## Notas de Versión

### v1.0.0 (Noviembre 2025)
- ✅ Lanzamiento inicial
- ✅ 8 pruebas psicopedagógicas
- ✅ Sistema de IA con clasificación automática
- ✅ Generación de reportes PDF/Excel
- ✅ Evaluación de estilos de aprendizaje
- ✅ Historial de entrenamientos del modelo

---

<div align="center">

**Desarrollado con ❤️ para profesionales de la educación y psicopedagogía**

[⬆ Volver arriba](#-seedu-motor-fine---sistema-de-evaluación-del-desarrollo-motor-fino)

</div>
