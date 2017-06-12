/**
 * Created by Aleksandr on 12.06.2017.
 */

var appDev = {};

appDev.add_routes = function(app) {
    app.get('/json', function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify([
            {
                order: '6UG27VAP',
                items: [
                    {
                        ean: '0028178890988',
                        packages: {
                            1: 6,
                            2: 6
                        }
                    }
                ]
            },
            {
                order: '12OMZTTN',
                items: [
                    {
                        ean: '0028178890988',
                        packages: {
                            3: 6,
                            4: 6
                        }
                    },
                    {
                        ean: '0028178020514',
                        packages: {
                            5: 30,
                            6: 3
                        }
                    },
                ]
            },
            {
                order: '5BQ8PWFM',
                items: [
                    {
                        ean: '0028178890988',
                        packages: {
                            7: 5
                        }
                    }
                ]
            },
            {
                order: '2P84LVPT',
                items: [
                    {
                        ean: '0028178890988',
                        packages: {
                            8: 6,
                            9: 6
                        }
                    }
                ]
            }
        ]));
    });
};

module.exports = appDev;
