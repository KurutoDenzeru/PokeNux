![PokéNux](/public/OpenGraph.webp)

# PokéNux - RESTful API Pokedex

🧬 Sleek and responsive Pokédex built with Nuxt, Vue, TypeScript, Pinia, Tailwind, shadcn/ui, and powered by PokéAPI and the tcgdex/sdk. It provides interface for TCG database.

## ☁️ Deploy your own

[![Deploy with Vercel](_deploy_vercel.svg)](https://vercel.com/new/clone?repository-url=https://github.com/KurutoDenzeru/PokéNux)  [![Deploy with Netlify](_deploy_netlify.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/KurutoDenzeru/PokéNux)


## ✨ Features

- **Comprehensive Pokédex:** Browse detailed information about Pokémon, including stats, abilities, and evolution chains.
- **TCG Card Database:** Explore a vast collection of Pokémon TCG cards, complete with stats, rarities, and set details.
- **Responsive Design:** Enjoy a seamless experience on any device, thanks to Tailwind CSS.
- **SEO Optimized:** Built with Nuxt.js, ensuring excellent search engine visibility.
- **PWA Support:** Ready to be installed as a Progressive Web App for offline access and enhanced user experience.

## 🧱 Tech Stack

- [Nuxt.js](https://nuxt.com/) - A progressive Vue.js framework.
- [Tailwind](https://tailwindcss.com/) - A utility-first CSS framework for rapid UI development.
- [PokéAPI](https://pokeapi.co/) - RESTful API for Pokémon information.
- [Pokémon TCG Dex](https://https://tcgdex.dev/) - Comprehensive Pokémon Trading Card Game database.
- [TypeScript](https://www.typescriptlang.org/) - A superset of JavaScript that adds static typing.


## ⚡ Getting Started

Clone the repo, install deps, and boot the dev server:

```bash
git clone https://github.com/KurutoDenzeru/PokeNux.git
cd PokeNux
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📦 Build for Production

```bash
bun run build
bun start
```

## 🗂️ Configuration

The editor is componentized under `app/components`. Key areas to customize are:

```text
app/
  components/
    pokemon/
      PokemonGrid.vue            # Pokémon grid display
      PokemonSearch.vue          # Search bar for Pokémon
      detail/
        PokemonArtworkPanel.vue  # Artwork panel
        PokemonBaseStats.vue     # Base stats table
        PokemonTCGCards.vue      # TCG card list
  composables/
    usePokemonGrid.ts            # Pokémon grid logic
    usePokemonDetail.ts          # Pokémon detail logic
  layouts/
    BaseLayout.vue               # Main layout wrapper
  pages/
    index.vue                    # Home page
    team-builder.vue             # Team builder page
    pokemon/                     # Pokémon dynamic routes
      [id].vue                   # Pokémon by ID
      [name].vue                 # Pokémon by name
stores/
  filterStore.ts                 # Filter state
  teamBuilder.ts                 # Team builder state
  moveCategory.ts                # Move category state
  userPreferences.ts             # User preferences state
  types.ts                       # Store types
lib/
  cacheManager.ts                # Cache management
  fetchUtils.ts                  # Fetch helpers
  pokeCache.ts                   # Pokémon cache logic
  storage.ts                     # Storage utilities
  teamUtils.ts                   # Team utilities
  type-classes.ts                # Type class helpers
```

## 🤝🏻 Contributing

Contributions are always welcome, whether you’re fixing bugs, improving docs, or shipping new features that make the project better for everyone.

Check out [Contributing.md](Contributing) to learn how to get started and follow the recommended workflow.

## ⚖️ License

This project is released under the Apache License 2.0, allowing you to use, modify, and distribute the code freely. The license also provides explicit patent rights and requires preservation of copyright and license notices.

For the full legal text, see the [Apache License 2.0](LICENSE) file.

