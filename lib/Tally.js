"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _preact = require("preact");

var _queryString = _interopRequireDefault(require("query-string"));

var _classnames = _interopRequireDefault(require("classnames"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var _window = window,
    fetch = _window.fetch;

var iconClasses = function iconClasses(type) {
  return "scite-icon scite-icon-".concat(type);
};

var Count = function Count(_ref) {
  var horizontal = _ref.horizontal,
      type = _ref.type,
      count = _ref.count;
  return (0, _preact.h)("div", {
    className: (0, _classnames.default)('scite-tally-count', {
      '-horizontal': horizontal
    })
  }, (0, _preact.h)("i", {
    className: iconClasses(type)
  }), (0, _preact.h)("span", {
    className: "number"
  }, count));
};

var Tally =
/*#__PURE__*/
function (_Component) {
  _inherits(Tally, _Component);

  function Tally(props) {
    var _this;

    _classCallCheck(this, Tally);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Tally).call(this, props));
    _this.state = {
      tally: null
    };
    _this.handleClick = _this.handleClick.bind(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(Tally, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.fetchReport();
    }
  }, {
    key: "fetchReport",
    value: function fetchReport() {
      var _this2 = this;

      var retry = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var maxRetries = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 8;
      var doi = this.props.doi;
      var fetchFailed = new Error('Failed to get Tally');
      fetch("https://api.scite.ai/tallies/".concat(doi)).then(function (response) {
        if (response.status === 404) {
          // Then we will set a 0 tally
          _this2.setState({
            tally: {
              doi: doi,
              total: 0
            }
          });
        }

        if (!response.ok) {
          throw fetchFailed;
        }

        return response.json();
      }).then(function (tally) {
        if (typeof tally.total === 'number') {
          _this2.setState({
            tally: tally
          });
        }
      }).catch(function (e) {
        if (e === fetchFailed && retry < maxRetries) {
          return setTimeout(function () {
            return _this2.fetchReport(++retry, maxRetries);
          }, 1200);
        }

        console.error(e);
      });
    }
  }, {
    key: "handleClick",
    value: function handleClick() {
      var doi = this.props.doi;
      window.open("https://scite.ai/reports/".concat(doi, "?").concat(this.queryString));
    }
  }, {
    key: "render",
    value: function render() {
      var horizontal = this.props.horizontal;
      var tally = this.state.tally;
      var classes = (0, _classnames.default)('scite-tally', {
        '-horizontal': horizontal,
        '-show': tally
      });
      var supporting = tally && tally.supporting || 0;
      var contradicting = tally && tally.contradicting || 0;
      var mentioning = tally && tally.mentioning || 0;
      return (0, _preact.h)("div", {
        className: classes,
        onClick: this.handleClick
      }, !horizontal && (0, _preact.h)("span", {
        className: "title"
      }, "scite_"), (0, _preact.h)(Count, {
        type: "supporting",
        count: supporting,
        horizontal: horizontal
      }), (0, _preact.h)(Count, {
        type: "mentioning",
        count: mentioning,
        horizontal: horizontal
      }), (0, _preact.h)(Count, {
        type: "contradicting",
        count: contradicting,
        horizontal: horizontal
      }));
    }
  }, {
    key: "queryString",
    get: function get() {
      var _this$props = this.props,
          source = _this$props.source,
          isBadge = _this$props.isBadge,
          campaign = _this$props.campaign;
      var params = {
        utm_medium: isBadge ? 'badge' : 'plugin',
        utm_source: source || 'generic',
        utm_campaign: campaign || 'badge_generic'
      };
      return _queryString.default.stringify(params);
    }
  }]);

  return Tally;
}(_preact.Component);

Tally.defaultProps = {
  horizontal: false,
  isBadge: false
};
var _default = Tally;
exports.default = _default;