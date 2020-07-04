const database = require('./database');

let methods = {
    buildTable: function(session, res) {
        database.connect().then(async yeet => {
            let troops;
            if (session === '10')
                troops = await database.getAllTroops();
            else
                troops = await database.getTroopsBySession(session);
            let header = '<style>\n' +
                '        table {\n' +
                '            font-family: arial, sans-serif;\n' +
                '            border-collapse: collapse;\n' +
                '            width: 100%;\n' +
                '        }\n' +
                '\n' +
                '        th {\n' +
                '            cursor: pointer;\n' +
                '        }\n' +
                '\n' +
                '        th, td {\n' +
                '            text-align: left;\n' +
                '            padding: 16px;\n' +
                '        }\n' +
                '\n' +
                '        tr:nth-child(even) {\n' +
                '            background-color: #dddddd;\n' +
                '        }\n' +
                '    </style>';
            let body;
            body = '<table id="adddrop"><tbody><tr>' +
                '<th onClick="sortTable(0)">Troop Number</th>' +
                '<th onClick="sortTable(1)">Troop Guide</th>' +
                '<th onClick="sortTable(2)">Points</th>' +
                '</tr>';
            for(let i = 0; i < troops.length; i++) {

                body += '<tr id="' + troops[i]._id + '_row">' + '<td>' + troops[i].troop_number + '</td>' +
                    '<td>' + troops[i].troop_guide + '</td>' +
                    '<td>' + troops[i].points + '</td></tr>';
            }
            body += '</tbody></table>';
            res.set('Access-Control-Allow-Origin','http://localhost:63342');
            res.send('<!DOCTYPE html><html><head>' + header + '</head><body>' + body + '</body></html>');
        });
    },
};
exports.data = methods;