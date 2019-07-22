import { h, Component } from 'preact';
const {
  fetch
} = window;

const rowClasses = type => `scite-icon scite-icon-${type}`;

const Row = ({
  type,
  count
}) => h("div", {
  className: "scite-tally-row"
}, h("i", {
  className: rowClasses(type)
}), h("span", {
  className: "count"
}, count));

class Tally extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.openReport = this.openReport.bind(this);
  }

  componentDidMount() {
    this.fetchReport();
  }

  fetchReport(retry = 0, maxRetries = 8) {
    const {
      doi
    } = this.props;
    const fetchFailed = new Error('Failed to get Tally');
    fetch(`https://api.scite.ai/tallies/${doi}`).then(response => {
      if (!response.ok) {
        throw fetchFailed;
      }

      return response.json();
    }).then(tally => {
      if (typeof tally.total === 'number') {
        this.setState({
          tally
        });
      }
    }).catch(e => {
      if (e === fetchFailed && retry < maxRetries) {
        return setTimeout(() => this.fetchReport(++retry, maxRetries), 1200);
      }

      console.error(e);
    });
  }

  openReport() {
    const {
      doi
    } = this.props;
    window.open(`https://scite.ai/reports/${doi}`);
  }

  render() {
    const {
      tally
    } = this.state;

    if (!tally) {
      return null;
    }

    return h("div", {
      className: "scite-tally",
      onClick: this.openReport
    }, h("span", {
      className: "title"
    }, "scite_"), h(Row, {
      type: "supporting",
      count: tally.supporting
    }), h(Row, {
      type: "contradicting",
      count: tally.contradicting
    }), h(Row, {
      type: "mentioning",
      count: tally.mentioning
    }));
  }

}

export default Tally;