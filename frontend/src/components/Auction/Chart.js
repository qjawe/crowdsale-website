import { scalePow } from 'd3-scale';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { CartesianGrid, Label, LineChart, Line, ReferenceDot, ReferenceLine, ResponsiveContainer, Text, Tooltip, XAxis, YAxis } from 'recharts';

import auctionStore from '../../stores/auction.store';
import { fromWei } from '../../utils';

const style = {
  flex: 2,
  overflow: 'hidden',
  position: 'relative'
};

const yScale = scalePow().exponent(0.15);

class DateTick extends Component {
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

class TotalAccountedTick extends Component {
  render () {
    const { cap, divisor } = auctionStore;
    const { value } = this.props.payload;
    const eth = cap.mul(value).div(divisor);

    return (
      <Text {...this.props} angle={0}>
        {eth.toFormat()}
      </Text>
    );
  }
}

class CustomChart extends Component {
  state = {
    mouse: null,
    xDomain: this.getZoomedInterval(0),
    zoom: 0
  };

  componentDidMount () {
    window.addEventListener('wheel', this.handleScroll);
  }

  componentWillUnmount () {
    window.removeEventListener('wheel', this.handleScroll);
  }

  render () {
    const { data } = this.props;
    const { xDomain } = this.state;

    if (!data) {
      return null;
    }

    const yDomain = [
      0,
      Math.round(data[data.length - 1].price)
    ];

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

            <CartesianGrid stroke='#ccc' />

            <XAxis
              allowDataOverflow
              dataKey='time'
              domain={xDomain}
              label='Time'
              scale='time'
              type='number'
              padding={{ left: 20, right: 20 }}
              interval='preserveStartEnd'
              tick={<DateTick />}
              ticks={xDomain}
              tickLine={false}
            />
            <YAxis
              domain={yDomain}
              yAxisId='left'
              padding={{ top: 20, bottom: 20 }}
              scale={yScale}
            >
              <Label angle={-90}>
                Token Price
              </Label>
            </YAxis>
            <YAxis
              domain={yDomain}
              yAxisId='right'
              padding={{ top: 20, bottom: 20 }}
              orientation='right'
              tick={<TotalAccountedTick />}
              ticks={[
                data[0].expectedTotalAccounted,
                data[data.length - 1].totalAccounted
              ]}
              scale={yScale}
            >
              <Label angle={90}>
                Total Accounted
              </Label>
            </YAxis>

            <Line
              yAxisId='left'
              dot={false}
              type='linear'
              dataKey='price'
              stroke='#8884d8'
              strokeWidth={2}
            />
            <Line
              yAxisId='right'
              dot={false}
              type='linear'
              dataKey='totalAccounted'
              stroke='#F70D1C'
              strokeWidth={2}
            />
            <Line
              yAxisId='right'
              dot={false}
              type='linear'
              dataKey='expectedTotalAccounted'
              stroke='gray'
              strokeDasharray='3 3'
              strokeWidth={2}
              connectNulls
            />

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
        yAxisId='left'
      />,
      <ReferenceLine
        y={price}
        stroke='green'
        strokeDasharray='3 3'
        yAxisId='left'
      />
    ];
  }

  renderDot () {
    const { mouse } = this.state;

    if (!mouse) {
      return null;
    }

    const time = mouse.date;
    const datum = this.props.data.find((datum) => datum.time === time);

    if (!datum) {
      return null;
    }

    const { price, totalAccounted } = datum;
    const priceDot = (
      <ReferenceDot
        x={time}
        y={price}
        r={6}
        stroke='#8884d8'
        strokeWidth={2}
        fill='white'
        yAxisId='left'
      />
    );

    if (totalAccounted === undefined) {
      return priceDot;
    }

    return [
      priceDot,
      <ReferenceDot
        x={time}
        y={totalAccounted}
        r={6}
        stroke='#F70D1C'
        strokeWidth={2}
        fill='white'
        yAxisId='left'
      />
    ];
  }

  renderDotLabel () {
    const { mouse } = this.state;

    if (!mouse) {
      return null;
    }

    const time = mouse.date;
    const datum = this.props.data.find((datum) => datum.time === time);

    if (!datum) {
      return null;
    }

    const date = new Date(time);
    const { price, totalAccounted } = datum;
    const { cap, divisor } = auctionStore;

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'absolute',
          right: '0.5em',
          top: '0.5em',
          zIndex: 50
        }}
      >
        <div
          style={{
            background: 'white',
            padding: '0.25em 0.5em',
            border: '2px solid #8884d8'
          }}
        >
          {Math.round(price * 100000) / 100000} <small>ETH/DOT</small>
          <span>, </span>
          <span>{date.toLocaleDateString()}</span>
          <span> @ </span>
          <small>{date.toLocaleTimeString()}</small>
        </div>
        {
          totalAccounted
          ? (
            <div
              style={{
                background: 'white',
                padding: '0.25em 0.5em',
                border: '2px solid #F70D1C',
                marginTop: '0.5em'
              }}
            >
              <span>
                { cap.mul(totalAccounted || 0).div(divisor).toFormat() } ETH accounted
              </span>
            </div>
          )
          : null
        }
      </div>
    );
  }

  getZoomedInterval (zoom, state = this.state || {}) {
    const { mouse, xDomain } = state;
    const { begin, end } = auctionStore;

    if (!mouse || !xDomain || zoom === 0) {
      return [ begin * 1000, end * 1000 ];
    }

    const time = mouse.date / 1000;

    const maxWindowSize = end - begin;
    const minWindowSize = maxWindowSize * 0.01;

    const prevWindowSize = (xDomain[1] - xDomain[0]) / 1000;
    const nextWindowSize = maxWindowSize - (maxWindowSize - minWindowSize) * (zoom / 100);

    const lowerRatio = (time - xDomain[0] / 1000) / prevWindowSize;

    const nextLowerBound = time - nextWindowSize * lowerRatio;
    const nextUpperBound = nextLowerBound + nextWindowSize;

    const min = Math.max(begin * 1000, 1000 * (nextLowerBound));
    const max = Math.min(end * 1000, 1000 * (nextUpperBound));

    return [ min, max ];
  }

  handleMouseEnter = () => {
  };

  handleMouseMove = (event) => {
    if (!event) {
      return null;
    }

    const date = event.activeLabel;

    this.setState({ mouse: { date } });
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
    const nextZoom = Math.round(Math.min(100, Math.max(0, prevZoom - deltaY / 25)));

    event.preventDefault();
    event.stopPropagation();

    const xDomain = this.getZoomedInterval(nextZoom);

    this.setState({ xDomain, zoom: nextZoom });
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
