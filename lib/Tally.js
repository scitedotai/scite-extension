import { h, Component } from 'preact';
const _window = window,
      fetch = _window.fetch;

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
    const doi = this.props.doi;
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
    const doi = this.props.doi;
    window.open(`https://scite.ai/reports/${doi}`);
  }

  render() {
    const tally = this.state.tally;
    const showClass = tally ? '-show' : '';
    const supporting = tally && tally.supporting || 0;
    const contradicting = tally && tally.contradicting || 0;
    const mentioning = tally && tally.mentioning || 0;
    return h("div", {
      className: `scite-tally ${showClass}`,
      onClick: this.openReport
    }, h("span", {
      className: "title"
    }, "scite_"), h(Row, {
      type: "supporting",
      count: supporting
    }), h(Row, {
      type: "contradicting",
      count: contradicting
    }), h(Row, {
      type: "mentioning",
      count: mentioning
    }));
  }

}

export default Tally;