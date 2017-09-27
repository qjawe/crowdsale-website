import { countries } from 'country-data';
import EventEmitter from 'eventemitter3';
import { difference, uniq } from 'lodash';
import { action, observable } from 'mobx';
import store from 'store';

import backend from '../backend';

export const CITIZENSHIP_LS_KEY = '_parity-crowdsale::citizenship';
export const TERMS_LS_KEY = '_parity-crowdsale::agreed-terms::v1';

// Messages displays for 15s
const MESSAGE_TIMELIFE = 1000 * 15;

export const STEPS = {
  'important-notice': Symbol('important notice'),
  'start': Symbol('start'),
  'terms': Symbol('terms'),
  'country-selection': Symbol('country selection'),
  'account-selection': Symbol('account selection'),
  'contribute': Symbol('contribute')
};

const padding = window.location.search !== '?no-padding';
let nextErrorId = 1;

if (padding) {
  document.querySelector('body').style.backgroundColor = '#f1f1f1';
  document.querySelector('html').style.backgroundColor = '#f1f1f1';
}

class AppStore extends EventEmitter {
  blacklistedCountries = [];
  certifierAddress = null;
  loaders = {};
  padding = padding;

  skipCountrySelection = false;
  skipStart = false;
  skipTerms = false;

  @observable loading = true;
  @observable messages = {};
  @observable termsAccepted = false;
  @observable step;
  @observable stepper = -1;

  constructor () {
    super();
    this.load();
  }

  load = () => {
    this._load()
      .catch((error) => this.addError(error));
  }

  _load = async () => {
    this.certifierAddress = await backend.certifierAddress();

    if (store.get(TERMS_LS_KEY) === true) {
      this.skipTerms = true;
    }

    await this.loadCountries();

    if (this.skipTerms && this.skipCountrySelection) {
      this.skipStart = true;
    }

    this.goto('important-notice');
  };

  async goto (name) {
    if (!STEPS[name]) {
      throw new Error(`unknown step ${name}`);
    }

    if (name === 'start' && this.skipStart) {
      return this.goto('terms');
    }

    if (name === 'terms' && this.skipTerms) {
      return this.goto('country-selection');
    }

    if (name === 'country-selection' && this.skipCountrySelection) {
    }

    this.setLoading(true);
    this.setStep(STEPS[name]);

    // Trigger the loaders and wait for them to return
    if (this.loaders[name]) {
      for (let loader of this.loaders[name]) {
        // A loader can return a truthy value to
        // skip further loadings
        const skip = await loader();

        if (skip) {
          return;
        }
      }
    }

    this.setLoading(false);
  }

  async fetchBlacklistedCountries () {
    return Promise.resolve(['USA', 'CHN']);
  }

  async loadCountries () {
    const blCountries = await this.fetchBlacklistedCountries();

    this.blacklistedCountries = blCountries
      .filter((countryKey) => {
        if (!countries[countryKey]) {
          console.error(new Error('unknown country key: ' + countryKey));
          return false;
        }

        return true;
      });

    const prevCountries = store.get(CITIZENSHIP_LS_KEY) || [];

    // The country selection can be skipped if the user
    // already said he was not from on of the
    // current blacklisted countries
    this.skipCountrySelection = difference(
      this.blacklistedCountries,
      prevCountries
    ).length === 0;
  }

  register (step, loader) {
    if (!STEPS[step]) {
      throw new Error(`unknown step ${step}`);
    }

    this.loaders[step] = (this.loaders[step] || []).concat(loader);
  }

  restart () {
    this.skipTerms = false;
    this.skipStart = false;

    store.remove(CITIZENSHIP_LS_KEY);
    store.remove(TERMS_LS_KEY);

    this.termsAccepted = false;

    this.emit('restart');
    this.goto('start');
  }

  addError (error) {
    if (!error) {
      return console.error('no error given....', error);
    }

    console.error(error);
    this.addMessage({ content: error.message, type: 'error', title: 'An error occured' });
  }

  @action addMessage ({ title, content, type }) {
    const id = nextErrorId++;

    this.messages = Object.assign({}, this.messages, { [id]: { title, content, type, id } });

    setTimeout(() => this.removeMessage(id), MESSAGE_TIMELIFE);
  }

  @action removeMessage (id) {
    const messages = Object.assign({}, this.messages);

    delete messages[id];
    this.messages = messages;
  }

  @action setLoading (loading) {
    this.loading = loading;
  }

  @action setTermsAccepted (termsAccepted) {
    this.termsAccepted = termsAccepted;
  }

  @action setStep (step) {
    // if (step === STEPS['terms'] || step === STEPS['country-selection']) {
    //   this.stepper = 0;
    // } else {
    //   this.stepper = -1;
    // }

    this.step = step;
  }

  storeValidCitizenship () {
    const prevState = store.get(CITIZENSHIP_LS_KEY) || [];
    const nextState = uniq(prevState.concat(this.blacklistedCountries));

    store.set(CITIZENSHIP_LS_KEY, nextState);
  }

  storeTermsAccepted () {
    store.set(TERMS_LS_KEY, this.termsAccepted);
  }
}

const appStore = new AppStore();

// window.appStore = appStore;
export default appStore;
