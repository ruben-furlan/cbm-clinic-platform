# CbmClinicPlatform

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.1.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Google Reviews en tiempo real (Testimonials)

El componente de testimonios puede consumir reseñas reales desde Google Places API v1.

1. Obtén una API key con acceso a `Places API (New)`.
2. Obtén el `placeId` del negocio en Google Maps.
3. Antes de iniciar la app, define estas variables globales en el navegador:

```html
<script>
  window.__cbmGooglePlacesApiKey = 'TU_API_KEY';
  window.__cbmGooglePlaceId = 'TU_PLACE_ID';
</script>
```

Si no están configuradas, el componente muestra un fallback con reseñas locales.
