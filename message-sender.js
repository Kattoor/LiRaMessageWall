const http = require('http');
const https = require('https');

setInterval(() => {
    https.get('https://talaikis.com/api/quotes/random/', res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => send(JSON.parse(data).quote));
    });
}, 5000);

function send(data) {
    var optionspost = {
        host: 'localhost',
        port: 8080,
        path: '/',
        method: 'POST'
    };

    var reqPost = http.request(optionspost, function (res) {

        res.on('data', function (d) {
            console.info('POST result:\n');
            process.stdout.write(d);
            console.info('\n\nPOST completed');
        });
    });

    reqPost.write(data);
    reqPost.end();
    reqPost.on('error', function (e) {
        console.error(e);
    });
}
