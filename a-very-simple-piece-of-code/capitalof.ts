const countries: { [key: string]: { [key: string]: (string | ((number) => string)) } } = {
  "CA": {
    "AB": "Edmonton",
    "BC": "Victoria",
    "MB": "Winnipeg",
    // etc.
  },
  "US": {
    "AL":     (year    ) =>     {
      if (year < 1846) { return "Tuscaloosa"; }
      return "Montgomery"
    },
    "AK": "Juneau",
    "AR": "Phoenix",
    // etc.
  },
}

function capitalOf(country: string, stateOrProvinceName: string, year: number): string {
    let capital = (countries[country] || {})[stateOrProvinceName]
    while (typeof capital === 'function') {
        capital = capital(year)
    }
    return capital || 'nil'
}

console.log(capitalOf('constructor', 'constructor', 'alert(1)'))
