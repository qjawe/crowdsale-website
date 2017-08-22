import { range } from 'lodash';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { Button, Container, Header, Segment } from 'semantic-ui-react';

import buyStore from '../stores/buy.store';
import { fromWei } from '../utils';

class AnimatedDots extends Component {
  state = {
    counter: 0
  };

  dots = range(4).map((_, index) => range(index).map(() => '.').join(''));

  componentWillMount () {
    this.intervalId = setInterval(() => {
      this.setState({ counter: (this.state.counter + 1) % 4 });
    }, 1000);
  }

  componentWillUnmount () {
    clearInterval(this.intervalId);
  }

  render () {
    const { counter } = this.state;

    return (
      <span>
        {this.dots[counter]}
      </span>
    );
  }
}

@observer
export default class PendingTx extends Component {
  state = {
    deleting: null
  };

  render () {
    const { pendingTx } = buyStore;

    return (
      <Container textAlign='center'>
        <Header as='h3' textAlign='center'>
          You have a pending transaction<AnimatedDots />
        </Header>

        <Segment basic style={{ color: 'black' }}>
          <p>Your balance is too low to execute this transaction.</p>
          <p>
            You need at least <b>{fromWei(pendingTx.required).toFormat()}</b> ETH.
            Please top-up your account accordingly.
          </p>
        </Segment>

        {this.renderDeleteButton()}
      </Container>
    );
  }

  renderDeleteButton () {
    const { deleting } = this.state;

    if (deleting === true) {
      return (
        <Button
          color='red'
          disabled
        >
          Deleting...
        </Button>
      );
    }

    if (deleting) {
      return (
        <Button
          onClick={this.handleCancel}
          color='red'
        >
          Deleting in {deleting}... Click to cancel!
        </Button>
      );
    }

    return (
      <Button
        icon='trash'
        onClick={this.handleDelete}
        color='red'
        content='Delete'
      />
    );
  }

  confirmDelete = async () => {
    this.setState({ deleting: true });

    try {
      await buyStore.deletePendingTx();
    } finally {
      this.setState({ deleting: null });
    }
  };

  handleCancel = () => {
    clearTimeout(this.deleteTimeoutId);
    this.setState({ deleting: null });
  };

  handleDelete = () => {
    const deleting = 5;

    this.setState({ deleting }, () => {
      this.deleteTimer();
    });
  };

  deleteTimer = () => {
    clearTimeout(this.deleteTimeoutId);
    this.deleteTimeoutId = setTimeout(() => {
      const deleting = this.state.deleting - 1;

      if (deleting === 0) {
        return this.confirmDelete();
      }

      this.setState({ deleting }, () => {
        this.deleteTimer();
      });
    }, 1000);
  }
}
