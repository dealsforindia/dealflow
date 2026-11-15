import test from 'node:test';
import assert from 'node:assert/strict';
import {filterOffers, toggleSelection, calculateEMI, makeWatch} from './model.mjs';
const offers=[{id:'a',title:'Cable',store:'Flipkart',category:'Electronics',price:129},{id:'b',title:'Air cooler',store:'Amazon',category:'Home',price:12250}];
test('search, store and price filters compose',()=>{assert.deepEqual(filterOffers(offers,{query:'cable',store:'Flipkart',maxPrice:200}).map(x=>x.id),['a']);assert.equal(filterOffers(offers,{query:'cable',store:'Amazon'}).length,0);});
test('saved and comparison selection toggle without duplicates and respect limit',()=>{assert.deepEqual(toggleSelection(['a'],'a',3),[]);assert.deepEqual(toggleSelection(['a','b','c'],'d',3),['a','b','c']);});
test('EMI handles zero interest and an ordinary loan',()=>{assert.equal(calculateEMI(12000,0,12).monthly,1000);assert.ok(Math.abs(calculateEMI(10000,12,12).monthly-888.49)<0.02);assert.throws(()=>calculateEMI(-1,12,12));});
test('price goals validate target and retain selected product',()=>{assert.equal(makeWatch(offers[0],100).offerId,'a');assert.throws(()=>makeWatch(offers[0],0));assert.throws(()=>makeWatch(offers[0],200));});
