import React, { Component } from 'react';
import { Button, Container, Grid, Header } from 'semantic-ui-react';

import Chart from './Chart';

export default class Info extends Component {
  render () {
    return (
      <Container>
        <Header as='h2'>About the Auction</Header>
        <Grid columns={2}>
          <Grid.Column>
            <p>
              In this Auction, 5 million of the total available 10 million tokens
              will be offered for sale.
            </p>

            <p>
              The initial offer price does not represent the final purchase of the
              tokens but is set at a higher value to allow for broader participation.
              Once the auction begins, the price of any unsold tokens will progressively
              drop and new contributors can make an offer at a lower price for tokens
              that have not yet been sold. When a contributor makes an offer they don't
              know the exact amount of tokens they would receive but they will receive
              a confirmation of the minimum amount.
            </p>

            <p>
              The number of tokens related to the previous contributions made before
              the drop in price will be recalculated and the number of tokens allocated
              to them will be increased to match the new lower price. The auction will
              stop when the recalculation of the price of the tokens already paid for
              matches the total amount of tokens for sale.
            </p>
            <br />
            <Button
              size='large'
            >
              Read more about the auction
            </Button>
          </Grid.Column>
          <Grid.Column>
            <Chart />
          </Grid.Column>
        </Grid>
      </Container>
    );
  }
}
