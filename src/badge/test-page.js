import React from 'react'
import { render } from 'react-dom'
import './styles/test.css'

const rows = [
  {
    // TODO: create new view for badge
    doi: '10.1186/ar2146',
    showLabels: true,
    placement: 'none',
    verticalCompact: true
  },
  {
    doi: '10.1038/nature07404',
    layout: 'vertical',
    showLabels: true,
    placement: 'none'
  },
  {
    doi: '10.1038/nature07404',
    layout: 'vertical',
    showLabels: true,
    small: true
  },
  {
    doi: '10.notrealjoaifds',
    layout: 'vertical'
  },
  {
    doi: '10.notrealjoaifds',
    layout: 'vertical',
    forceCollapse: true
  },
  {
    doi: '10.1038/nature07404',
    layout: 'horizontal',
    showLabels: true
  },
  {
    doi: '10.1038/nature07404',
    layout: 'horizontal',
    showLabels: false
  },
  {
    doi: '10.1038/nature07404',
    layout: 'horizontal',
    showLabels: true,
    small: true
  },
  {
    doi: '10.1038/nature07404',
    layout: 'horizontal',
    showLabels: false,
    small: true
  },
  {
    doi: '10.1038/nature07404',
    layout: 'vertical',
    showLabels: false
  },
  {
    doi: '10.1038/nature07404',
    layout: 'vertical',
    showLabels: false,
    small: true
  },
  {
    doi: '10.1038/nature07404',
    layout: 'vertical',
    placement: 'left',
    autologin: 'azure'
  }
]

const Badge = ({ doi, layout, showLabels, forceCollapse, placement, small, autologin, rewardfulID, chartType, tallyShow = true, sectionTallyShow = false, showLogo = true, sectionTallyLayout, forceShow = false, verticalCompact = false }) => (
  <div
    className='scite-badge'
    data-doi={doi}
    data-layout={layout}
    data-show-labels={String(!!showLabels)}
    data-tooltip-placement={placement}
    data-small={small}
    data-autologin={autologin}
    data-campaign='test'
    data-force-collapse={forceCollapse}
    data-rewardful-id={rewardfulID}
    data-chart-type={chartType}
    data-show-logo={showLogo}
    data-tally-show={tallyShow}
    data-section-tally-show={sectionTallyShow}
    data-section-tally-layout={sectionTallyLayout}
    data-force-show={forceShow}
    data-vertical-compact={verticalCompact}
  />
)

const Row = ({ doi, layout, showLabels, forceCollapse, placement, small, autologin, chartType, tallyShow = true, sectionTallyShow = false, showLogo = true, sectionTallyLayout, forceShow = false, verticalCompact = false }) => (
  <div className='badge-row'>
    <p className='paper'>
      etsi vereor, iudices, ne turpe sit pro fortissimo viro dicere incipientem timere minimeque deceat, cum T. Annius ipse magis de rei publicae salute quam de sua perturbetur1, me ad eius causam parem animi magnitudinem adferre non posse, tamen haec novi iudici nova forma terret oculos qui, quocumque inciderunt, veterem consuetudinem fori et pristinum morem iudiciorum requirunt.
    </p>
    <Badge
      doi={doi}
      layout={layout}
      showLabels={showLabels}
      forceCollapse={forceCollapse}
      placement={placement}
      small={small}
      autologin={autologin}
      tallyShow={tallyShow}
      sectionTallyShow={sectionTallyShow}
      chartType={chartType}
      showLogo={showLogo}
      sectionTallyLayout={sectionTallyLayout}
      forceShow={forceShow}
      verticalCompact={verticalCompact}
    />
  </div>
)

const App = () => (
  <div>
    <meta name='article_doi' content='10.1891/0889-8391.13.2.158' />

    <div className='scite-badge-config' data-target-el='.special-container > .foobar' data-insert-before='true' data-doi='10.1016/j.biopsych.2005.08.012' data-tooltip-placement='right' />
    <div className='scite-badge-config' data-target-el='.special-container' data-doi='meta:article_doi' data-tooltip-placement='right' />

    <div className='badges'>
      {/* {
        rows.map((props, id) => (
          <Row key={id} {...props} />
        ))
      } */}

      <Row {...rows[0]} key='sam-testing' />

      <hr />
    </div>

    <div className='narrow'>
      <Row doi='10.1016/j.biopsych.2005.08.012' layout='vertical' />
    </div>
    <div className='wide'>
      <Badge
        doi='10.1016/j.biopsych.2005.08.012'
        layout='vertical'
        showLabels={false}
        placement='top'
      />
    </div>
    <div className='wide'>
      <Badge
        doi='10.1016/j.biopsych.2005.08.012'
        layout='horizontal'
        showLabels={false}
        placement='top'
      />
    </div>
    <div className='special-container'>
      <div>Some random stuff they like</div>
      <div className='foobar'>Some other random stuff they like</div>
    </div>
    <div>
      Rewardful ID:
      <Badge
        doi='10.1016/j.biopsych.2005.08.012'
        layout='horizontal'
        showLabels={false}
        placement='top'
        rewardfulID='12345'
      />
    </div>

    <div className='wide'>
      <Row doi='10.1016/j.biopsych.2005.08.012' tallyShow small layout='horizontal' sectionTallyShow chartType='bar' showLogo={false} />

      <Row doi='10.1016/j.biopsych.2005.08.012' tallyShow small sectionTallyShow chartType='bar' showLogo={false} />

      <Row doi='10.1016/j.biopsych.2005.08.012' tallyShow={false} sectionTallyShow chartType='bar' />

      <Row doi='10.1016/j.biopsych.2005.08.012' tallyShow={false} sectionTallyShow chartType='pie' />

      <Row doi='10.1016/j.biopsych.2005.08.012' tallyShow={false} sectionTallyShow chartType='donut' />

      <Row doi='10.1016/j.biopsych.2005.08.012' tallyShow={false} sectionTallyShow />

      <Row doi='10.1016/j.biopsych.2005.08.012' tallyShow={false} sectionTallyShow showLabels />

      <Row doi='10.1016/j.biopsych.2005.08.012' tallyShow={false} sectionTallyShow sectionTallyLayout='horizontal' />

    </div>
  </div>
)

const app = document.querySelector('#app')
render(<App />, app)
