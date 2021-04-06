# Scite Extension #

## Building ##

```
$ npm i
$ npm run build
```

Then the extension is in `extension`

## Developing ##

For local development you can use [web-ext](https://github.com/mozilla/web-ext) which will run the extension in a browser and reload any change to the build. You can manually build like above or use `npm run watch build` to automatically build any changes you make to src.
```
$ npm run dev # run web-ext
$ npm run watch build # build any changes you make to src.
```

Use web-ext lint to lint your changes
```
$ npm run lint
```

Once you are ready to deploy you may use the build you have run to sideload into firefox and chrome to test the extension to check that works.

## Releasing ##

1. Bump the version in `package.json` and `manifest.json` and commit
2. Tag the release (e.g.):

```bash
$ git tag v1.10.0 -m "My cool new version"
$ git push origin v1.10.0
```

3. Build the extension

```bash
$ npm run build
```

4. run the following:

### Chrome ###

```bash
$ zip -r extension.zip extension/*
```

1. Go to the [developer dashboard](https://chrome.google.com/webstore/developer/dashboard)
2. Click on the extension (if you do not see it check you are looking at the right `scite` publisher in the top right)
3. Click `package` on the left
4. Click upload new package
5. Click submit for review

### Firefox ###

```bash
$ zip -r extension-full.zip . -x "node_modules/*" -x ".cache/*" -x ".git/*"
$ cd extension
$ zip -r ../extension.zip .
```

1. Go to the [developer dashboard](https://addons.mozilla.org/en-US/developers/addons)
2. Click `New version`
3. Click `Select file` and select the new `extension.zip`
4. Click `Continue`, `Yes`, `Upload source code` and select `extension-full.zip`
5. Click `Continue`, write some release note(s) and submit!


### Safari ###

**Note:** requires macosx+xcode+apple developer access

Build the extension if you haven't already:
```bash
$ npm i
$ npm run build
```

```bash
xcrun safari-web-extension-converter ./extension --project-location . --app-name scite --bundle-identifier ai.scite --swift
```

once that opens in xcode follow `Enable Your App Extension in Safari` to install the extension in Safari:
https://developer.apple.com/documentation/safariservices/safari_app_extensions/building_a_safari_app_extension#2957926
and
`Build and Run the Application` to run the extension

Once you have the extension running do the following in xcode
```
- Set the version and build numbers in both the project and scite extension/Info.plist to be what you want
- Set the category on the *.plist files
- Project > Build
- Project > Archive
- Organizater > Upload
```

The new version should show up in the apple app store connect store ready for you to distribute.

**Tip:** Xcode is very particular make sure all the version, certificate, and accounts information in the xcode project line up.

## Scite API Terms ##

https://scite.ai/apiterms

## Testing Badge Pages ##

These are the sites we offical support for our badge insertion.

When making changes test on the folling sites (examples suggested):

#### wikipedia.org

 https://en.wikipedia.org/wiki/Messenger_RNA

#### pubmed.ncbi.nlm.nih.gov

Search: https://pubmed.ncbi.nlm.nih.gov/?term=metabolic+engineering
Result: https://pubmed.ncbi.nlm.nih.gov/29704654/

#### ncbi.nlm.nih.gov/pmc

Search: https://www.ncbi.nlm.nih.gov/pmc/?term=metabolic+engineering
Result: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4258820/
#### sciencedirect.com

Result: https://www.sciencedirect.com/science/article/pii/S0960982298702982
#### elifesciences.org

Search: https://elifesciences.org/articles/62456#references
#### nature.com

Result: https://www.nature.com/articles/s41467-020-19171-4
#### scholar.google.com

Search: https://scholar.google.com/scholar?hl=en&as_sdt=0%2C5&q=Citation+contexts&btnG=
#### google

Search: https://www.google.com/search?source=hp&ei=3nDaX5LEF_Kw5NoP8fiAwAk&q=%22Comparing+citation+contexts+for+information+retrieval%22&oq=%22Comparing+citation+contexts+for+information+retrieval%22&gs_lcp=CgZwc3ktYWIQAzIICCEQFhAdEB5QhQpYlBBgpRJoAHAAeACAAZ4BiAGfA5IBAzAuM5gBAKABAaABAqoBB2d3cy13aXo&sclient=psy-ab&ved=0ahUKEwiSq_WlrtPtAhVyGFkFHXE8AJgQ4dUDCAg&uact=5
#### journals.plos.org

Search: https://journals.plos.org/plosone/search?q=ocean+warming&filterJournals=PLoSONE
Result: https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0242331#references
#### orcid.org

Result: https://orcid.org/0000-0002-2869-6383
#### pubs.acs.org

Search: https://pubs.acs.org/action/doSearch?AllField=yeast
Result: https://pubs.acs.org/doi/10.1021/jf903660a
#### springer.com

Result: https://link.springer.com/article/10.1007/s11192-020-03789-8
#### mdpi.com

Search: https://www.mdpi.com/search?sort=article_citedby&page_count=50&year_from=1996&year_to=2020&q=robotics&volume=1&view=default
Result: https://www.mdpi.com/2504-4990/1/1/10/htm
#### journals.sagepub.com

Search: https://journals.sagepub.com/action/doSearch?filterOption=thisJournal&SeriesKey=orma&AllField=Citation+Context
Result: https://journals.sagepub.com/doi/10.1177/1094428120969905
#### tandfonline.com

Search: https://www.tandfonline.com/action/doSearch?AllField=citation+contexts
Result: https://www.tandfonline.com/doi/citedby/10.4161/bioe.29935?scroll=top&needAccess=true
#### spiedigitallibrary.org

Result: https://www.spiedigitallibrary.org/journals/journal-of-photonics-for-energy/volume-9/issue-04/040901/Review-on-methods-for-improving-the-thermal-and-ambient-stability/10.1117/1.JPE.9.040901.full?tab=ArticleLinkReference&SSO=1
#### onlinelibrary.wiley.com

Search: https://onlinelibrary.wiley.com/action/doSearch?AllField=yeast
Result: https://onlinelibrary.wiley.com/doi/10.1002/pmic.200900273
#### karger.com

Search: https://www.karger.com/Search/?q=yeast&q_Submit=
Result: https://www.karger.com/Article/Abstract/268129
#### biorxiv.org

Search: https://www.biorxiv.org/search/metabolic%252Bengineering%20numresults%3A10%20sort%3Apublication-date%20direction%3Aascending
Result: https://www.biorxiv.org/content/10.1101/000067v1.full
#### medrxiv.org

Search: https://www.medrxiv.org/search/polio
Result: https://www.medrxiv.org/content/10.1101/19004358v1.full

#### sciencemag.org

Result: https://science.sciencemag.org/content/370/6522/1339

#### Web of Science

Search: https://apps.webofknowledge.com/Search.do?product=WOS&SID=7FBJBRDYirSDUSgFy8Y&search_mode=GeneralSearch&prID=21affb63-584d-4925-afaf-ef1c14952f33

#### Scopus

Search: https://www-scopus-com.ezproxy.library.dal.ca/results/results.uri?cc=10&sort=cp-f&src=s&st1=metabolic+engineering&nlo=&nlr=&nls=&sid=256280b50670bb6505db827097fbdb2b&sot=b&sdt=b&sl=36&s=TITLE-ABS-KEY%28metabolic+engineering%29&ss=cp-f&ps=r-f&editSaveSearch=&origin=resultslist&zone=resultslist
Result: https://www-scopus-com.ezproxy.library.dal.ca/record/display.uri?eid=2-s2.0-33646397592&origin=resultslist&sort=cp-f&src=s&st1=metabolic+engineering&nlo=&nlr=&nls=&sid=78da5142899dfbe53b047930ef587457&sot=b&sdt=b&sl=36&s=TITLE-ABS-KEY%28metabolic+engineering%29&relpos=1&citeCnt=3356&searchTerm=

#### PNAS

Search: https://www.pnas.org/search/metascience%20content_type%3Ajournal

Result: https://www.pnas.org/content/117/4/1910#ref-list-1

#### Europe PMC

Result: http://europepmc.org/article/MED/25942454#id600581

#### Conected Papers

Result: https://www.connectedpapers.com/main/0b4c513b66754d5e7c700508629e2d28b1061609/Science-mapping-software-tools-Review-analysis-and-cooperative-study-among-tools/graph


#### peerj

Result: https://peerj.com/articles/148/

#### clinical trials

Result: https://www.clinicaltrials.gov/ct2/show/study/NCT03502551?term=ketamine&draw=2&rank=17

#### lens

search: https://www.lens.org/lens/search/scholar/list?q=metabolic%20engineering&preview=true

result: https://www.lens.org/lens/scholar/article/181-440-771-548-406/citations/citing

and: https://www.lens.org/lens/scholar/article/181-440-771-548-406/citations/articles

#### biomedcentral

search: https://jcircadianrhythms.biomedcentral.com/articles?tab=keyword&sort=PubDateAscending

result: https://jcircadianrhythms.biomedcentral.com/articles/10.1186/1740-3391-1-2
