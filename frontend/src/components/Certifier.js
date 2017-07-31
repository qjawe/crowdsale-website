import PropTypes from 'proptypes';
import React, { Component } from 'react';
import Recaptcha from 'react-google-recaptcha';
import { Button, Header, Modal } from 'semantic-ui-react';

const STEPS = {
  HOME: Symbol(),
  VERIFY_WITH_KRAKEN: Symbol(),
  VERIFY_WITH_PARITY: Symbol()
};

export default class Buy extends Component {
  static propTypes = {
    disabled: PropTypes.bool
  };

  state = {
    open: false,
    step: STEPS.HOME,
    stoken: null
  };

  render () {
    const { disabled } = this.props;

    return (
      <div>
        {this.renderModal()}
        <Button
          content='Complete Compliance'
          disabled={disabled}
          onClick={this.handleCertify}
          primary
          size='big'
        />
      </div>
    );
  }

  renderModal () {
    const { open, step } = this.state;

    if (!open) {
      return null;
    }

    if (step === STEPS.HOME) {
      return this.renderHome();
    }

    if (step === STEPS.VERIFY_WITH_PARITY) {
      return this.renderVerifyParity();
    }

    if (step === STEPS.VERIFY_WITH_KRAKEN) {
      return this.renderVerifyKraken();
    }

    return null;
  }

  renderHome () {
    const { stoken } = this.state;

    return (
      <Modal
        basic
        closeIcon='close'
        open={open}
        onClose={this.handleClose}
      >
        <Header content='VERIFYING YOUR IDENTITY' />
        <Modal.Content>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam est urna, pulvinar quis lorem id, blandit luctus lectus. Vivamus mattis leo dui, at gravida enim lacinia eu. Nullam commodo, quam sagittis mollis aliquam, est magna tincidunt velit, in ultrices ligula purus ut tellus. In tempor lorem vel mattis semper. Vestibulum elementum hendrerit egestas. Phasellus eu viverra sapien. Integer eleifend blandit aliquet. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nunc eu tempus nisi. Nam convallis purus ac neque luctus, et semper augue suscipit. Proin nec finibus neque, varius fringilla arcu. Nunc ultrices felis tincidunt tortor vestibulum eleifend. Integer eros nisi, volutpat eu neque et, fringilla elementum massa. Integer a accumsan neque.
          </p>
          <p>
            Vestibulum erat turpis, accumsan quis porta at, consequat at arcu. Aliquam placerat et orci eget facilisis. Nam fermentum sodales sapien ut ultrices. Donec porta ante nec risus sollicitudin condimentum. Aliquam et tortor felis. Quisque vestibulum eu purus luctus scelerisque. Sed in mauris lorem. Vestibulum nibh mi, auctor sit amet condimentum vel, auctor id lectus. Aenean facilisis risus diam, quis bibendum diam aliquet in. Etiam sagittis non metus nec gravida. Cras mi massa, varius sit amet bibendum id, interdum eu elit. Nulla molestie felis tortor, sed interdum nunc porttitor sit amet. Vestibulum tincidunt porttitor eros, finibus aliquet orci tincidunt ac. Sed vel elit vel elit iaculis tempus. Morbi porttitor efficitur pellentesque.
          </p>
        </Modal.Content>
        <Modal.Content textAlign='center'>
          <div style={{
            display: 'flex',
            justifyContent: 'center'
          }}>
            <Recaptcha
              onChange={this.handleRecaptcha}
              sitekey='6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
              theme='dark'
            />
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button
            disabled={!stoken}
            onClick={this.handleVerifyKraken}
            inverted
          >
            Verify with Kraken
          </Button>
          <Button
            disabled={!stoken}
            onClick={this.handleVerifyParity}
            inverted
          >
            Verify with Parity
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }

  renderVerifyKraken () {
    return (
      <Modal
        basic
        closeIcon='close'
        open
        onClose={this.handleClose}
      >
        <Modal.Content>
          Verifying with Kraken
        </Modal.Content>
        <Modal.Actions>
          <Button
            onClick={this.handleClose}
            inverted
          >
            Done
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }

  renderVerifyParity () {
    return (
      <Modal
        basic
        closeIcon='close'
        open
        onClose={this.handleClose}
      >
        <Modal.Content>
          Verifying with Parity
        </Modal.Content>
        <Modal.Actions>
          <Button
            onClick={this.handleClose}
            inverted
          >
            Done
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }

  handleCertify = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleRecaptcha = (stoken) => {
    this.setState({ stoken });
  };

  handleVerifyKraken = () => {
    this.setState({ step: STEPS.VERIFY_WITH_KRAKEN });
  };

  handleVerifyParity = () => {
    this.setState({ step: STEPS.VERIFY_WITH_PARITY });
  };
}
