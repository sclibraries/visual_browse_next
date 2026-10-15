const assert = require('node:assert/strict');
const { test } = require('node:test');
const { isEbook } = require('./ebook.cjs');

test('recognizes ebook metadata independently of provider and cover availability', () => {
  for (const host of ['www.jstor.org', 'brill.com', 'onlinelibrary.wiley.com', 'research.ebsco.com', 'ebookcentral.proquest.com']) {
    for (const imageItem of ['', 'https://example.test/cover.jpg']) {
      assert.equal(isEbook({ pubType: 'eBook', urlItem: [`https://${host}/book`], imageItem }), true);
    }
  }
  for (const materialType of ['eBook', 'E-BOOK', 'Electronic Book', 'Online Book']) {
    assert.equal(isEbook({ materialType }), true);
  }
  assert.equal(isEbook({ pubType: 'Book', pubTypeItem: ['eBook'] }), true);
  assert.equal(isEbook({ items: [{ name: 'TypePub', data: ['eBook'] }] }), true);
  assert.equal(isEbook({ pubType: 'Electronic Resource', pubTypeItem: ['Electronic Resource; eBook'] }), true);
  assert.equal(isEbook({ pubType: 'Electronic Resource', items: [{ name: 'TypePub', data: ['Electronic Resource; eBook'] }] }), true);
});

test('recognizes cataloged online books even when pagination is present', () => {
  assert.equal(isEbook({ pubType: 'Book', items: [{ name: 'PhysDesc', data: ['1 online resource (216 pages)'] }] }), true);
  assert.equal(isEbook({ pubType: 'Electronic Resource', items: [{ name: 'Subject', data: ['Electronic books'] }] }), true);
});

test('does not treat articles, PDFs, platform links, or missing covers as ebooks', () => {
  for (const record of [
    null, {}, { pubType: 'Book', imageItem: '' },
    { pubType: 'Academic Journal', pdf: true, otherFullText: true },
    { pubType: 'Article', fullText: { Text: { Availability: '1' } } },
    { pubType: 'Book', urlItem: ['https://onlinelibrary.wiley.com/book/example'] },
    { pubType: 'Book', items: [{ name: 'PhysDesc', data: ['216 pages ; 24 cm'] }] },
    { pubType: 'Video Recording', items: [{ name: 'PhysDesc', data: ['1 online resource'] }] },
    { pubType: 'Article', items: [{ name: 'Subject', data: ['Electronic books'] }] },
    { pubType: 'Audiobook', urlItem: ['https://ebookcentral.proquest.com/'] }
  ]) assert.equal(isEbook(record), false, JSON.stringify(record));
});
