import BigNumber from 'bignumber.js';
import { scalePow } from 'd3-scale';
import { observer } from 'mobx-react';
import PropTypes from 'proptypes';
import React, { Component } from 'react';
import moment from 'moment';
import Moment from 'react-moment';
import {
  Area,
  ComposedChart,
  Label,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis
} from 'recharts';

import auctionStore from '../../stores/auction.store';

const style = {
  flex: 2,
  position: 'relative'
};

const yScale = scalePow().exponent(0.2);

class CustomChart extends Component {
  static propTypes = {
    data: PropTypes.array
  };

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
    const { beginTime, endTime } = auctionStore;

    if (!data) {
      return null;
    }

    const yDomain = [
      0,
      Math.round(data[data.length - 1].price)
    ];

    const xTicks = [
      Math.max(beginTime.getTime(), xDomain[0]),
      Math.min(endTime.getTime(), xDomain[1])
    ];

    return (
      <div style={style}>
        {this.renderDotLabel()}
        <ResponsiveContainer height={400} width='100%'>
          <ComposedChart
            data={data}
            margin={{ bottom: 20 }}
            onMouseMove={this.handleMouseMove}
            onMouseEnter={this.handleMouseEnter}
            onMouseLeave={this.handleMouseLeave}
          >
            <XAxis
              allowDataOverflow
              dataKey='time'
              domain={xDomain}
              scale='time'
              type='number'
              interval='preserveStartEnd'
              tickFormatter={(date) => moment(new Date(date)).format('MMM D')}
              ticks={xTicks}
              tickLine={false}
              strokeWidth={0}
            />
            <YAxis
              domain={yDomain}
              yAxisId='left'
              scale={yScale}
              ticks={[
                data.reduce((min, datum) => Math.min(datum.price, min), data[0].price),
                data.reduce((max, datum) => Math.max(datum.price, max), data[0].price)
              ]}
              strokeWidth={0}
              padding={{ top: 10, bottom: 10 }}
              tickFormatter={(value) => {
                const price = new BigNumber(value);

                if (price.gt(1)) {
                  return price.toFormat(2) + ' ';
                }

                return price.div(1000).toFormat(2) + '';
              }}
            >
              <Label angle={-90}>
                Token Price
              </Label>
            </YAxis>
            <YAxis
              domain={yDomain}
              yAxisId='right'
              orientation='right'
              tickFormatter={(value) => {
                const { divisor, tokenCap } = auctionStore;
                const eth = tokenCap.mul(value).div(divisor);

                return eth.toFormat();
              }}
              ticks={[
                data[0].expectedTotalAccounted
                // data[data.length - 1].totalAccounted
              ]}
              scale={yScale}
              strokeWidth={0}
              padding={{ top: 10, bottom: 10 }}
            >
              <Label angle={90}>
                Total Accounted
              </Label>
            </YAxis>

            <Area
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
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
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

    return [
      totalAccounted === undefined
        ? null
        : (
          <ReferenceDot
            fill='white'
            key='refDotTA'
            r={6}
            stroke='#F70D1C'
            strokeWidth={2}
            x={time}
            y={totalAccounted}
            yAxisId='left'
          />
        ),

      <ReferenceLine
        key='refMouseLine'
        stroke='#8884d8'
        strokeWidth={1}
        x={time}
      />,

      <ReferenceDot
        key='refDotPrice'
        fill='white'
        stroke='#8884d8'
        strokeWidth={2}
        r={6}
        x={time}
        y={price}
        yAxisId='left'
      />
    ];
  }

  renderDotLabel () {
    const { mouse } = this.state;

    const labelContainerStyle = {
      fontSize: '0.85rem',
      position: 'absolute',
      textAlign: 'center',
      transform: 'translateX(-50%) translateY(-50%)',
      whiteSpace: 'nowrap',
      zIndex: 50
    };

    const labelStyle = {
      background: 'white',
      border: '1px solid lightgray',
      borderRadius: '5px',
      display: 'inline',
      padding: '2px 6px'
    };

    if (!mouse) {
      return null;
    }

    const { left } = mouse;
    const time = mouse.date;
    const datum = this.props.data.find((datum) => datum.time === time);

    if (!datum) {
      return null;
    }

    const date = new Date(time);
    const { price, totalAccounted } = datum;
    const { divisor, tokenCap } = auctionStore;

    return (
      <div style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      }}>
        <div
          style={{
            ...labelContainerStyle,
            top: 0,
            left
          }}
        >
          <div
            style={{
              ...labelStyle,
              borderColor: '#8884d8'
            }}
          >
            {Math.round(price * 100000) / 100000}
            <small><b> ETH/DOT</b></small>
          </div>
          {
            totalAccounted
            ? (
              <div
                style={{
                  ...labelStyle,
                  borderColor: '#F70D1C',
                  marginTop: '0.25em'
                }}
              >
                <span>
                  { tokenCap.mul(totalAccounted || 0).div(divisor).toFormat() }
                  <small><b> ETH</b></small>
                </span>
              </div>
            )
            : null
          }
        </div>

        <div
          style={{
            ...labelContainerStyle,
            top: 340,
            left
          }}
        >
          <div
            style={{
              ...labelStyle
            }}
          >
            <Moment format='L LT'>{date}</Moment>
          </div>
        </div>
      </div>
    );
  }

  getZoomedInterval (zoom, state = this.state || {}) {
    const { mouse, xDomain } = state;
    const { beginTime, endTime } = auctionStore;

    const padding = (endTime - beginTime) * 0.05;
    const begin = beginTime.getTime() - padding;
    const end = endTime.getTime() + padding;

    if (!mouse || !xDomain || zoom === 0) {
      return [ begin, end ];
    }

    const time = mouse.date;

    const maxWindowSize = end - begin;
    const minWindowSize = maxWindowSize * 0.01;

    const prevWindowSize = (xDomain[1] - xDomain[0]);
    const nextWindowSize = maxWindowSize - (maxWindowSize - minWindowSize) * (zoom / 100);

    const lowerRatio = (time - xDomain[0]) / prevWindowSize;

    const nextLowerBound = time - nextWindowSize * lowerRatio;
    const nextUpperBound = nextLowerBound + nextWindowSize;

    const min = Math.max(begin, nextLowerBound);
    const max = Math.min(end, nextUpperBound);

    return [ min, max ];
  }

  handleMouseEnter = () => {
  };

  handleMouseMove = (event) => {
    if (!event) {
      return null;
    }

    const left = event.chartX;
    const date = event.activeLabel;

    this.setState({ mouse: { date, left } });
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
export default class Chart extends Component {
  render () {
    const { chart } = auctionStore;

    if (!chart.data) {
      return null;
    }

    return (
      <CustomChart data={chart.data.slice()} />
    );
  }
}
