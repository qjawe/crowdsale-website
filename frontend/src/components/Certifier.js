import PropTypes from 'proptypes';
import React, { Component } from 'react';
import { Button, Header, Icon, Modal } from 'semantic-ui-react';

export default class Buy extends Component {
  static propTypes = {
    disabled: PropTypes.bool
  };

  state = {
    open: false
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
    const { open } = this.state;

    if (!open) {
      return null;
    }

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
          <div
            className='g-recaptcha'
            data-sitekey='6LeJMisUAAAAAGYZUeDSlR_DEuoQ9ClF9XACEJDt'
          />
        </Modal.Content>
        <Modal.Actions>
          <Button
            onClick={this.handleVerifyKraken}
            inverted
          >
            Verify with Kraken
          </Button>
          <Button
            onClick={this.handleVerifyParity}
            inverted
          >
            Verify with Parity
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
}
