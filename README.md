![PokéNux](/public/OpenGraph.webp)

# PokéNux - RESTful API Pokedex

Sleek and responsive Pokédex built with Nuxt.js, styled using Tailwind, and powered by PokéAPI and the Pokémon TCG Dex. It provides an intuitive interface for exploring Pokémon details and a comprehensive database of Pokémon TCG Dex.

## 🚀 Deploy your own

[![Deploy with Vercel](_deploy_vercel.svg)](https://vercel.com/new/clone?repository-url=https://github.com/KurutoDenzeru/PokéNux)  [![Deploy with Netlify](_deploy_netlify.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/KurutoDenzeru/PokéNux)

## 💻 Commands

All commands are run from the root of the project, from a terminal:

Replace npm with your package manager of choice. `npm`, `pnpm`, `yarn`, `bun`, etc

| Command                   | Action                                       |
| :------------------------ | :------------------------------------------- |
| `bun install`             | Installs dependencies                        |
| `bun run dev`             | Starts local dev server at `localhost:4321`  |
| `bun run dev:network`     | Starts dev server on local network           |
| `bun run build`           | Build your production site to `./dist/`      |
| `bun run preview`         | Preview your build locally, before deploying |
| `bun run preview:network` | Starts preview server on local network       |

## Tech Stack

- [Nuxt.js](https://nuxt.com/) - A progressive Vue.js framework.
- [Tailwind](https://tailwindcss.com/) - A utility-first CSS framework for rapid UI development.
- [PokéAPI](https://pokeapi.co/) - RESTful API for Pokémon information.
- [Pokémon TCG Dex](https://https://tcgdex.dev/) - Comprehensive Pokémon Trading Card Game database (TCG Dex).
- [TypeScript](https://www.typescriptlang.org/) - A superset of JavaScript that adds static typing.
## Features

- **Comprehensive Pokédex:** Browse detailed information about Pokémon, including stats, abilities, and evolution chains.
- **TCG Card Database:** Explore a vast collection of Pokémon TCG cards, complete with stats, rarities, and set details.
- **Responsive Design:** Enjoy a seamless experience on any device, thanks to Tailwind CSS.
- **SEO Optimized:** Built with Nuxt.js, ensuring excellent search engine visibility.
- **PWA Support:** Ready to be installed as a Progressive Web App for offline access and enhanced user experience.

## Configuration

The application's behavior can be customized via the `nuxt.config.ts` file. Key configurations include:

- **Modules:** `@nuxtjs/tailwindcss`, `nuxt-vitalizer`, `@nuxtjs/sitemap`.
- **CSS:** Global styles are defined in `~/assets/css/main.css`.
- **Content Security Policy:** Configured in `nitro.routeRules` to enhance security.
- **Site Metadata:** Defined under the `site` property for SEO purposes.

## Data Fetching

The project uses the following data fetching strategies:

- `useFetch`: For standard data fetching with SSR, caching, and reactive updates.
- `$fetch`: For client-side requests within event handlers or when SSR is not needed.
- `useAsyncData`: For complex data fetching logic, such as combining multiple API calls.

## Naming Conventions

- Composables are named as `use<MyComposable>`.
- Component files use **PascalCase** (e.g., `components/MyComponent.vue`).
- Named exports are preferred for functions.

## Contributing

Contributions are always welcome!

See [Contributing.md](Contributing.md) for ways to get started.

## License

[Apache License 2.0](LICENSE)

