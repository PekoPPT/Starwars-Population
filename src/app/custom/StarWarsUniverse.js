import EventEmitter from 'eventemitter3';
import Films from './Film';
import Planet from './Planet';

export default class StarWarsUniverse extends EventEmitter {
  constructor() {
    super();

    this.films = [];
    this.planet = null;
    this.filmUrlsSet = new Set();
  }

  async init() {
    const planets = [];
    let page = 1;
    let currentPage = await this.fetchPlanetsPage(page);

    planets.push(...currentPage.results);
    page += 1;

    while (currentPage.next !== null) {
      currentPage = await this.fetchPlanetsPage(page);
      planets.push(...currentPage.results);
      page += 1;
    }

    const zeroPopulationPlanet = planets.filter((planet) => planet.population == 0);

    await this.fetchPeoplePage(1).then((peopleData) => {
      const that = this;
      const config = { populationDelay: 1 };
      const planetInstance = new Planet(zeroPopulationPlanet, config, peopleData.results);

      this.planet = planetInstance;
      this.planet.addListener('person_born', function _onPersonBorn(filmsUrl) {
        const currentSetLength = that.filmUrlsSet.size;

        filmsUrl.filmUrls.forEach((url) => {
          that.filmUrlsSet.add(url);
        });
        if (currentSetLength != that.filmUrlsSet.size) {
          that.emit(StarWarsUniverse.events.FILM_ADDED);
        }
      });
      this.planet.addListener('populating_completed', function _onPopulationCompleted() {
        that.films.push(...[...that.filmUrlsSet].map((url) => new Films(url)));
        that.emit(StarWarsUniverse.events.UNIVERSE_POPULATED);
      });

      this.planet.populate();
    });
  }

  static get events() {
    return { FILM_ADDED: 'film_added', UNIVERSE_POPULATED: 'universe_populated' };
  }

  async fetchPlanetsPage(page) {
    const fetchedData = await fetch(`https://swapi.booost.bg/api/planets?page=${page}`);
    const jsonData = await fetchedData.json();

    return jsonData;
  }

  async fetchPeoplePage(page) {
    const fetchedData = await fetch(`https://swapi.booost.bg/api/people?page=${page}`);
    const jsonData = await fetchedData.json();

    return jsonData;
  }
}
