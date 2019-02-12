const functions = require('firebase-functions');
const cheerio = require('cheerio');
const request = require('request-promise');

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

const SITE = 'https://tia.officialbuyersguide.net';

exports.getData = functions.https.onRequest(async (req, res) => {
  const { rad = 5, rad2 = 'km', rad3 = '', cid = 1 } = req.query;
  const result = await request({
    uri: `${SITE}/SearchResult.asp?rad=${rad}&rad2=${rad2}&rad3=${rad3}&cid=${cid}`,
    method: 'GET',
  });
  const page = cheerio.load(result);
  const listings = [];
  page('#ListNav').nextAll('#ListingMini').each((i, listing) => {
    const listingNode = page(listing).first().first().first();
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

    listings[i] = { companyName, companyURI, owner, address, poBox, fax, website, phone, email, distance };
  });

  res.json(listings);
});
