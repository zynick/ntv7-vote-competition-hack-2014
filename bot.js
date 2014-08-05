'use strict';
/* jshint node: true */

var request = require('request');

// http://apps.ntv7.com.my/goldenawards2014/Interface.asmx

function genIP() {
  return (Math.random() * 255).toFixed(0) + '.' +
         (Math.random() * 255).toFixed(0) + '.' +
         (Math.random() * 255).toFixed(0) + '.' +
         (Math.random() * 255).toFixed(0);
}

function exec(ip) {
  console.log('exec(' + ip + ')');

  var content = '<?xml version="1.0" encoding="utf-8"?>' +
                '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
                '  <soap:Body>' +
                '    <Top5 xmlns="http://apps.ntv7.com.my/goldenawards/">' +
                '      <cat>male</cat>' +
                '      <con>M8</con>' +
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
      return exec(genIP());
    }

    var start = body.indexOf('<Top5Result>') + 12;
    var len   = body.indexOf('</Top5Result>') - start;
    var count = body.substr(start, len);

    console.log(count);

    exec(count === '0' ? genIP() : ip);
  });
}

exec(genIP());