'use strict';
/* jshint node: true */

// http://apps.ntv7.com.my/goldenawards2014/voting_male.asp

var fs      = require('fs');
var request = require('request');
var _       = require('underscore');

// http://apps.ntv7.com.my/goldenawards2014/Interface.asmx

var list  = [];
var input = fs.createReadStream('malaysia-ip.txt');

function getCode() {
  var code = Math.round(Math.random() * 21) + 1;
  return code === 8 ? getCode() : code;
}

function genIP() {
  var i     = Math.round(Math.random() * (list.length - 1));
  var range = list[i];

  var ip0 = Math.round(Math.random() * (range.e[0] - range.s[0])) + range.s[0];
  var ip1 = Math.round(Math.random() * (range.e[1] - range.s[1])) + range.s[1];
  var ip2 = Math.round(Math.random() * (range.e[2] - range.s[2])) + range.s[2];
  var ip3 = Math.round(Math.random() * (range.e[3] - range.s[3])) + range.s[3];

  return ip0 + '.' + ip1 + '.' + ip2 + '.' + ip3;
}

function readMalayisaIP(input, next) {
  // http://www.nirsoft.net/countryip/my.html

  var remaining = '';

  input.on('data', function (data) {
    data = '' + data;
    var lines = data.split('\n');

    _.each(lines, function (line) {
      var range = line.split('-');
      var start = range[0].split('.').map(function (item) { return parseInt(item, 10); });
      var end   = range[1].split('.').map(function (item) { return parseInt(item, 10); });
      list.push({ s: start, e: end });
    });
  });

  input.on('end', function () {
    return next();
  });
}

function exec(code, ip) {
  console.log(new Date() + ' exec(' + code + ', ' + ip + ')');

  var content = '<?xml version="1.0" encoding="utf-8"?>' +
                '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
                '  <soap:Body>' +
                '    <Top5 xmlns="http://apps.ntv7.com.my/goldenawards/">' +
                '      <cat>male</cat>' +
                '      <con>M' + code + '</con>' +
                '      <ip>' + ip + '</ip>' +
                '    </Top5>' +
                '  </soap:Body>' +
                '</soap:Envelope>';

  var options = {
    url: 'http://apps.ntv7.com.my/goldenawards2014/Interface.asmx',
    method: 'POST',
    headers: {
      'Host': 'apps.ntv7.com.my',
      'Content-Type': 'text/xml; charset=utf-8',
      'Content-Length': content.length,
      'SOAPAction': '"http://apps.ntv7.com.my/goldenawards/Top5"'
    },
    body: content
  };

  request(options, function (error, response, body) {

    if (error || response.statusCode !== 200) {
      console.log('OOOPS ERROR: ' + error);
      var delay = Math.random() * 2000 + 1000;    // short delay 1sec - 3sec
      return setTimeout(function () { exec(getCode(), genIP()); }, delay);
    }

    var start = body.indexOf('<Top5Result>') + 12;
    var len = body.indexOf('</Top5Result>') - start;
    var count = body.substr(start, len);

    console.log(new Date() + ' ' + count);

    var delay = 0;
    if (count === '0') {
      delay = Math.random() * 2000 + 1000;    // short delay 1sec - 3sec
      code  = getCode();                      // new code
      ip    = genIP();                        // new ip
    } else {
      delay = Math.random() * 2000 + 1000;    // short delay 1sec - 3sec
    }

    setTimeout(function () { exec(code, ip); }, delay);
  });
}


// everything starts here
readMalayisaIP(input, function (list) {
  exec(getCode(), genIP());
});


