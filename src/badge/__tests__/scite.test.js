/* eslint-env jest */

import { fetchNotices, fetchSectionTallies, fetchTallies } from '../scite'

const { fetch } = window

const tallyMock = { tallies: { '10.1038/nature10167': { doi: '10.1038/nature10167', total: 803, supporting: 37, contradicting: 4, mentioning: 762, unclassified: 0, citingPublications: 100 }, '10.1016/j.biopsych.2005.08.012': { doi: '10.1016/j.biopsych.2005.08.012', total: 309, supporting: 25, contradicting: 3, mentioning: 281, unclassified: 0, citingPublications: 100 }, '10.1891/0889-8391.13.2.158': { doi: '10.1891/0889-8391.13.2.158', total: 28633, supporting: 1124, contradicting: 71, mentioning: 27438, unclassified: 0, citingPublications: 100 } } }
const talliesExpected = { tallies: { '10.1038/nature10167': { doi: '10.1038/nature10167', total: 803, supporting: 37, contradicting: 4, mentioning: 762, unclassified: 0, citingPublications: 100 }, '10.1016/j.biopsych.2005.08.012': { doi: '10.1016/j.biopsych.2005.08.012', total: 309, supporting: 25, contradicting: 3, mentioning: 281, unclassified: 0, citingPublications: 100 }, '10.1891/0889-8391.13.2.158': { doi: '10.1891/0889-8391.13.2.158', total: 28633, supporting: 1124, contradicting: 71, mentioning: 27438, unclassified: 0, citingPublications: 100 } } }
const papersMock = { papers: { '10.1891/0889-8391.13.2.158': { doi: '10.1891/0889-8391.13.2.158', slug: 'self-efficacy-the-exercise-of-control-r6Pkgx6', type: 'journal-article', title: 'Self-Efficacy: The Exercise of Control', authors: [{ family: 'Bandura', given: 'Albert' }, { family: 'Freeman', given: 'W. H.' }, { family: 'Lightsey', given: 'Richard' }], year: 1999, shortJournal: 'J Cogn Psychother', publisher: 'Springer Publishing Company', issue: '2', volume: '13', page: '158-166', retracted: false, memberId: 793, issns: ['0889-8391', '1938-887X'], editorialNotices: [], journalSlug: 'journal-of-cognitive-psychotherapy-A3G8a', journal: 'Journal of Cognitive Psychotherapy' }, '10.1038/nature10167': { doi: '10.1038/nature10167', slug: 'selective-killing-of-cancer-cells-Mv4p2W', type: 'journal-article', title: 'Selective killing of cancer cells by a small molecule targeting the stress response to ROS', authors: [{ family: 'Raj', given: 'Lakshmi' }, { family: 'Ide', given: 'Takao' }, { family: 'Gurkar', given: 'Aditi U.' }, { family: 'Foley', given: 'Michael' }, { family: 'Schenone', given: 'Monica' }, { family: 'Li', given: 'Xiaoyu' }, { family: 'Tolliday', given: 'Nicola J.' }, { family: 'Golub', given: 'Todd R.' }, { family: 'Carr', given: 'Steven A.' }, { family: 'Shamji', given: 'Alykhan F.' }, { family: 'Stern', given: 'Andrew M.' }, { family: 'Mandinova', given: 'Anna' }, { family: 'Schreiber', given: 'Stuart L.' }, { family: 'Lee', given: 'Sam W.' }], keywords: ['Article'], year: 2011, shortJournal: 'Nature', publisher: 'Springer Science and Business Media LLC', issue: '7355', volume: '475', page: '231-234', retracted: false, memberId: 297, issns: ['0028-0836', '1476-4687'], rwStatus: 'Retraction', editorialNotices: [{ status: 'Retracted', date: '2018-07-25', doi: '10.1038/nature10167', urls: ['http://retractionwatch.com/2018/07/25/nature-cancer-paper-that-raised-animal-welfare-concerns-is-retracted/', 'http://retractionwatch.com/2015/09/16/animal-welfare-breach-prompts-nature-correction/'] }, { status: 'Has erratum', date: '2012-01-25', doi: '10.1038/nature10167' }, { status: 'Retracted', date: '2018-07-25', doi: '10.1038/nature10167' }], journalSlug: 'nature-wmGvz', journal: 'Nature' }, '10.1016/j.biopsych.2005.08.012': { doi: '10.1016/j.biopsych.2005.08.012', slug: 'association-between-amygdala-hyperactivity-to-gVamGz', type: 'journal-article', title: 'Association between Amygdala Hyperactivity to Harsh Faces and Severity of Social Anxiety in Generalized Social Phobia', abstract: 'Our findings suggest that amygdala activation to interpersonal threat can be specifically linked to the severity of social anxiety symptoms of individual GSP patients, and thus, may serve as a useful functional marker of disease severity.', authors: [{ family: 'Phan', given: 'K. Luan' }, { family: 'Fitzgerald', given: 'Daniel A.' }, { family: 'Nathan', given: 'Pradeep J.' }, { family: 'Tancer', given: 'Manuel E.' }], year: 2006, shortJournal: 'Biological Psychiatry', publisher: 'Elsevier BV', issue: '5', volume: '59', page: '424-429', retracted: false, memberId: 78, issns: ['0006-3223'], editorialNotices: [], journalSlug: 'biological-psychiatry-5GzJD', journal: 'Biological Psychiatry' } } }
const noticesExpected = { notices: { '10.1891/0889-8391.13.2.158': [], '10.1038/nature10167': ['Retracted', 'Has erratum'], '10.1016/j.biopsych.2005.08.012': [] } }
const sectionTallyMock = { tallies: { total: 861, introduction: 196, results: 135, methods: 15, discussion: 244, other: 218, doi: '10.1038/nature10167' } }
const sectionTalliesExpected = { tallies: { total: 861, introduction: 196, results: 135, methods: 15, discussion: 244, other: 218, doi: '10.1038/nature10167' } }

