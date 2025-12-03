# FultraApp3 - React Native Delivery Management App

Aplicación de gestión de entregas desarrollada con React Native CLI y Google Maps SDK.

## Requisitos Previos

- Node.js >= 18
- React Native CLI
- Android Studio (para Android)
- Xcode (para iOS - solo macOS)
- JDK 17
- CocoaPods (para iOS)

## Instalación

### 1. Clonar e instalar dependencias

```bash
cd FultraApp3
npm install
```

### 2. Configurar Google Maps API Key

#### Android
Edita `android/app/src/main/AndroidManifest.xml` y reemplaza `YOUR_GOOGLE_MAPS_API_KEY` con tu API key:

```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="TU_API_KEY_AQUI"/>
```

#### iOS
Edita `ios/FultraApp3/AppDelegate.mm` y agrega tu API key:

```objc
[GMSServices provideAPIKey:@"TU_API_KEY_AQUI"];
```

### 3. Configurar servicios de mapas

En `src/shared/services/mapService.ts`, reemplaza `YOUR_GOOGLE_MAPS_API_KEY` con tu API key.

### 4. Instalar pods (iOS)

```bash
cd ios && pod install && cd ..
```

## Ejecución

### Android

```bash
npm run android
```

### iOS

```bash
npm run ios
```

### Metro Bundler

```bash
npm start
```

## Estructura del Proyecto

```
FultraApp3/
├── android/                    # Configuración nativa Android
├── ios/                        # Configuración nativa iOS
├── src/
│   ├── design-system/          # Sistema de diseño
│   │   ├── theme/
│   │   │   ├── colors.ts       # Paleta de colores
│   │   │   ├── typography.ts   # Tipografía
│   │   │   └── spacing.ts      # Espaciado y sombras
│   │   └── index.ts
│   ├── navigation/             # Sistema de navegación
│   │   ├── RootNavigator.tsx   # Navegador principal
│   │   ├── MainTabNavigator.tsx # Tabs de navegación
│   │   └── types.ts            # Tipos de navegación
│   ├── screens/                # Pantallas
│   │   ├── auth/               # Autenticación
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   └── ForgotPasswordScreen.tsx
│   │   ├── home/               # Pantalla principal
│   │   │   └── HomeScreen.tsx
│   │   ├── entregas/           # Gestión de entregas
│   │   │   ├── DeliveryDetailsScreen.tsx
│   │   │   ├── DeliveryInProgressScreen.tsx
│   │   │   └── DeliveryCompletedScreen.tsx
│   │   └── profile/            # Perfil y configuración
│   │       └── SettingsScreen.tsx
│   └── shared/
│       ├── components/         # Componentes reutilizables
│       │   ├── Button.tsx
│       │   ├── Input.tsx
│       │   ├── Header.tsx
│       │   ├── MapView.tsx
│       │   ├── DeliveryCard.tsx
│       │   └── LoadingSpinner.tsx
│       ├── hooks/              # Custom hooks
│       │   ├── useAuth.ts
│       │   ├── useDeliveries.ts
│       │   └── useLocation.ts
│       ├── models/             # Modelos/Tipos
│       │   ├── User.ts
│       │   ├── Delivery.ts
│       │   ├── Location.ts
│       │   └── ApiResponse.ts
│       ├── services/           # Servicios
│       │   ├── apiClient.ts
│       │   ├── authService.ts
│       │   ├── deliveryService.ts
│       │   └── mapService.ts
│       ├── store/              # Estado global (Zustand)
│       │   ├── authStore.ts
│       │   └── deliveryStore.ts
│       └── utils/              # Utilidades
│           ├── validation.ts
│           └── helpers.ts
├── App.tsx                     # Componente principal
├── index.js                    # Punto de entrada
└── package.json
```

## Características

### Autenticación
- Login con email/contraseña
- Registro de nuevos usuarios
- Recuperación de contraseña
- Persistencia de sesión

### Gestión de Entregas
- Lista de entregas con filtros
- Detalles de entrega
- Inicio y finalización de entregas
- Tracking en tiempo real
- Historial de estados

### Mapas y Geolocalización
- Visualización con Google Maps
- Cálculo de rutas
- Tracking GPS en tiempo real
- Geocodificación de direcciones

### UI/UX
- Diseño Material/iOS
- Sistema de diseño consistente
- Estados de carga
- Manejo de errores

## Datos de Prueba

En modo desarrollo, la app utiliza datos mock. Para probar el login:
- Email: `demo@fultraapp.com`
- Password: `demo123`

O usa cualquier email válido con contraseña de 6+ caracteres.

## Dependencias Principales

- **@react-navigation** - Navegación
- **react-native-maps** - Mapas de Google
- **react-native-geolocation-service** - Geolocalización
- **zustand** - Estado global
- **axios** - HTTP client
- **react-native-vector-icons** - Iconos

## Scripts Disponibles

```bash
npm run android        # Ejecutar en Android
npm run ios           # Ejecutar en iOS
npm start             # Iniciar Metro bundler
npm run lint          # Ejecutar ESLint
npm test              # Ejecutar tests
npm run clean         # Limpiar build Android
npm run pod-install   # Instalar pods iOS
```

## Configuración de API

Para conectar con tu backend, edita `src/shared/services/apiClient.ts`:

```typescript
const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api/v1'  // URL de desarrollo
  : 'https://tu-api.com/api/v1';    // URL de producción
```

## Permisos Requeridos

### Android
- INTERNET
- ACCESS_FINE_LOCATION
- ACCESS_COARSE_LOCATION
- ACCESS_BACKGROUND_LOCATION
- CAMERA
- VIBRATE

### iOS
- NSLocationWhenInUseUsageDescription
- NSLocationAlwaysUsageDescription
- NSCameraUsageDescription

## Solución de Problemas

### Error de Google Maps en Android
Asegúrate de haber configurado el API key correctamente y que el SDK de Maps esté habilitado en Google Cloud Console.

### Error de permisos de ubicación
Verifica que los permisos estén declarados correctamente en AndroidManifest.xml e Info.plist.

### Metro bundler no conecta
```bash
npx react-native start --reset-cache
```

## Licencia

Proyecto privado - Todos los derechos reservados.

## Contacto

Para soporte: soporte@fultraapp.com
