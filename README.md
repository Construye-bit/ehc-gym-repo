# ehc-gym2

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines React, TanStack Router, Convex, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **TanStack Router** - File-based routing with full type safety
- **React Native** - Build mobile apps using React
- **Expo** - Tools for React Native development
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **Convex** - Reactive backend-as-a-service platform
- **Authentication** - Clerk
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
npm install
```

## Convex Setup

This project uses Convex as a backend. You'll need to set up Convex before running the app:

```bash
npm run dev:setup
```

Follow the prompts to create a new Convex project and connect it to your application. See [Convex + Clerk guide](https://docs.convex.dev/auth/clerk) for auth setup.

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the web application.
Use the Expo Go app to run the mobile application.
Your app will connect to the Convex cloud backend automatically.





## Project Structure

```
ehc-gym2/
├── apps/
│   ├── web/         # Frontend application (React + TanStack Router)
│   ├── native/      # Mobile application (React Native, Expo)
├── packages/
│   └── backend/     # Convex backend functions and schema
│       ├── convex/    # Convex functions and schema
│       └── .env.local # Convex environment variables
```

## Available Scripts

- `npm run dev`: Start all applications in development mode
- `npm run build`: Build all applications
- `npm run dev:web`: Start only the web application
- `npm run dev:setup`: Setup and configure your Convex project
- `npm run check-types`: Check TypeScript types across all apps
- `npm run dev:native`: Start the React Native/Expo development server

## Documentation
- Docs: [Documentation Doc] (https://docs.google.com/document/d/1xdY8uzzLSj79FdIuDiL4xp_QojdCVcxX7tmX4KEyx7M/edit?tab=t.ac70lifoc3ui)
- Figma: [Mocks] (https://www.figma.com/design/xmfq0nX8GzbLPEG9Dj3mfZ/Design-System-EHC-GYM?node-id=49-7390&t=gnWnIHrg3r2z4ahp-1)
- Notion: [Roles Docs] (https://www.notion.so/EHC-GYM-24e4722f677880d69fc2d0c17d2835fb?source=copy_link)
