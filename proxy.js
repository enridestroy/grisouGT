var http = require( 'http' );
var url = require( 'url' );
var fs = require('fs');
var qs = require('querystring');

var listen_port = 91;
var headers = {'Accept' : 'text/turtle,text/n3,application/ld+json,application/json,application/rdf+xml' };

http.createServer(onRequest).listen(listen_port);

function onRequest( request, response ) {
  var url_partsA = url.parse( request.url, true );
  console.log(url_partsA.pathname);
  var request_data = "";

  switch(url_partsA.pathname) {
    case '/':
    case '/index.html':
      response.write(fs.readFileSync(__dirname + '/public/index.html'), request.headers);
      response.end();
      break;
    case '/favicon.ico':
      break;
    case '/rdfxml_parser.js':
    case '/rdfstore.mini.js':
    case '/inf8884.js':
    case '/rdfstore.js':
    case '/jqwidgets/jqxcore.js':
    case '/jqwidgets/jqxdata.js':
    case '/jqwidgets/jqxbuttons.js':
    case '/jqwidgets/jqxscrollbar.js':
    case '/jqwidgets/jqxlistbox.js':
    case '/jqwidgets/jqxtabs.js':
      response.setHeader('content-type', 'application/javascript');
      response.write(fs.readFileSync(__dirname + '/public' + url_partsA.pathname));
      response.end();
      break;
    case '/rdf.css':
    case '/jqwidgets/styles/jqx.base.css':
      response.setHeader('content-type', 'text/css');
      response.write(fs.readFileSync(__dirname + '/public' + url_partsA.pathname));
      response.end();
      break;
    case '/customers.json':
    case '/query.json':
      response.setHeader('content-type', 'application/json');
      response.write(fs.readFileSync(__dirname + '/public' + url_partsA.pathname));
      response.end();
      break;
    case '/jqwidgets/styles/images/icon-left.png':
    case '/jqwidgets/styles/images/icon-right.png':
    case '/jqwidgets/styles/images/icon-up.png':
    case '/jqwidgets/styles/images/icon-down.png':
    case '/jqwidgets/styles/images/close.png':
      response.setHeader('content-type', 'image/png');
      response.write(fs.readFileSync(__dirname + '/public' + url_partsA.pathname));
      response.end();
      break;
    case '/loading.gif':
      response.setHeader('content-type', 'image/gif');
      response.write(fs.readFileSync(__dirname + '/public' + url_partsA.pathname));
      response.end();
      break;
    case '/proxy':
      var options;
      var qData;
      var url_parts;

      qData = url.parse(request.url, true).query;
      url_parts = url.parse( qData.url );
      var s = url_parts.path;

      if (qData.data) {
		s = new Buffer(qData.data, 'base64').toString('binary');//on recupere l'url originale, equivalent a atob dans le browser
		s = url_parts.path + s;
		headers = {
			'Accept' : "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
			//optionel mais plus propre ^^
			'User-Agent' : 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1930.0 Safari/537.36',
			'X-Requested-With' : 'XMLHttpRequest'
		};

		//s += '&query='+encodeURIComponent(qData.data)+'%0D%0A%0D%0A';
		//s+=qData.data;
		//s = s.replace(/%20/g, '+');

		console.log("s:"+s);


        //s += '?query='+encodeURIComponent(qData.data.substr(1,qData.data.length-2));
        //s = '/sparql/?query=PREFIX%20id%3A%20%3Chttp%3A%2F%2Fdblp.rkbexplorer.com%2Fid%2F%3E%20PREFIX%20rdf%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%3E%20PREFIX%20rdfs%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%20PREFIX%20akt%3A%20%3Chttp%3A%2F%2Fwww.akto!%20rs.org%2%20Fontology%2Fportal%23%3E%20PREFIX%20owl%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F2002%2F07%2Fowl%23%3E%20PREFIX%20akt%3A%20%3Chttp%3A%2F%2Fwww.aktors.org%2Fontology%2Fportal%23%3E%20PREFIX%20akts%3A%20%3Chttp%3A%2F%2Fwww.aktors.org%2Fontology%2Fsupport%23%3E%20SELECT%20*%20WHERE%20%7B%20%3Fs%20rdfs%3Alabel%20%3Fo%20%7D%20LIMIT%2010%20&format=json'
        //console.log(s);
        //headers['Content-Type'] = 'application/x-www-form-urlencoded';
        //headers['Accept']= 'text,application/xhtml+xml';
        //headers['Connection']='keep-alive';
        /*
        switch(url_parts.host){
          case 'dblp.rkbexplorer.com':
            s+=s = '?query=query=PREFIX+rdf%3A++<http%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23>%0D%0APREFIX+rdfs%3A+<http%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23>%0D%0APREFIX+akt%3A++<http%3A%2F%2Fwww.aktors.org%2Fontology%2Fportal%23>%0D%0APREFIX+owl%3A++<http%3A%2F%2Fwww.w3.org%2F2002%2F07%2Fowl%23>%0D%0APREFIX+akts%3A+<http%3A%2F%2Fwww.aktors.org%2Fontology%2Fsupport%23>%0D%0APREFIX+foaf%3A+<http%3A%2F%2Fxmlns.com%2Ffoaf%2F0.1%2F>%0D%0ASELECT+*+WHERE+%7B+%3Fs+akt%3Afull-name+%3Fo+.+%0D%0A+%3Fb+akt%3Ahas-author+%3Fs+.+%0D%0A++++%3Fb+akt%3Ahas-title+%3Ft+.+%0D%0A++++%3Fb+akt%3Ahas-date+%3Fd+.+%0D%0A++++%3Fd+akts%3Ayear-of+%3Fy+%0D%0A+FILTER+%28%3Fo+%3D+%27Petko+Valtchev%27+%7C%7C+%3Fo+%3D+%27Jean+Privat%27+%7C%7C+%3Fo+%3D+%27Guy+Tremblay%27+%7C%7C+%3Fo+%3D+%27Aziz+Salah%27%29%0D%0A+%7D%0D%0A+%0D%0A%0D%0A%20LIMIT%20100';
            s+='&format=json';
            break;
          case 'dblp.l3s.de':
            s+='?query=PREFIX+d2r%3A+<http%3A%2F%2Fsites.wiwiss.fu-berlin.de%2Fsuhl%2Fbizer%2Fd2r-server%2Fconfig.rdf%23>%0D%0APREFIX+swrc%3A+<http%3A%2F%2Fswrc.ontoware.org%2Fontology%23>%0D%0APREFIX+dcterms%3A+<http%3A%2F%2Fpurl.org%2Fdc%2Fterms%2F>%0D%0APREFIX+xsd%3A+<http%3A%2F%2Fwww.w3.org%2F2001%2FXMLSchema%23>%0D%0APREFIX+dc%3A+<http%3A%2F%2Fpurl.org%2Fdc%2Felements%2F1.1%2F>%0D%0APREFIX+map%3A+<file%3A%2F%2F%2Fhome%2Fdiederich%2Fd2r-server-0.3.2%2Fdblp-mapping.n3%23>%0D%0APREFIX+rdfs%3A+<http%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23>%0D%0APREFIX+foaf%3A+<http%3A%2F%2Fxmlns.com%2Ffoaf%2F0.1%2F>%0D%0APREFIX+rdf%3A+<http%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23>%0D%0APREFIX+owl%3A+<http%3A%2F%2Fwww.w3.org%2F2002%2F07%2Fowl%23>%0D%0ASELECT+*+WHERE+%7B+%3Fs+foaf%3Aname+%3Fo+.+%3Fn+dc%3Atitle+%3Fv++FILTER+%28%3Fo+%3D+%27Petko+Valtchev%27+%7C%7C+%3Fo+%3D+%27Aziz+Salah%27%29%7D%0D%0ALIMIT+100';
            s+='&output=json';
            break;
        }*/

      } else {

        var r = new RegExp("/resource/");
        //console.log(url_parts.host + ' '+ r.test(s));
        if (r.test(s)){
          switch(url_parts.host){
          case 'dbpedia.org':
            s=s.replace("resource","data");
            s+=".n3";
            break;
          case 'dblp.l3s.de':
            s=s.replace("resource","data");
            break;
          }
        }
      }

      options = {
        hostname        : url_parts.host,
        port            : 80,
        path            : s,
        method          : request.method,
        headers         : headers
      };

      console.log(options);
      var proxy = http.request( options, function( res ){
        response.writeHead( res.statusCode, res.headers );
        res.pipe(response, { end: true });
      });

      request.pipe(proxy, {end: true });

        /*
        var body = "";
        res.on( 'data', function ( chunk ) {
          console.log( 'Write to client **********', chunk.length );
          body += chunk;
          //response.write( chunk, 'binary' );
        } );

        res.on( 'end', function() {
          console.log( 'End chunk write to client' );
          response.writeHead( res.statusCode, res.headers );
          response.end(body);
        } );

        res.on( 'error', function ( e ) {
          console.log( 'Error with client ', e );
        } );
      } );
      */
      proxy.on('connect', function(res, socket, head) {
        console.log(res.headers);
        console.log(head);
      });

      proxy.on('error', function(e) {
        console.log( 'Error with proxy ', e );
      } );

      request.on( 'data', function ( chunk ) {
        console.log( 'Client request send data: ', chunk.length );
        console.log( chunk.toString( 'utf8' ) );
        request_data = request_data + chunk;
        //proxy_client.write( chunk, 'binary' );
      } );

      request.on( 'end', function() {
        console.log( 'End of client request');
        proxy.end();
      } );

      request.on( 'error', function ( e ) {
        console.log( 'Problem with client request ', e );
      } );

    break;
    default:
      response.write('Unknown path: ' + JSON.stringify(url_partsA));
  }
}

console.log( 'Proxy started on port ' + listen_port );
