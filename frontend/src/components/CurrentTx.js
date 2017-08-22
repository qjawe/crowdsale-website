import { range } from 'lodash';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { Button, Container, Header, Progress, Segment } from 'semantic-ui-react';

import auctionStore from '../stores/auction.store';
import buyStore, { BLOCKS_CONFIRMATIONS } from '../stores/buy.store';

@observer
export default class CurrentTx extends Component {
  render () {
    const { currentTx } = buyStore;

    return (
      <Container textAlign='center'>
        <Header as='h3' textAlign='center'>
          {this.renderTitle()}
        </Header>

        <Segment basic style={{ color: 'black' }}>
          {this.renderContent()}
        </Segment>

        {
          currentTx.completed
          ? (
            <Button
              onClick={this.handleClose}
              primary
            >
              Close
            </Button>
          )
          : null
        }
        <Button
          as='a'
          href={`http://kovan.etherscan.io/tx/${currentTx.hash}`}
          target='_blank'
          secondary
        >
          View on Etherscan
        </Button>
      </Container>
    );
  }

  renderTitle () {
    const { currentTx } = buyStore;
    const { blockNumber, blockHeight, completed } = currentTx;

    if (completed) {
      return 'Your transaction is now completed';
    }

    if (!blockNumber || !blockHeight) {
      return 'Your transaction is being sent to the network';
    }

    return 'Your transaction is being validated';
  }

  renderContent () {
    const { currentTx } = buyStore;
    const { blockNumber, blockHeight, completed } = currentTx;

    if (completed) {
      return (
        <p>
          Your transaction has sucessfully been included in the blockchain!
        </p>
      );
    }

    if (!blockNumber || !blockHeight) {
      return (
        <p>
          Your transaction will soon be included in a block. Then, you
          will have to wait for {BLOCKS_CONFIRMATIONS} confirmations
          to validate to transactions...
        </p>
      );
    }

    const percent = Math.round(blockHeight / BLOCKS_CONFIRMATIONS * 100);

    return (
      <div>
        <p>
          Your transaction has been included in a block. Now we just
          need to wait...
        </p>
        <Progress percent={percent} active color='green'>
          {blockHeight} confirmation(s), {BLOCKS_CONFIRMATIONS - blockHeight} more needed
        </Progress>
      </div>
    );
  }

  handleClose = () => {
    buyStore.setCurrentTx(null);
  };
}
