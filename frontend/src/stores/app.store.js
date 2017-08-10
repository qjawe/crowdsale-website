import { action, observable } from 'mobx';

export const STEPS = {
  'home': Symbol(),
  'load-wallet': Symbol(),
  'create-wallet': Symbol()
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
