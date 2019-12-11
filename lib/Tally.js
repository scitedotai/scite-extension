"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _queryString = _interopRequireDefault(require("query-string"));

var _classnames = _interopRequireDefault(require("classnames"));

var _reactPopper = require("react-popper");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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
  return _react.default.createElement("div", {
    className: (0, _classnames.default)('scite-tally-count', {
      '-horizontal': horizontal
    })
  }, _react.default.createElement("i", {
    className: iconClasses(type)
  }), _react.default.createElement("span", {
    className: "number"
  }, count));
};

var TooltipTally = function TooltipTally(_ref2) {
  var className = _ref2.className,
      tally = _ref2.tally;
  return _react.default.createElement("div", {
    className: (0, _classnames.default)('scite-tooltip-tally', className)
  }, _react.default.createElement("div", {
    className: "tally"
  }, _react.default.createElement(Count, {
    type: "supporting",
    count: tally ? tally.supporting : 0
  }), _react.default.createElement(Count, {
    type: "mentioning",
    count: tally ? tally.mentioning : 0
  }), _react.default.createElement(Count, {
    type: "contradicting",
    count: tally ? tally.contradicting : 0
  })), _react.default.createElement("div", {
    className: "scite-tally-labels labels"
  }, _react.default.createElement("span", {
    className: "label"
  }, "Supporting"), _react.default.createElement("span", {
    className: "label"
  }, "Mentioning"), _react.default.createElement("span", {
    className: "label"
  }, "Contradicting")));
};

var TooltipMessage = function TooltipMessage(_ref3) {
  var className = _ref3.className;
  return _react.default.createElement("div", {
    className: (0, _classnames.default)('scite-tooltip-message', className)
  }, _react.default.createElement("p", null, "scite is a platform that combines deep learning with expert analysis to automatically classify citations as supporting, contradicting or mentioning."));
};

var TooltipContent = function TooltipContent(_ref4) {
  var tally = _ref4.tally;
  return _react.default.createElement("div", {
    className: "scite-tooltip-content"
  }, _react.default.createElement("span", {
    className: "scite-title"
  }, "scite_"), _react.default.createElement("span", {
    className: "slogan"
  }, "Making Science Reliable"), _react.default.createElement(TooltipTally, {
    tally: tally
  }), tally && _react.default.createElement("a", {
    className: "scite-button button",
    href: "https://scite.ai/reports/".concat(tally.doi),
    target: "_blank"
  }, "View Citations"), _react.default.createElement(TooltipMessage, {
    className: "message"
  }));
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
      tally: null,
      showTooltip: false
    };
    _this.handleClick = _this.handleClick.bind(_assertThisInitialized(_this));
    _this.handleMouseEnter = _this.handleMouseEnter.bind(_assertThisInitialized(_this));
    _this.handleMouseLeave = _this.handleMouseLeave.bind(_assertThisInitialized(_this));
    _this.fetchReport = _this.fetchReport.bind(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(Tally, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.fetchReport();
    }
  }, {
    key: "handleMouseEnter",
    value: function handleMouseEnter() {
      if (this.hideTooltipIntvl) {
        clearTimeout(this.hideTooltipIntvl);
      }

      this.setState({
        showTooltip: true
      });
    }
  }, {
    key: "handleMouseLeave",
    value: function handleMouseLeave() {
      var _this2 = this;

      this.hideTooltipIntvl = setTimeout(function () {
        _this2.setState({
          showTooltip: false
        });
      }, 300);
    }
  }, {
    key: "fetchReport",
    value: function fetchReport() {
      var _this3 = this;

      var retry = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var maxRetries = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 8;
      var doi = this.props.doi;
      var fetchFailed = new Error('Failed to get Tally');
      fetch("https://api.scite.ai/tallies/".concat(doi)).then(function (response) {
        if (response.status === 404) {
          // Then we will set a 0 tally
          _this3.setState({
            tally: {
              doi: doi,
              total: 0
            }
          });

          return {};
        }

        if (!response.ok) {
          throw fetchFailed;
        }

        return response.json();
      }).then(function (tally) {
        if (typeof tally.total === 'number') {
          _this3.setState({
            tally: tally
          });
        }
      }).catch(function (e) {
        if (e === fetchFailed && retry < maxRetries) {
          return setTimeout(function () {
            return _this3.fetchReport(++retry, maxRetries);
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
      var _this4 = this;

      var _this$props = this.props,
          horizontal = _this$props.horizontal,
          showZero = _this$props.showZero;
      var _this$state = this.state,
          tally = _this$state.tally,
          showTooltip = _this$state.showTooltip;
      var classes = {
        tally: (0, _classnames.default)('scite-tally', {
          '-horizontal': horizontal,
          '-show': showZero ? tally : tally && tally.total > 0
        }),
        tooltip: (0, _classnames.default)('scite-tooltip', {
          '-show': showTooltip
        })
      };
      var supporting = tally && tally.supporting || 0;
      var contradicting = tally && tally.contradicting || 0;
      var mentioning = tally && tally.mentioning || 0;
      return _react.default.createElement(_reactPopper.Manager, null, _react.default.createElement(_reactPopper.Reference, null, function (_ref5) {
        var ref = _ref5.ref;
        return _react.default.createElement("div", {
          className: classes.tally,
          onClick: _this4.handleClick,
          onMouseEnter: _this4.handleMouseEnter,
          onMouseLeave: _this4.handleMouseLeave,
          ref: ref
        }, !horizontal && _react.default.createElement("span", {
          className: "scite-title title"
        }, "scite_"), _react.default.createElement(Count, {
          type: "supporting",
          count: supporting,
          horizontal: horizontal
        }), _react.default.createElement(Count, {
          type: "mentioning",
          count: mentioning,
          horizontal: horizontal
        }), _react.default.createElement(Count, {
          type: "contradicting",
          count: contradicting,
          horizontal: horizontal
        }));
      }), _react.default.createElement(_reactPopper.Popper, {
        placement: "top"
      }, function (_ref6) {
        var ref = _ref6.ref,
            style = _ref6.style,
            placement = _ref6.placement,
            arrowProps = _ref6.arrowProps,
            scheduleUpdate = _ref6.scheduleUpdate;
        return _react.default.createElement("div", {
          className: classes.tooltip,
          ref: ref,
          style: style,
          "data-placement": placement,
          onMouseEnter: _this4.handleMouseEnter,
          onMouseLeave: _this4.handleMouseLeave
        }, _react.default.createElement(TooltipContent, {
          tally: tally
        }), _react.default.createElement("div", {
          className: "scite-tooltip-arrow",
          ref: arrowProps.ref,
          style: arrowProps.style
        }));
      }));
    }
  }, {
    key: "queryString",
    get: function get() {
      var _this$props2 = this.props,
          source = _this$props2.source,
          isBadge = _this$props2.isBadge,
          campaign = _this$props2.campaign;
      var params = {
        utm_medium: isBadge ? 'badge' : 'plugin',
        utm_source: source || 'generic',
        utm_campaign: campaign || 'badge_generic'
      };
      return _queryString.default.stringify(params);
    }
  }]);

  return Tally;
}(_react.Component);

Tally.defaultProps = {
  horizontal: false,
  isBadge: false,
  showZero: true
};
var _default = Tally;
exports.default = _default;