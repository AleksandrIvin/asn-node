// set ODOO_SSL_LIB=no && node app.js

const ODOO_SSL_LIB = 'odoo_ssl';
const ODOO_LIB = 'odoo';

var express = require('express');
var https = require('https');
var http = require('http');
var app = express();
var fs = require('fs');

var Odoo, odooHost, odooPort, odooDatabase, odooUsername, odooPassword, shipmentStates;

if (process.env.ODOO_SSL.trim() === 'yes') {
    Odoo = require(ODOO_SSL_LIB);
} else {
    Odoo = require(ODOO_LIB);
}

var serverTitle = process.env.SERVER_TITLE.trim();
odooHost = process.env.ODOO_HOST.trim();
odooPort = process.env.ODOO_PORT.trim();
odooDatabase = process.env.ODOO_DB.trim();
odooUsername = process.env.ODOO_USERNAME.trim();
odooPassword = process.env.ODOO_PASSWORD.trim();
shipmentStates = ['draft', 'packed', 'shipped'];

console.log(odooUsername + '@' + odooHost + ':' + odooPort + ':' + odooDatabase);
console.log(odooHost, odooPort, odooDatabase);

var odoo = new Odoo({
    host: odooHost,
    port: odooPort,
    database: odooDatabase,
    username: odooUsername,
    password: odooPassword
});

app.set('view engine', 'jade');

// allow self signed certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

app.get('/odoo/get-shipment-list', function (req, res) {
    // Connect to Odoo
    odoo.connect(function (err) {
        if (err) {
            return console.log(err);
        }

        // Get a partner
        odoo.search_read('amazon_docs.shipment', {
            domain: [['state', 'in', shipmentStates]],
            fields: ['id', 'name_rec'],
            limit: 100
        }, function (err, shipment) {
            if (err) {
                return console.log(err);
            }

            console.log('Shipments', shipment);
            res.send(JSON.stringify(shipment));
        });
    });

    //res.send('ok');
    return;
});

app.param('id', function (req, res, next, id) {
    console.log('id param: ', id);
    next();
});

app.post('/odoo/set-odoo-shipment-asn/:id/:asn', function (req, res) {
    console.log('odoo/set-odoo-shipment-asn/:id/:asn', req.params.id, req.params.asn);
    //Connect to Odoo
    odoo.connect(function (err) {
        if (err) {
            return console.log(err);
        }
        // Set ASN
        odoo.update('amazon_docs.shipment', parseInt(req.params.id), {'asn': req.params.asn},
            function (err, shipment) {
                if (err) {
                    return console.log(err);
            }
            console.log('Shipment: ', shipment);
            res.send(JSON.stringify({'asn': req.params.asn}));
        });
    });
});

app.get('/odoo/get-shipment/:id', function (req, res) {
    console.log('odoo/get-shipment/:id', req.params.id); //, app.getParameter(id)
    //Connect to Odoo
    odoo.connect(function (err) {
        if (err) {
            return console.log(err);
        }

        // Get a partner
        odoo.get('amazon_docs.shipment', {
            ids: [parseInt(req.params.id)],
            fields: ['id', 'name_rec', 'name',
                    'state', 'po_unique', 'total_packages',
                    'track_no', 'total_pallets']
        }, function (err, shipment) {
            if (err) {
                return console.log(err);
            }

            console.log('Shipment: ', shipment);
            res.send(JSON.stringify(shipment));
        });
    });

    //res.send('ok');

});

app.get('/odoo/get-shipment-asn/:id', function (req, res) {
    console.log('odoo/get-shipment-asn/:id', req.params.id); //, app.getParameter(id)
    //Connect to Odoo
    odoo.connect(function (err) {
        if (err) {
            return console.log(err);
        }

        // Generic RPC call
        // Note that, unlike the other methods, the context is not automatically included
        var endpoint = '/web/dataset/call_kw';
        var model = 'amazon_docs.shipment';
        var method = 'get_asn_lines';

        var args = [
            [parseInt(req.params.id)],
            {
                tz: odoo.context.tz,
                uid: odoo.context.uid
            }
        ];//args

        var params = {
            model: model,
            method: method,
            args: args,
            kwargs: {}
        };//params

        // View Delivery Order
        odoo.rpc_call(endpoint, params, function (err, result) {
            if (err) {
                console.log(err);
                return;
            }

            var shipment_asn = result;

            console.log(shipment_asn);
            res.send(JSON.stringify(shipment_asn));
        });//odoo.rpc_call

    });

});

app.get('/odoo/get-shipment-asn-distinct-cartons/:id', function (req, res) {
    console.log('odoo/get-shipment-asn-distinct-cartons/:id', req.params.id); //, app.getParameter(id)
    //Connect to Odoo
    odoo.connect(function (err) {
        if (err) {
            return console.log(err);
        }

        // Generic RPC call
        // Note that, unlike the other methods, the context is not automatically included
        var endpoint = '/web/dataset/call_kw';
        var model = 'amazon_docs.shipment';
        var method = 'get_asn_po_distinct_cartons';

        var args = [
            [parseInt(req.params.id)],
            {
                tz: odoo.context.tz,
                uid: odoo.context.uid
            }
        ];//args

        var params = {
            model: model,
            method: method,
            args: args,
            kwargs: {}
        };//params

        // View Delivery Order
        odoo.rpc_call(endpoint, params, function (err, result) {
            if (err) {
                console.log(err);
                return;
            }

            console.log(result);
            res.send(JSON.stringify(result));
        });//odoo.rpc_call

    });

});



// Test page
app.get('/', function (req, res) {
    res.render('index', {title: 'Localhost NodeJs Test', header: 'NodeJs Test Passed!', serverTitle: serverTitle});
});

app.get('/about-me/', function (req, res) {
    res.send({"serverTitle": serverTitle});
});

// Start server on 3000
http.createServer(app).listen(3000, function () {
    console.log('Example app listening on port 3000!');
});

// Start server on 443
var options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};
https.createServer(options, app).listen(443, function () {
    console.log('Example app listening on port 443!');
});

// DEVELOPER
var appDev = require('./app_dev');
appDev.add_routes(app);
