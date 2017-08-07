import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { Icon, Popup, Statistic } from 'semantic-ui-react';

import auctionStore from '../../stores/auction.store';

const hSpaceStyle = {
  width: '0.5em'
};

@observer
export default class Price extends Component {
  render () {
    const { endPrice } = auctionStore;

    return (
      <Statistic>
        <Statistic.Label>
          The final price will be at least
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
          <span>{auctionStore.formatPrice(endPrice).toFormat(5)}</span>
          <small> ETH/DOT</small>
        </Statistic.Value>
      </Statistic>
    );
  }
}
