import { html, render } from 'lit-html';
import { getCountries } from '@yusifaliyevpro/countries';

// specific fields to fetch (limit 10)
const countryFields = [
  'name', 'population', 'region', 'capital', 'flags', 'cca3',
  'subregion', 'currencies', 'languages', 'borders'
] as const;

// Define interface manually matching the fetched fields for clarity & type safety
interface Country {
  name: {
    common: string;
    nativeName?: Record<string, { common: string }>;
  };
  population: number;
  region: string;
  capital?: string[];
  flags: { svg: string; png: string };
  cca3: string;
  subregion?: string;
  currencies?: Record<string, { name: string }>;
  languages?: Record<string, string>;
  borders?: string[];
}

interface AppState {
  countries: Country[];
  filteredCountries: Country[];
  loading: boolean;
  error: string | null;
  darkMode: boolean;
  selectedCountry: Country | null;
  searchTerm: string;
  regionFilter: string;
}

// Reactive State Management
const createState = <T extends object>(initialState: T): T => {
  return new Proxy(initialState, {
    set(target, property, value) {
      const result = Reflect.set(target, property, value);

      // Derived State Logic: Auto-update filteredCountries
      if (property === 'countries' || property === 'searchTerm' || property === 'regionFilter') {
        const s = target as unknown as AppState;
        s.filteredCountries = s.countries.filter(country => {
          const matchesSearch = country.name.common.toLowerCase().includes(s.searchTerm);
          const matchesRegion = s.regionFilter ? country.region === s.regionFilter : true;
          return matchesSearch && matchesRegion;
        });
      }

      render(AppView(), document.body);
      return result;
    }
  });
};

const state = createState<AppState>({
  countries: [],
  filteredCountries: [],
  loading: true,
  error: null,
  darkMode: false,
  selectedCountry: null,
  searchTerm: '',
  regionFilter: '',
});

const toggleDarkMode = () => {
  state.darkMode = !state.darkMode;
  if (state.darkMode) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('darkMode', 'true');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('darkMode', 'false');
  }
};

function handleSearch(this: HTMLInputElement) {
  state.searchTerm = this.value.toLowerCase();
};

function handleRegionFilter(this: HTMLSelectElement) {
  state.regionFilter = this.value;
};

const handleRouting = () => {
  const hash = window.location.hash.slice(1); // remove '#'
  if (hash) {
    // Note: Use cca3 from hash to find country
    const country = state.countries.find(c => c.cca3 === hash);
    if (country) {
      state.selectedCountry = country;
      window.scrollTo(0, 0);
    } else {
      // If country not found (maybe invalid hash), go back to home
      state.selectedCountry = null;
    }
  } else {
    state.selectedCountry = null;
  }
};

const goBack = () => {
  window.location.hash = '';
};

const fetchCountriesData = async () => {
  try {
    // Cast result to Country[] because of strict library typing vs our manual interface
    const data = await getCountries({ fields: countryFields }) as unknown as Country[];
    state.countries = data;
    // state.filteredCountries is derived automatically by the Proxy when 'countries' is set
    state.loading = false;
    handleRouting(); // Handle initial hash (deep link) after data load
  } catch (err) {
    state.error = (err as Error).message;
    state.loading = false;
  }
};

window.addEventListener('hashchange', handleRouting);

// Components
const HeaderView = () => html`
  <header class="bg-white dark:bg-blue-900 shadow-md py-6 px-12 md:px-20 flex justify-between items-center transition-colors duration-200">
    <h1 class="font-extrabold text-lg md:text-2xl text-grey-950 dark:text-white">Where in the world?</h1>
    <button @click=${toggleDarkMode} class="flex items-center gap-2 font-semibold text-grey-950 dark:text-white">
      <span class="${state.darkMode ? 'material-icons' : 'material-icons-outlined'}">dark_mode</span>
      ${state.darkMode ? 'Light Mode' : 'Dark Mode'}
    </button>
  </header>
`;

