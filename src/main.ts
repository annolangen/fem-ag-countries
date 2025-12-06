import { html, render } from 'lit-html';

interface Country {
  name: string;
  population: number;
  region: string;
  capital?: string;
  flags: {
    svg: string;
    png: string;
  };
  alpha3Code: string;
  nativeName?: string;
  subregion?: string;
  topLevelDomain?: string[];
  currencies?: { name: string }[];
  languages?: { name: string }[];
  borders?: string[];
}

interface AppState {
  countries: Country[];
  filteredCountries: Country[];
  loading: boolean;
  error: string | null;
  darkMode: boolean;
  view: 'home' | 'detail';
  selectedCountry: Country | null;
  searchTerm: string;
  regionFilter: string;
}

const state: AppState = {
  countries: [],
  filteredCountries: [],
  loading: true,
  error: null,
  darkMode: false,
  view: 'home',
  selectedCountry: null,
  searchTerm: '',
  regionFilter: '',
};

// Initialize Dark Mode
if (localStorage.getItem('darkMode') === 'true' ||
  (!('darkMode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  state.darkMode = true;
  document.documentElement.classList.add('dark');
} else {
  state.darkMode = false;
  document.documentElement.classList.remove('dark');
}

const update = () => {
  render(appTemplate(), document.body);
};

const toggleDarkMode = () => {
  state.darkMode = !state.darkMode;
  if (state.darkMode) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('darkMode', 'true');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('darkMode', 'false');
  }
  update();
};

const handleSearch = (e: InputEvent) => {
  const target = e.target as HTMLInputElement;
  state.searchTerm = target.value.toLowerCase();
  applyFilters();
};

const handleRegionFilter = (e: Event) => {
  const target = e.target as HTMLSelectElement;
  state.regionFilter = target.value;
  applyFilters();
};

const applyFilters = () => {
  state.filteredCountries = state.countries.filter(country => {
    const matchesSearch = country.name.toLowerCase().includes(state.searchTerm);
    const matchesRegion = state.regionFilter ? country.region === state.regionFilter : true;
    return matchesSearch && matchesRegion;
  });
  update();
};

const showDetail = (country: Country) => {
  state.selectedCountry = country;
  state.view = 'detail';
  window.scrollTo(0, 0);
  update();
};

const goBack = () => {
  state.view = 'home';
  state.selectedCountry = null;
  update();
};

const fetchCountries = async () => {
  try {
    const response = await fetch('/data.json');
    if (!response.ok) throw new Error('Failed to load data');
    const data = await response.json();
    state.countries = data;
    state.filteredCountries = data;
    state.loading = false;
  } catch (err) {
    state.error = (err as Error).message;
    state.loading = false;
  }
  update();
};

// Components
const Header = () => html`
  <header class="bg-white dark:bg-blue-900 shadow-md py-6 px-12 md:px-20 flex justify-between items-center transition-colors duration-200">
    <h1 class="font-extrabold text-lg md:text-2xl text-grey-950 dark:text-white">Where in the world?</h1>
    <button @click=${toggleDarkMode} class="flex items-center gap-2 font-semibold text-grey-950 dark:text-white">
      <span class="${state.darkMode ? 'material-icons' : 'material-icons-outlined'}">dark_mode</span>
      ${state.darkMode ? 'Light Mode' : 'Dark Mode'}
    </button>
  </header>
`;

const CountryCard = (country: Country) => html`
  <div @click=${() => showDetail(country)} class="bg-white dark:bg-blue-900 rounded-md shadow-md overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200">
    <img src="${country.flags.png}" alt="${country.name} Flag" class="w-full aspect-[3/2] object-fill">
    <div class="p-6">
      <h2 class="font-extrabold text-lg mb-4 text-grey-950 dark:text-white">${country.name}</h2>
      <div class="text-sm space-y-1 text-grey-950 dark:text-white">
        <p><span class="font-semibold">Population:</span> ${country.population.toLocaleString()}</p>
        <p><span class="font-semibold">Region:</span> ${country.region}</p>
        <p><span class="font-semibold">Capital:</span> ${country.capital}</p>
      </div>
    </div>
  </div>
`;

const HomeView = () => html`
  <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12 md:mb-16">
    <div class="relative w-full md:w-96 shadow-md rounded-md bg-white dark:bg-blue-900">
      <span class="absolute left-6 top-4 text-grey-400 dark:text-white material-icons">search</span>
      <input 
        type="text" 
        placeholder="Search for a country..." 
        @input=${handleSearch}
        class="w-full pl-16 pr-4 py-4 rounded-md bg-transparent text-grey-950 dark:text-white placeholder-grey-400 dark:placeholder-white outline-none font-semibold"
      >
    </div>
    
    <div class="relative w-48 shadow-md rounded-md bg-white dark:bg-blue-900">
      <select 
        @change=${handleRegionFilter}
        class="w-full px-6 py-4 rounded-md bg-transparent text-grey-950 dark:text-white appearance-none cursor-pointer outline-none font-semibold"
      >
        <option value="" disabled selected hidden>Filter by Region</option>
        <option value="" class="bg-white dark:bg-blue-900">All Regions</option>
        <option value="Africa" class="bg-white dark:bg-blue-900">Africa</option>
        <option value="Americas" class="bg-white dark:bg-blue-900">Americas</option>
        <option value="Asia" class="bg-white dark:bg-blue-900">Asia</option>
        <option value="Europe" class="bg-white dark:bg-blue-900">Europe</option>
        <option value="Oceania" class="bg-white dark:bg-blue-900">Oceania</option>
      </select>
       <span class="absolute right-4 top-4 pointer-events-none text-grey-400 dark:text-white material-icons">expand_more</span>
    </div>
  </div>

  ${state.loading ? html`<p class="text-center text-xl">Loading...</p>` : ''}
  ${state.error ? html`<p class="text-center text-red-500">${state.error}</p>` : ''}
  
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 md:gap-20">
    ${state.filteredCountries.map(CountryCard)}
  </div>
`;

const DetailView = () => {
  if (!state.selectedCountry) return html``;
  const country = state.selectedCountry;

  // Helper to find border country name
  const getBorderName = (code: string) => {
    const borderCountry = state.countries.find(c => c.alpha3Code === code);
    return borderCountry ? borderCountry.name : code;
  };

  return html`
    <button @click=${goBack} class="bg-white dark:bg-blue-900 shadow-md px-8 py-2 rounded-md mb-12 text-grey-950 dark:text-white flex items-center gap-2 hover:opacity-75 transition-opacity">
       <span class="material-icons">arrow_back</span> Back
    </button>

    <div class="flex flex-col lg:flex-row gap-12 lg:gap-28 items-center lg:items-start text-grey-950 dark:text-white">
        <img src="${country.flags.svg}" alt="${country.name} Flag" class="w-full lg:w-1/2 max-w-xl shadow-lg">
        
        <div class="w-full lg:w-1/2 py-8">
            <h2 class="text-3xl font-extrabold mb-8">${country.name}</h2>
            
            <div class="flex flex-col md:flex-row gap-8 md:gap-16 mb-12">
                <div class="space-y-2">
                    <p><span class="font-semibold">Native Name:</span> ${country.nativeName}</p>
                    <p><span class="font-semibold">Population:</span> ${country.population.toLocaleString()}</p>
                    <p><span class="font-semibold">Region:</span> ${country.region}</p>
                    <p><span class="font-semibold">Sub Region:</span> ${country.subregion}</p>
                    <p><span class="font-semibold">Capital:</span> ${country.capital}</p>
                </div>
                <div class="space-y-2">
                    <p><span class="font-semibold">Top Level Domain:</span> ${country.topLevelDomain?.join(', ')}</p>
                    <p><span class="font-semibold">Currencies:</span> ${country.currencies?.map(c => c.name).join(', ')}</p>
                    <p><span class="font-semibold">Languages:</span> ${country.languages?.map(l => l.name).join(', ')}</p>
                </div>
            </div>

            <div class="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <span class="font-semibold text-lg whitespace-nowrap">Border Countries:</span>
                <div class="flex flex-wrap gap-2">
                    ${country.borders?.length ? country.borders.map(border => html`
                        <button 
                            @click=${() => {
      const borderCountry = state.countries.find(c => c.alpha3Code === border);
      if (borderCountry) showDetail(borderCountry);
    }}
                            class="bg-white dark:bg-blue-900 shadow-sm px-6 py-1 rounded-sm text-sm hover:opacity-75 transition-opacity text-grey-950 dark:text-white"
                        >
                            ${getBorderName(border)}
                        </button>
                    `) : html`<span class="opacity-75">None</span>`}
                </div>
            </div>
        </div>
    </div>
    `;
};

const appTemplate = () => html`
  ${Header()}
  <main class="container mx-auto px-12 md:px-20 py-8 min-h-screen">
    ${state.view === 'home' ? HomeView() : DetailView()}
  </main>
`;

fetchCountries();
