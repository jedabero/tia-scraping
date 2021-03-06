const functions = require('firebase-functions');
const cheerio = require('cheerio');
const request = require('request-promise');

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

const SITE = 'https://tia.officialbuyersguide.net';

const allowedOrigins = ['http://localhost:3000', 'http://localhost:5000', 'https://tia-scraping.firebaseapp.com']

exports.getData = functions.https.onRequest(async (req, res) => {
  const origin = req.get('origin');
  if (allowedOrigins.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
  } else {
    res.set('Access-Control-Allow-Origin', allowedOrigins[2]);
  }
  const listings = [];
  const { rad = 5, rad2 = 'km', rad3 = '', cid = 1 } = req.query;
  let nextPageURI = `SearchResult.asp?rad=${rad}&rad2=${rad2}&rad3=${rad3}&cid=${cid}`;
  do {
    /* eslint-disable no-await-in-loop */
    const result = await request({
      uri: `${SITE}/${nextPageURI}`,
      method: 'GET',
      family: 4,
    });
    const page = cheerio.load(result);
    const listNav = page('#ListNav');
    const nextPageURINode = listNav.children().children().children().children().last();
    nextPageURI = nextPageURINode.children().children().first().attr('href');
    listNav.nextAll('#ListingMini').each((i, listing) => {
      const listingNode = page(listing);
      const companySectionNode = listingNode.find('#companyname');
      const companyNode = companySectionNode.children().first();
      const companyURI = `${SITE}/${companyNode.attr('href')}`;
      const companyName = companyNode.text();
      const ownerNode = companySectionNode.next();
      const owner = ownerNode.text();
      let poBox, fax, website, address = '';
      ownerNode.nextAll('br').each((i, brNode) => {
        let textAfterBr = page(brNode).get(0).nextSibling.nodeValue;
        textAfterBr = textAfterBr ? textAfterBr.trim() : textAfterBr;
        if (textAfterBr && textAfterBr.includes('P.O. Box')) {
          poBox = textAfterBr;
        }
        if (textAfterBr && textAfterBr.includes('Fax')) {
          fax = textAfterBr;
        }
        if (textAfterBr && textAfterBr.includes('www.')) {
          website = textAfterBr;
        }
        if (textAfterBr && !textAfterBr.includes('P.O. Box') && !textAfterBr.includes('Phone') && !textAfterBr.includes('Fax') && !textAfterBr.includes('www.')) {
          address += `${address.length > 0 ? ', ' : ''}${textAfterBr}`;
        }
      });
      address = address.trim();

      const phone = ownerNode.nextAll('.Disappear').first().text();
      const email = ownerNode.nextAll('a').first().text();
      const distance = ownerNode.nextAll('i').text();

      listings.push({ companyName, companyURI, owner, address, poBox, fax, website, phone, email, distance });
    });

  } while (nextPageURI);

  res.json(listings);
});