beforeEach(() => {
  fetch.resetMocks()
})

describe('fetchesTallies', () => {
  it('fetchesTallies returns empty with no tallies', async () => {
    const tallies = await fetchTallies([])

    expect(tallies).toEqual({ tallies: {} })
    expect(fetch).toHaveBeenCalledTimes(0)
  })

  it('fetchesTallies returns with tallies', async () => {
    fetch.mockResponseOnce(JSON.stringify(tallyMock))

    const tallies = await fetchTallies(['10.1038/nature10167'])

    expect(tallies).toEqual(talliesExpected)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('fetchesTallies returns with tallies after 1 failure', async () => {
    fetch.mockResponseOnce('', { status: 500, headers: { 'content-type': 'application/json' } })
    fetch.mockResponseOnce(JSON.stringify(tallyMock))

    const tallies = await fetchTallies(['10.1038/nature10167'])

    expect(tallies).toEqual(talliesExpected)
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})

describe('fetchesNotices', () => {
  it('fetchesNotices returns empty with no papers', async () => {
    fetch.mockResponseOnce(JSON.stringify({ papers: { } }))

    const notices = await fetchNotices([])

    expect(notices).toEqual({ notices: {} })
    expect(fetch).toHaveBeenCalledTimes(0)
  })

  it('fetchesNotices returns expected with papers', async () => {
    fetch.mockResponseOnce(JSON.stringify(papersMock))

    const notices = await fetchNotices(['10.1891/0889-8391.13.2.158'])

    expect(notices).toEqual(noticesExpected)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('fetchesNotices returns expected with papers after failing', async () => {
    fetch.mockResponseOnce('', { status: 500, headers: { 'content-type': 'application/json' } })
    fetch.mockResponseOnce(JSON.stringify(papersMock))

    const notices = await fetchNotices(['10.1891/0889-8391.13.2.158'])

    expect(notices).toEqual(noticesExpected)
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})

describe('fetchesSectionTallies', () => {
  it('fetchesSectionTallies returns empty with no tallies', async () => {
    fetch.mockResponseOnce(JSON.stringify({ tallies: { } }))

    const sectionTallies = await fetchSectionTallies([])

    expect(sectionTallies).toEqual({ tallies: {} })
    expect(fetch).toHaveBeenCalledTimes(0)
  })

  it('fetchesSectionTallies returns expected with papers', async () => {
    fetch.mockResponseOnce(JSON.stringify(sectionTallyMock))

    const sectionTallies = await fetchSectionTallies(['10.1891/0889-8391.13.2.158'])

    expect(sectionTallies).toEqual(sectionTalliesExpected)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('fetchesSectionTallies returns expected with papers after failing', async () => {
    fetch.mockResponseOnce('', { status: 500, headers: { 'content-type': 'application/json' } })
    fetch.mockResponseOnce(JSON.stringify(sectionTallyMock))

    const sectionTallies = await fetchSectionTallies(['10.1891/0889-8391.13.2.158'])

    expect(sectionTallies).toEqual(sectionTalliesExpected)
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
