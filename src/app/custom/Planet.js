import EventEmitter from 'eventemitter3';
import { delay } from '../utils';
import Person from './Person';

export default class Planet extends EventEmitter {
  constructor(planet, config, peopleData) {
    super();
    this.name = planet.name;
    this.config = config;
    this.peopleData = peopleData;
    this.population = [];
    this.recursiveCallPersion = 0;
  }

  static get events() {
    return { PERSON_BORN: 'person_born', POPULATING_COMPLETED: 'populating_completed' };
  }

  get populationCount() {
    return this.population.length;
  }

  async populate() {
    await delay(this.config.populationDelay);

    const currentPerson = this.peopleData[this.recursiveCallPersion];
    const currentPersonObjectInstance = new Person(currentPerson.name, currentPerson.height, currentPerson.mass);

    this.population.push(currentPersonObjectInstance);
    this.emit(Planet.events.PERSON_BORN, { filmUrls: currentPerson.films });
    this.recursiveCallPersion += 1;

    if (this.recursiveCallPersion > this.peopleData.length - 1) {
      this.emit(Planet.events.POPULATING_COMPLETED);

      return;
    }

    this.populate();
  }
}
