import $ from 'jquery';
import React from 'react';

const commonjs = require('ek-utils/common');

class Timer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            date: undefined,
            time: undefined
        };
    }

    tick() {
        var dateInfo = commonjs.timeStamp(undefined, this.props.format).split(' ');
        this.setState(state => ({
            date: dateInfo[0],
            time: dateInfo[1]
        }));
    }

    componentDidMount() {
        this.interval = setInterval(() => this.tick(), 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        return (
            <div className="date-time">
                 <div className="count-second">{this.state.time}</div>
                 <div>{this.state.date}</div>
            </div>
        );
    }
}

export {
    Timer
};