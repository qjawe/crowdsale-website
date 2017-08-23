import FileSaver from 'file-saver';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Button, Form, Grid, Header, Input, Segment, TextArea } from 'semantic-ui-react';
import { phraseToWallet } from '@parity/ethkey.js';
import { randomPhrase } from '@parity/wordlist';

import AccountInfo from './AccountInfo';

import accountStore from '../stores/account.store';
import appStore from '../stores/app.store';

const PHRASE_ACK_CONTENT = 'I confirm I have written down my recovery phrase';

const STEPS = {
  PASSWORD: Symbol('password'),
  WRITE_RECOVERY: Symbol('write-recovery'),
  REPEAT_RECOVERY: Symbol('repeat-recovery'),
  DOWNLOAD: Symbol('download')
};

const stepStyle = {
  borderRadius: '50%',
  backgroundColor: 'black',
  color: 'white',
  width: '1.5em',
  height: '1.5em',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '0.75em'
};

const Step = (props) => {
  const { num, title, description, children } = props;

  return (
    <Grid columns={2} relaxed>
      <Grid.Column>
        <Header>
          <span style={stepStyle}>{num}</span>
          {title}
        </Header>
        {description}
      </Grid.Column>
      <Grid.Column>
        {children}
      </Grid.Column>
    </Grid>
  );
};

Step.propTypes = {
  num: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired
};

@observer
export default class WalletCreator extends Component {
  state = {
    address: null,
    downloaded: false,
    password: '',
    passwordRepeat: '',
    phrase: null,
    phraseAck: '',
    phraseRepeat: '',
    step: STEPS.PASSWORD
  };

  render () {
    const { step } = this.state;

    if (step === STEPS.PASSWORD) {
      return this.renderPassword();
    }

    if (step === STEPS.WRITE_RECOVERY) {
      return this.renderWriteRecovery();
    }

    if (step === STEPS.REPEAT_RECOVERY) {
      return this.renderRepeatRecovery();
    }

    if (step === STEPS.DOWNLOAD) {
      return this.renderDownload();
    }

    return null;
  }

  renderPassword () {
    const { loading, password, passwordRepeat } = this.state;

    const error = !password || password !== passwordRepeat;

    return (
      <Step
        num={1}
        title='Choose your password'
        description={(
          <div>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque urna erat, lacinia vitae
              mollis finibus, consequat in tortor. Sed nec elementum tortor. Sed ultrices magna urna, sed
              placerat ligula sodales et. Aliquam ac enim non mi luctus fringilla sed eu purus.
            </p>

            <p>
              Donec hendrerit auctor ligula nec aliquam. Fusce vulputate dictum justo, sed commodo nulla
              luctus eget. Donec ullamcorper magna arcu, quis auctor mauris tristique ac. Aliquam vehicula
              erat eget pharetra gravida. Donec aliquet sollicitudin orci accumsan iaculis
            </p>
          </div>
        )}
      >
        <Form
          error={error}
          loading={loading}
          onSubmit={this.handlePasswordSet}
        >
          <Form.Field
            control={Input}
            id='form-input-control-password'
            label='Choose your password'
            onChange={this.handlePasswordChange}
            type='password'
            value={password}
          />
          <Form.Field
            control={Input}
            error={error}
            id='form-input-control-repeat-password'
            label='Repeat your desired password'
            onChange={this.handlePasswordRepeatChange}
            type='password'
            value={passwordRepeat}
          />
          <Button
            disabled={error}
            type='submit'
          >
            Step 2
          </Button>
        </Form>
      </Step>
    );
  }

  renderWriteRecovery () {
    const { phrase, phraseAck } = this.state;

    const error = phraseAck !== PHRASE_ACK_CONTENT;

    return (
      <Step
        num={2}
        title='Write down your recovery phrase'
        description={(
          <div>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque urna erat, lacinia vitae
              mollis finibus, consequat in tortor. Sed nec elementum tortor. Sed ultrices magna urna, sed
              placerat ligula sodales et. Aliquam ac enim non mi luctus fringilla sed eu purus.
            </p>

            <p>
              Donec hendrerit auctor ligula nec aliquam. Fusce vulputate dictum justo, sed commodo nulla
              luctus eget. Donec ullamcorper magna arcu, quis auctor mauris tristique ac. Aliquam vehicula
              erat eget pharetra gravida. Donec aliquet sollicitudin orci accumsan iaculis
            </p>
          </div>
        )}
      >
        <Form
          error={error}
          onSubmit={this.handlePhraseAck}
        >
          <Header as='h4'>
            Your recovery phrase
          </Header>
          <Segment>
            {phrase}
          </Segment>

          <Grid style={{ margin: 0 }}>
            <Grid.Column width={7}>
              <Input
                fluid
                onChange={this.handlePhraseAckChange}
                value={phraseAck}
              />
            </Grid.Column>
            <Grid.Column width={9}>
              Please type “<b>I confirm I have written down my
              recovery phrase</b>” into the box to the left.
            </Grid.Column>
          </Grid>

          <Button
            disabled={error}
            type='submit'
          >
            Step 3
          </Button>
        </Form>
      </Step>
    );
  }

