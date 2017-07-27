import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { CartesianGrid, Label, LineChart, Line, ReferenceDot, ReferenceLine, ResponsiveContainer, Text, XAxis, YAxis } from 'recharts';

import auctionStore from '../../stores/auction.store';
import { fromWei } from '../../utils';

const style = {
  flex: 2,
  overflow: 'hidden',
  position: 'relative'
};

class CustomizedAxisTick extends Component {
  render () {
    const { value } = this.props.payload;
    const date = new Date(value);

    return (
      <Text {...this.props} angle={0}>
        {date.toLocaleDateString()}
      </Text>
    );
  }
}

class CustomChart extends Component {
  state = {
    mouse: null,
    zoom: 0
  };

  componentDidMount () {
    window.addEventListener('wheel', this.handleScroll);
  }

  componentWillUnmount () {
    window.removeEventListener('wheel', this.handleScroll);
  }

  render () {
    if (!this.props.data) {
      return null;
    }

    const data = this.getZoomedData(this.props.data, this.state.zoom);

    return (
      <div style={style}>
        {this.renderDotLabel()}
        <ResponsiveContainer height={400} width='100%'>
          <LineChart
            data={data}
            margin={{ bottom: 20 }}
            onMouseMove={this.handleMouseMove}
            onMouseEnter={this.handleMouseEnter}
            onMouseLeave={this.handleMouseLeave}
          >
            {this.renderTodayLines()}

            <Line
              dot={false}
              type='linear'
              dataKey='price'
              stroke='#8884d8'
              strokeWidth={2}
            />
            <CartesianGrid stroke='#ccc' />
            <XAxis
              dataKey='time'
              label='Time'
              scale='time'
              type='number'
              domain={['dataMin', 'dataMax']}
              padding={{ left: 20, right: 20 }}
              interval='preserveStartEnd'
              tick={<CustomizedAxisTick />}
              ticks={[
                data[0].time,
                data[data.length - 1].time
              ]}
              tickLine={false}
            />
            <YAxis
              padding={{ top: 20, bottom: 20 }}
            >
              <Label angle={-90}>
                Token Price
              </Label>
            </YAxis>

            {this.renderDot()}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  renderTodayLines () {
    const todayTime = Date.now();
    const todayPrice = auctionStore.getPrice(todayTime / 1000);

    const price = fromWei(todayPrice).mul(auctionStore.divisor).toNumber();

    return [
      <ReferenceLine
        x={todayTime}
        stroke='green'
        strokeDasharray='3 3'
      />,
      <ReferenceLine
        y={price}
        stroke='green'
        strokeDasharray='3 3'
      />
    ];
  }

  renderDot () {
    const { mouse } = this.state;

    if (!mouse) {
      return null;
    }

    return (
      <ReferenceDot
        x={mouse.date * 1000}
        y={mouse.price}
        r={6}
        stroke='#8884d8'
        strokeWidth={2}
        fill='white'
      />
    );
  }

  renderDotLabel () {
    const { mouse } = this.state;

    if (!mouse) {
      return null;
    }

    const date = new Date(mouse.date * 1000);

    return (
      <div
        style={{
          background: 'white',
          padding: '0.25em 0.5em',
          position: 'absolute',
          right: '0.5em',
          top: '0.5em',
          border: '2px solid #8884d8',
          zIndex: 50
        }}
      >
        {Math.round(mouse.price * 1000) / 1000} <small>ETH/DOT</small>
        <span>, </span>
        <span>{date.toLocaleDateString()}</span>
        <span> @ </span>
        <small>{date.toLocaleTimeString()}</small>
      </div>
    );
  }

  getZoomedData (data, zoom) {
    if (!this.currentTime) {
      return data;
    }

    const time = this.currentTime / 1000;
    const { begin, end } = auctionStore;

    const maxInterval = Math.max(time - begin, end - time);
    const minInterval = 0.25 * maxInterval;
    const interval = minInterval + (maxInterval - minInterval) * ((100 - zoom) / 100);

    const max = 1000 * (time + interval);
    const min = 1000 * (time - interval);

    return data.filter((datum) => {
      return (datum.time < max) && (datum.time > min);
    });
  }

  handleMouseEnter = () => {
  };

  handleMouseMove = (event) => {
    if (!event) {
      return null;
    }

    this.currentTime = event.activeLabel;

    const { beginPrice, endPrice, divisor } = auctionStore;
    // const y = event.chartY;

    // const height = 400 - (3 * 20 + 25);
    // const rawPrice = endPrice.sub(beginPrice).mul(y - 20).div(height).add(beginPrice);
    // const price = fromWei(rawPrice.mul(divisor)).toNumber();
    // const date = auctionStore.getTime(rawPrice);

    const date = event.activeLabel / 1000;
    const price = fromWei(auctionStore.getPrice(date)).mul(divisor).toNumber();

    this.setState({ mouse: { date, price } });
  };

  handleMouseLeave = () => {
    this.setState({ mouse: null });
  };

  handleScroll = (event) => {
    if (!this.state.mouse) {
      return;
    }

    const { deltaY } = event;

    const prevZoom = this.state.zoom;
    const nextZoom = Math.min(100, Math.max(0, prevZoom - deltaY / 25));

    console.log('zoom', prevZoom, nextZoom);

    event.preventDefault();
    event.stopPropagation();

    this.setState({ zoom: nextZoom });
  };
}

@observer
export default class Info extends Component {
  render () {
    const { chart } = auctionStore;

    if (!chart.data) {
      return null;
    }

    return (
      <CustomChart
        data={chart.data.slice()}
      />
    );
  }
}