const CountryCardView = (country: Country) => html`
  <a href="#${country.cca3}" class="bg-white dark:bg-blue-900 rounded-md shadow-md overflow-hidden block hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-blue-950" aria-label="View details for ${country.name.common}">
    <article>
      <img src="${country.flags.png}" alt="Flag of ${country.name.common}" class="w-full aspect-[3/2] object-fill">
      <div class="p-6">
        <h2 class="font-extrabold text-lg mb-4 text-grey-950 dark:text-white">${country.name.common}</h2>
        <dl class="text-sm space-y-1 text-grey-950 dark:text-white">
          <div><dt class="font-semibold inline">Population:</dt> <dd class="inline">${country.population.toLocaleString()}</dd></div>
          <div><dt class="font-semibold inline">Region:</dt> <dd class="inline">${country.region}</dd></div>
          <div><dt class="font-semibold inline">Capital:</dt> <dd class="inline">${country.capital?.[0] || 'N/A'}</dd></div>
        </dl>
      </div>
    </article>
  </a>
`;

const HomeView = () => html`
  <section aria-label="Search and filter controls">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12 md:mb-16">
      <div class="relative w-full md:w-96 shadow-md rounded-md bg-white dark:bg-blue-900">
        <span class="absolute left-6 top-4 text-grey-400 dark:text-white material-icons" aria-hidden="true">search</span>
        <label for="country-search" class="sr-only">Search for a country</label>
        <input 
          id="country-search"
          type="text" 
          placeholder="Search for a country..." 
          .value=${state.searchTerm}
          @input=${handleSearch}
          class="w-full pl-16 pr-4 py-4 rounded-md bg-transparent text-grey-950 dark:text-white placeholder-grey-400 dark:placeholder-white outline-none font-semibold"
          aria-label="Search for a country"
        >
      </div>
      
      <div class="relative w-48 shadow-md rounded-md bg-white dark:bg-blue-900">
        <label for="region-filter" class="sr-only">Filter by region</label>
        <select 
          id="region-filter"
          .value=${state.regionFilter}
          @change=${handleRegionFilter}
          class="w-full px-6 py-4 rounded-md bg-transparent text-grey-950 dark:text-white appearance-none cursor-pointer outline-none font-semibold"
          aria-label="Filter countries by region"
        >
          <option value="" disabled selected hidden>Filter by Region</option>
          <option value="" class="bg-white dark:bg-blue-900">All Regions</option>
          <option value="Africa" class="bg-white dark:bg-blue-900">Africa</option>
          <option value="Americas" class="bg-white dark:bg-blue-900">Americas</option>
          <option value="Asia" class="bg-white dark:bg-blue-900">Asia</option>
          <option value="Europe" class="bg-white dark:bg-blue-900">Europe</option>
          <option value="Oceania" class="bg-white dark:bg-blue-900">Oceania</option>
        </select>
         <span class="absolute right-4 top-4 pointer-events-none text-grey-400 dark:text-white material-icons" aria-hidden="true">expand_more</span>
      </div>
    </div>
  </section>

  ${state.loading ? html`<p class="text-center text-xl" role="status" aria-live="polite">Loading countries...</p>` : ''}
  ${state.error ? html`<p class="text-center text-red-500" role="alert">${state.error}</p>` : ''}
  
  <section aria-label="Countries list" role="region">
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 md:gap-20">
      ${state.filteredCountries.map(CountryCardView)}
    </div>
    ${!state.loading && state.filteredCountries.length === 0 ? html`<p class="text-center text-xl" role="status">No countries found matching your search.</p>` : ''}
  </section>
`;

