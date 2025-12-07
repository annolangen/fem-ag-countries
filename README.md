# Frontend Mentor - REST Countries API with color theme switcher solution

This is a solution to the [REST Countries API with color theme switcher challenge on Frontend Mentor](https://www.frontendmentor.io/challenges/rest-countries-api-with-color-theme-switcher-5cacc469fec04111f7b848ca). Frontend Mentor challenges help you improve your coding skills by building realistic projects.

## Table of contents

- [Overview](#overview)
  - [The challenge](#the-challenge)
  - [Screenshot](#screenshot)
  - [Links](#links)
- [My process](#my-process)
  - [Built with](#built-with)
  - [What I learned](#what-i-learned)
  - [Continued development](#continued-development)
  - [Useful resources](#useful-resources)
- [Author](#author)

## Overview

### The challenge

Users should be able to:

- See all countries from the API on the homepage
- Search for a country using an `input` field
- Filter countries by region
- Click on a country to see more detailed information on a separate page
- Click through to the border countries on the detail page
- Toggle the color scheme between light and dark mode *(optional)*

### Screenshot

![](./task/preview.jpg)

### Links

- Solution URL: [GitHub Repository](https://github.com/annolangen/fem-ag-countries)
- Live Site URL: [https://annolangen.github.io/fem-ag-countries](https://annolangen.github.io/fem-ag-countries)

## How to Run

1.  **Start Development Server**:
    ```bash
    npm run dev
    ```
2.  **Build for Production**:
    ```bash
    npm run build
    npm run preview
    ```

## Project Structure

-   `src/main.ts`: Application logic (State, Components, Router).
-   `src/main.css`: Tailwind imports.
-   `public/data.json`: Source data.
-   `tailwind.config.js`: Design tokens.

## My process

### Built with

- Semantic HTML5 markup
- CSS custom properties
- Flexbox
- CSS Grid
- Mobile-first workflow
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [lit-html](https://lit.dev/)
- [TypeScript](https://www.typescriptlang.org/)

### Design Decisions

- **Dark Mode Toggle**: The design files show static "Dark Mode" text with a moon icon. We implemented a dynamic toggle that switches text between "Dark Mode" and "Light Mode" based on the active state for better user clarity.
- **Region Filter Reset**: The design files do not show a way to clear the region filter once selected. We added an "All Regions" option to the dropdown to provide this necessary functionality.
- **API Field Limit**: The `@yusifaliyevpro/countries` package (wrapping REST Countries v3.1) imposes a 10-field limit on responses. To stay within this limit while maintaining critical features, we excluded the Top Level Domain (TLD) field from the Detail View, prioritizing core identity, location, and border data.

### What I learned

This project was a great exercise in building a reactive application without a heavy framework like React or Vue. We used **lit-html** for lightweight templating and a custom **Reactive State Proxy** to handle updates.

Key technical highlights:
- **Reactive State Proxy**: Wrapped the state object in a JavaScript `Proxy` to automatically trigger re-renders whenever a property changes.
- **Hash-based Routing**: Implemented a simple client-side router using window hash (`#`) to support deep linking and browser history navigation without server interaction.
- **Temporal Dead Zone (TDZ) Awareness**: Learned strict initialization ordering when using TypeScript modules to prevent accessing components before definition.
- **Controlled Components**: Manually handling DOM sync to ensure input values always reflect the JS state source of truth.

```typescript
// Custom Reactive State implementation
const createState = <T extends object>(initialState: T): T => {
  return new Proxy(initialState, {
    set(target, property, value) {
      const result = Reflect.set(target, property, value);

      // Derived State Logic
      if (['countries', 'searchTerm', 'regionFilter'].includes(String(property))) {
          // ... update derived state
      }

      render(AppView(), document.body);
      return result;
    }
  });
};
```

### Continued development

In the future, I would like to explore:
- Virtualizing the long list of countries for better performance.
- Adding transitions/animations using the Web Animations API between routes.
- Writing unit tests for the derived state logic.

### Useful resources

- [MDN Proxy Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) - Essential for understanding the "magic" behind the state management.
- [lit-html Guide](https://lit.dev/docs/libraries/standalone-templates/) - Great documentation for efficient HTML rendering.
- [Tailwind CSS Docs](https://tailwindcss.com/docs) - Always a handy reference for utility classes.

## Author

- Website - [Anno Langen](https://github.com/annolangen)
- Frontend Mentor - [@annolangen](https://www.frontendmentor.io/profile/annolangen)
