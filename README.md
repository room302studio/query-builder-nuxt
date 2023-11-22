# Nuxt Query Builder

This Vue component is a sophisticated query builder, specifically designed to integrate seamlessly with Nuxt UI. It leverages Nuxt UI components such as `UTable`, `USelect`, and `UButton` to provide a cohesive and user-friendly interface for complex data filtering tasks.

#### Key Features:

1. **Nuxt UI Integration:**
   - Utilizes Nuxt UI components (`UTable`, `USelect`, `UButton`) for a consistent look and feel with other Nuxt UI elements.
   - Ensures smooth compatibility and styling coherence with Nuxt UI's design system.

2. **Dynamic Column Display:**
   - Dynamically lists all available columns from the provided data, allowing users to select and build conditions for filtering.

3. **Advanced Condition Builder:**
   - Enables users to add, modify, and remove conditions based on column selection, condition type, and comparison values.
   - Supports a variety of condition types, including 'equals', 'not-equals', 'contains', and 'not-contains'.
   - Interactive UI for managing conditions, enhancing user experience in data filtering.

4. **Reactive Data Filtering:**
   - Filters and updates data display reactively based on the user-defined conditions.
   - Ideal for real-time data manipulation and analysis.

5. **Responsive and Interactive UI Components:**
   - Leverages Nuxt UI components for a unified and interactive user interface.
   - Displays active conditions with options to edit or delete, enhancing user control over data filtering.

#### Implementation Details:

- Developed using Vue's Composition API for reactive state management.
- Minimalist styling, easily customizable to fit the application's design requirements.
- Works well with Nuxt UI's design system, ensuring a consistent look and feel with other Nuxt UI components.


## Setup

Make sure to install the dependencies:

```bash
# yarn
yarn install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# yarn
yarn dev
```

## Production

Build the application for production:

```bash
# yarn
yarn build
```

Locally preview production build:

```bash
# yarn
yarn preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