const DetailView = (country: Country) => {
  // Helper to find border country name
  const getBorderName = (code: string) => {
    // Note: v3.1 uses 'cca3' for alpha3Code
    const borderCountry = state.countries.find(c => c.cca3 === code);
    return borderCountry ? borderCountry.name.common : code;
  };

  // v3.1 helpers
  const nativeName = country.name.nativeName
    ? Object.values(country.name.nativeName)[0]?.common
    : country.name.common;

  const currencies = country.currencies
    ? Object.values(country.currencies).map(c => c.name).join(', ')
    : 'N/A';

  // v3.1 languages is { key: string }
  const languages = country.languages
    ? Object.values(country.languages).join(', ')
    : 'N/A';

  return html`
    <nav aria-label="Back to countries list">
      <button @click=${goBack} class="bg-white dark:bg-blue-900 shadow-md px-8 py-2 rounded-md mb-12 text-grey-950 dark:text-white flex items-center gap-2 hover:opacity-75 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-blue-950" aria-label="Go back to countries list">
         <span class="material-icons" aria-hidden="true">arrow_back</span> Back
      </button>
    </nav>

    <article class="flex flex-col lg:flex-row gap-12 lg:gap-28 items-center lg:items-start text-grey-950 dark:text-white">
        <img src="${country.flags.svg}" alt="Flag of ${country.name.common}" class="w-full lg:w-1/2 max-w-xl shadow-lg">
        
        <section aria-labelledby="country-name">
            <h2 id="country-name" class="text-3xl font-extrabold mb-8">${country.name.common}</h2>
            
            <div class="flex flex-col md:flex-row gap-8 md:gap-16 mb-12">
                <dl class="space-y-2">
                    <div><dt class="font-semibold inline">Native Name:</dt> <dd class="inline">${nativeName}</dd></div>
                    <div><dt class="font-semibold inline">Population:</dt> <dd class="inline">${country.population.toLocaleString()}</dd></div>
                    <div><dt class="font-semibold inline">Region:</dt> <dd class="inline">${country.region}</dd></div>
                    <div><dt class="font-semibold inline">Sub Region:</dt> <dd class="inline">${country.subregion}</dd></div>
                    <div><dt class="font-semibold inline">Capital:</dt> <dd class="inline">${country.capital?.[0] || 'N/A'}</dd></div>
                </dl>
                <dl class="space-y-2">
                    <div><dt class="font-semibold inline">Currencies:</dt> <dd class="inline">${currencies}</dd></div>
                    <div><dt class="font-semibold inline">Languages:</dt> <dd class="inline">${languages}</dd></div>
                </dl>
            </div>

            <section aria-labelledby="border-countries-heading">
                <div class="flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <h3 id="border-countries-heading" class="font-semibold text-lg whitespace-nowrap">Border Countries:</h3>
                    <nav aria-label="Neighboring countries">
                      <div class="flex flex-wrap gap-2" role="list">
                          ${country.borders?.length ? country.borders.map(border => html`
                              <a 
                                  href="#${border}"
                                  role="listitem"
                                  class="bg-white dark:bg-blue-900 border-2 border-gray-200 dark:border-none px-6 py-1 rounded text-sm hover:opacity-75 transition-opacity text-grey-950 dark:text-white font-light inline-block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-blue-950"
                                  aria-label="View details for ${getBorderName(border)}"
                              >
                                  ${getBorderName(border)}
                              </a>
                          `) : html`<span class="opacity-75" role="listitem">None</span>`}
                      </div>
                    </nav>
                </div>
            </section>
        </section>
    </article>
    `;
};

const AppView = () => html`
  ${HeaderView()}
  <main class="container mx-auto px-12 md:px-20 py-8 min-h-screen">
    ${state.selectedCountry ? DetailView(state.selectedCountry) : HomeView()}
  </main>
`;


// Initialize Dark Mode
if (localStorage.getItem('darkMode') === 'true' ||
  (!('darkMode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  state.darkMode = true;
  document.documentElement.classList.add('dark');
} else {
  state.darkMode = false;
  document.documentElement.classList.remove('dark');
}

fetchCountriesData();

