import $ from 'jquery';
import React from 'react';
import ReactDom from 'react-dom';

class HelloMsg extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            seconds: 0
        };
    }

    tick() {
        this.setState(state => ({
            seconds: state.seconds + 1
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
            <div>
                <img src={require('../../images/home/logo.jpg')}/>
                Seconds: {this.state.seconds}
            </div>
        );
    }
}

export {
    HelloMsg
};