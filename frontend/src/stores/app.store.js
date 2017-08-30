import { action, observable } from 'mobx';

export const STEPS = {
  'home': Symbol('home'),
  'load-wallet': Symbol('load-wallet'),
  'create-wallet': Symbol('create-wallet')
};

class AppStore {
  @observable step = STEPS['home'];

  @action
  goto (name) {
    if (!STEPS[name]) {
      return;
    }

    this.step = STEPS[name];
  }
}

export default new AppStore();
