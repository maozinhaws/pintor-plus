
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><div id="test" data-srcdoc="if (a &amp;&amp; b)"></div>');
const el = dom.window.document.getElementById('test');
console.log('Attribute value:', el.getAttribute('data-srcdoc'));
