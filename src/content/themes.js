// Palety kolorów wybierane z panelu. Klucz motywu zapisuje się w

// site_settings.theme, a tokeny nadpisują zmienne CSS z src/index.css.

// Motyw „mocha” celowo ma pusty zestaw tokenów — to wartości z index.css.



export const DEFAULT_THEME = 'mocha'



const canonicalMocha = {

  '--krem': '#fbf8f5',

  '--krem-rgb': '251, 248, 245',

  '--bordo': '#57172a',

  '--bordo-rgb': '87, 23, 42',

  '--zloto': '#c5a059',

  '--zloto-rgb': '197, 160, 89',

  '--tekst': '#3a1a24',

  '--tekst-miekki': '#52303a',

  '--radius': '2px',

}



const themes = {

  mocha: {

    label: 'Mocha i złoto',

    description: 'Paleta domyślna: ciepła kawa, złoto i kremowy róż.',

    swatch: ['#fff0f3', '#c5a059', '#4a3a33', '#5c1b2f'],

    tokens: {},

  },



  rose: {

    label: 'Pudrowy róż',

    description: 'Lżejsza, bardziej różowa wersja tej samej kompozycji.',

    swatch: ['#fff5f6', '#c9a24c', '#6b4551', '#7c2340'],

    tokens: {

      ...canonicalMocha,

      '--krem': '#fff5f6',

      '--krem-rgb': '255, 245, 246',

      '--bordo': '#7c2340',

      '--bordo-rgb': '124, 35, 64',

      '--zloto': '#c9a24c',

      '--zloto-rgb': '201, 162, 76',

      '--tekst': '#3a1a24',

      '--tekst-miekki': '#4f323c',

      '--color-gold-light': '#e8d6ab',

      '--color-gold-dark': '#a5813a',

      '--color-gold-ink': '#75581d',

      '--color-pink': '#eec3ca',

      '--color-pink-soft': '#fae8eb',

      '--color-deep': '#6b4551',

      '--color-deep-rgb': '107, 69, 81',

      '--color-deep-strong': '#3d2530',

      '--color-deep-soft': '#a1808c',

      '--color-deep-tint': '#fbeef1',

      '--color-berry-deep': '#4d1327',

      '--color-berry-soft': '#a84763',

      '--gold-gradient': 'linear-gradient(135deg, #efdcb2 0%, #c9a24c 42%, #b28d45 100%)',

      '--gold-gradient-hover': 'linear-gradient(135deg, #f6ebcf 0%, #d9bd6e 46%, #c9a24c 100%)',

      '--deep-gradient': 'linear-gradient(150deg, #7a4f5c 0%, #563543 58%, #3d2530 100%)',

      '--berry-gradient': 'linear-gradient(155deg, #8d2b49 0%, #6a1c34 55%, #47101f 100%)',

    },

  },



  sage: {

    label: 'Szałwia i złoto',

    description: 'Spokojna zieleń — bardziej „gabinet medyczny” niż salon.',

    swatch: ['#f4f6f1', '#b39758', '#3f4a41', '#2f4136'],

    tokens: {

      ...canonicalMocha,

      '--krem': '#f4f6f1',

      '--krem-rgb': '244, 246, 241',

      '--bordo': '#2f4136',

      '--bordo-rgb': '47, 65, 54',

      '--zloto': '#b39758',

      '--zloto-rgb': '179, 151, 88',

      '--tekst': '#242a24',

      '--tekst-miekki': '#3a433c',

      '--color-gold-light': '#dccfa6',

      '--color-gold-dark': '#8f7742',

      '--color-gold-ink': '#5f4f22',

      '--color-pink': '#cfd9c8',

      '--color-pink-soft': '#e8eee2',

      '--color-deep': '#3f4a41',

      '--color-deep-rgb': '63, 74, 65',

      '--color-deep-strong': '#232b24',

      '--color-deep-soft': '#7b8a7c',

      '--color-deep-tint': '#eef2ea',

      '--color-berry-deep': '#1b2720',

      '--color-berry-soft': '#5a7060',

      '--gold-gradient': 'linear-gradient(135deg, #e0d3aa 0%, #b39758 42%, #9c8146 100%)',

      '--gold-gradient-hover': 'linear-gradient(135deg, #ebe0bb 0%, #c4ad74 46%, #b39758 100%)',

      '--deep-gradient': 'linear-gradient(150deg, #4b584d 0%, #36402f 58%, #232b24 100%)',

      '--berry-gradient': 'linear-gradient(155deg, #3a5041 0%, #2b3b30 55%, #1b2720 100%)',

    },

  },



  noir: {

    label: 'Grafit i szampan',

    description: 'Najbardziej kontrastowa opcja: chłodny grafit i jasne złoto.',

    swatch: ['#f7f5f2', '#cbb178', '#2f3033', '#1d1e21'],

    tokens: {

      ...canonicalMocha,

      '--krem': '#f7f5f2',

      '--krem-rgb': '247, 245, 242',

      '--bordo': '#1d1e21',

      '--bordo-rgb': '29, 30, 33',

      '--zloto': '#cbb178',

      '--zloto-rgb': '203, 177, 120',

      '--tekst': '#232326',

      '--tekst-miekki': '#3a3a3e',

      '--color-gold-light': '#ecdfbb',

      '--color-gold-dark': '#a68f5b',

      '--color-gold-ink': '#6d5c31',

      '--color-pink': '#ded8cf',

      '--color-pink-soft': '#f0ece6',

      '--color-deep': '#2f3033',

      '--color-deep-rgb': '47, 48, 51',

      '--color-deep-strong': '#191a1d',

      '--color-deep-soft': '#75767a',

      '--color-deep-tint': '#eeecea',

      '--color-berry-deep': '#101114',

      '--color-berry-soft': '#4a4b50',

      '--gold-gradient': 'linear-gradient(135deg, #f0e4c2 0%, #cbb178 42%, #b09a63 100%)',

      '--gold-gradient-hover': 'linear-gradient(135deg, #f6edd4 0%, #d9c38c 46%, #cbb178 100%)',

      '--deep-gradient': 'linear-gradient(150deg, #3a3b3f 0%, #26272a 58%, #191a1d 100%)',

      '--berry-gradient': 'linear-gradient(155deg, #2a2b2f 0%, #1d1e21 55%, #101114 100%)',

    },

  },

}






export function themeTokens(themeKey, overrides = {}) {

  const base = themes[themeKey]?.tokens ?? themes[DEFAULT_THEME].tokens

  return { ...base, ...overrides }

}

