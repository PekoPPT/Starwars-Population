import EventEmitter from 'eventemitter3';
import Films from './Films';
import Planet from './Planet';

export default class StarWarsUniverse extends EventEmitter {
  constructor() {
    super();

    this.films = [];
    this.planet = null;
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
      let config = { populationDelay: 1 };
      const planetInstance = new Planet(zeroPopulationPlanet, config, peopleData.results);

      this.planet = planetInstance;
      this.planet.addListener('person_born', function _onPersonBorn(filmsUrl) {
        that.films.push(...filmsUrl.filmUrls.map(url => new Films(url)));
      });
      this.planet.addListener('populating_completed', function () {
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
