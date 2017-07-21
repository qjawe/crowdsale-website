import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { Icon, Popup, Statistic } from 'semantic-ui-react';

import auctionStore from '../../stores/auction.store';
import { fromWei } from '../../utils';

const hSpaceStyle = {
  width: '0.5em'
};

@observer
export default class Spendable extends Component {
  render () {
    const { maxSpend } = auctionStore;

    return (
      <Statistic>
        <Statistic.Label>
          Maximum spend
          <span style={hSpaceStyle}>&nbsp;</span>
          <Popup
            content={`
              Lorem ipsum dolor sit amet,
              consectetur adipiscing elit.
              Pellentesque urna erat, lacinia
              vitae mollis finibus, consequat in
              tortor. Sed nec elementum tortor.
            `}
            size='small'
            trigger={<Icon name='info circle' />}
          />
        </Statistic.Label>
        <Statistic.Value>
          <span>{fromWei(maxSpend).toFormat(2)}</span>
          <small> ETH</small>
        </Statistic.Value>
      </Statistic>
    );
  }
}