  renderRepeatRecovery () {
    const { phrase, phraseRepeat } = this.state;

    const error = phraseRepeat !== phrase;

    return (
      <Step
        num={3}
        title='Repeat your recovery phrase'
        description={(
          <div>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque urna erat, lacinia vitae
              mollis finibus, consequat in tortor. Sed nec elementum tortor. Sed ultrices magna urna, sed
              placerat ligula sodales et. Aliquam ac enim non mi luctus fringilla sed eu purus.
            </p>

            <p>
              Donec hendrerit auctor ligula nec aliquam. Fusce vulputate dictum justo, sed commodo nulla
              luctus eget. Donec ullamcorper magna arcu, quis auctor mauris tristique ac. Aliquam vehicula
              erat eget pharetra gravida. Donec aliquet sollicitudin orci accumsan iaculis
            </p>
          </div>
        )}
      >
        <Form
          error={error}
          onSubmit={this.handlePhraseRepeat}
        >
          <Header as='h4'>
            Your recovery phrase
          </Header>
          <TextArea
            onChange={this.handlePhraseRepeatChange}
            style={{ marginBottom: '1em' }}
            value={phraseRepeat}
          />
          <Button
            disabled={error}
            type='submit'
          >
            Step 4
          </Button>
        </Form>
      </Step>
    );
  }

  renderDownload () {
    const { address, downloaded } = this.state;

    return (
      <Step
        num={4}
        title='Download your wallet and send ether to your new address'
        description={(
          <div>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque urna erat, lacinia vitae
              mollis finibus, consequat in tortor. Sed nec elementum tortor. Sed ultrices magna urna, sed
              placerat ligula sodales et. Aliquam ac enim non mi luctus fringilla sed eu purus.
            </p>

            <p>
              Donec hendrerit auctor ligula nec aliquam. Fusce vulputate dictum justo, sed commodo nulla
              luctus eget. Donec ullamcorper magna arcu, quis auctor mauris tristique ac. Aliquam vehicula
              erat eget pharetra gravida. Donec aliquet sollicitudin orci accumsan iaculis
            </p>
          </div>
        )}
      >
        <div>
          <Header as='h4'>
            Your ethereum address
          </Header>

          <Segment basic>
            <AccountInfo
              address={address}
            />
          </Segment>

          <Button
            onClick={this.handleDownloadWallet}
            primary
          >
            Download your wallet
          </Button>

          <Button
            disabled={!downloaded}
            onClick={this.handleParticipate}
          >
            Participate in the auction
          </Button>
        </div>
      </Step>
    );
  }

  async createWallet () {
    const { password } = this.state;

    this.setState({ loading: true });

    try {
      const phrase = randomPhrase(12);
      const { address, secret } = await phraseToWallet(phrase);
      const wallet = await accountStore.create(secret, password);

      this.setState({
        address,
        phrase,
        wallet,
        loading: false,
        step: STEPS.WRITE_RECOVERY
      });
    } catch (error) {
      console.error(error);
      this.setState({ loading: false });
    }
  }

  handlePasswordChange = (_, data) => {
    const { value } = data;

    this.setState({ password: value });
  };

  handlePasswordRepeatChange = (_, data) => {
    const { value } = data;

    this.setState({ passwordRepeat: value });
  };

  handlePhraseAckChange = (_, data) => {
    const { value } = data;

    this.setState({ phraseAck: value });
  };

  handlePhraseRepeatChange = (_, data) => {
    const { value } = data;

    this.setState({ phraseRepeat: value });
  };

  handlePasswordSet = (event) => {
    event.stopPropagation();
    event.preventDefault();

    if (this.state.passwordRepeat !== this.state.password || !this.state.password) {
      return null;
    }

    this.createWallet();
  };

  handlePhraseAck = (event) => {
    event.stopPropagation();
    event.preventDefault();

    if (this.state.phraseAck !== PHRASE_ACK_CONTENT) {
      return null;
    }

    this.setState({ step: STEPS.REPEAT_RECOVERY });
  };

  handlePhraseRepeat = (event) => {
    event.stopPropagation();
    event.preventDefault();

    if (this.state.phraseRepeat !== this.state.phrase) {
      return null;
    }

    this.setState({ step: STEPS.DOWNLOAD });
  };

  handleDownloadWallet = () => {
    const { wallet } = this.state;
    const blob = new Blob([JSON.stringify(wallet)], { type: 'text/json;charset=utf-8' });

    FileSaver.saveAs(blob, `${wallet.id}.json`);

    this.setState({ downloaded: true });
  };

  handleParticipate = () => {
    appStore.goto('load-wallet');
  };
}
