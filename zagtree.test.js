// Filename: zagtree.spec.js  
// Timestamp: 2014.08.26-00:34:53 (last modified)  
// Author(s): Bumblehead (www.bumblehead.com)  

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import zagtree from './zagtree.js'

describe("zagtree.isnodeoverlap", function () {
  var testsArr = [
    [true, {start:29,end:35}, {start:12,end:30}],
    [true, {start:29,end:35}, {start:12,end:60}],
    [false, {start:29,end:35}, {start:40,end:60}],
    [true, {start:29,end:35}, {start:35,end:60}],
    [true, {start:29,end:35}, {start:0,end:30}],
    [false, {start:29,end:35}, {start:0,end:28}]
  ];

  function dataAsTestStr(d) {
    return 'should return `:bool`, `:period1, :period2'
        .replace(/:bool/, d[0])
        .replace(/:period1/, JSON.stringify(d[1]))
        .replace(/:period2/, JSON.stringify(d[2]));
  }

  testsArr.forEach(function (testData) {
    it(dataAsTestStr(testData), function () {
      var p = testData[1],
          overlapp = testData[2],
          result = testData[0];

      assert.strictEqual(zagtree.isnodeoverlap(p, overlapp), result);
    });
  });
});

describe("zagtree.isnodebeyond", function () {
  var testsArr = [
    [false, {start:29,end:35}, {start:12,end:30}],
    [false, {start:29,end:35}, {start:12,end:60}],
    [true, {start:29,end:35}, {start:40,end:60}],
    [false, {start:29,end:35}, {start:35,end:60}],
    [false, {start:29,end:35}, {start:0,end:30}],
    [false, {start:29,end:35}, {start:0,end:28}]
  ];

  function dataAsTestStr(d) {
    return 'should return `:bool`, `:period1, :period2'
        .replace(/:bool/, d[0])
        .replace(/:period1/, JSON.stringify(d[1]))
        .replace(/:period2/, JSON.stringify(d[2]));
  }

  testsArr.forEach(function (testData) {
    it(dataAsTestStr(testData), function () {
      var p = testData[1],
          overlapp = testData[2],
          result = testData[0];

      assert.strictEqual(zagtree.isnodebeyond(p, overlapp), result);
    });
  });
});

describe("zagtree.isnodeinside", function () {
  var testsArr = [
    [true, {start:29,end:35}, {start:30,end:30}],
    [false, {start:29,end:35}, {start:12,end:60}],
    [false, {start:29,end:35}, {start:40,end:60}],
    [false, {start:29,end:35}, {start:35,end:60}],
    [false, {start:29,end:35}, {start:0,end:30}],
    [false, {start:29,end:35}, {start:0,end:28}]
  ];

  function dataAsTestStr(d) {
    return 'should return `:bool`, `:period1, :period2'
        .replace(/:bool/, d[0])
        .replace(/:period1/, JSON.stringify(d[1]))
        .replace(/:period2/, JSON.stringify(d[2]));
  }

  testsArr.forEach(function (testData) {
    it(dataAsTestStr(testData), function () {
      var p = testData[1],
          overlapp = testData[2],
          result = testData[0];

      assert.strictEqual(zagtree.isnodeinside(p, overlapp), result);
    });
  });
});
