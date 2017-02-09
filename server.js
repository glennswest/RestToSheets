var cron = require('node-cron');
var changeCase = require('change-case');
var restify = require('restify');
var util = require('util');
var json2xls = require('json2xls');
var fs = require('fs');
var async = require('async');
var URL = "";
var _ = require('lodash');
var cc       = require('config-multipaas'),
    finalhandler= require('finalhandler'),
    http     = require("http"),
    Router       = require('router'),
    fs = require('fs'),
    serveStatic       = require("serve-static");

var config   = cc();
var app      = Router()

// Get the variables from the environment
var thedoc = process.env.SPREADSHEET_DOC;
var theauth = process.env.GOOGLE_AUTH;
var theurl  = process.env.RESTURL;
var thecron = process.env.RESTCRON;

var GoogleSpreadsheet = require('google-spreadsheet');

doc = new GoogleSpreadsheet(thedoc);
sheet = {};
//var creds = require('./google-generated-creds.json');
var creds = JSON.parse(theauth);

restdata = {};
updateneeded  = 0;
newxsize = 0;
newysize = 0;
xsize = 0;
ysize = 0;


cjc = {};
cjc['url'] = theurl;
cjc['rejectUnauthorized'] = false;
//var client = restify.createJsonClient({ url: 'https://pp.engineering.redhat.com/pp-admin/api/v1/releases/?fields=id%2Cshortname%2Cname%2Cga_date%2Cbu%2Cbu_shortname%2Cbu_name&format=json', rejectUnauthorized: false});

var client = restify.createJsonClient(cjc);


// Serve up public/ftp folder 
app.use(serveStatic('static'))

// Routes
app.get("/status", function (req, res) {
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end("{status: 'ok'}\n")
})

app.get("/", function (req, res) {
  var index = fs.readFileSync(__dirname + '/index.html')
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.end(index.toString())
})

// Create server 
var server = http.createServer(function(req, res){
  var done = finalhandler(req, res)
  app(req, res, done)
})

server.listen(config.get('PORT'), config.get('IP'), function () {
  console.log( "Listening on " + config.get('IP') + ", port " + config.get('PORT') )
});



function find_sheet(doc,name)
{
   worksheets = doc.worksheets;
   cnt = doc.worksheets.length;
   for (var i = 0; i < cnt; i++){
       item = worksheets[i];
       if (item.title == name) return item;
       }
   return({});
}


//{ updateValuesFromResponseData: [Function],
//    setValue: [Function],
//    _clearValue: [Function],
//    value: [Getter/Setter],
//    formula: [Getter/Setter],
//    numericValue: [Getter/Setter],
//    valueForSave: [Getter],
//    save: [Function],
//    del: [Function],
//    id: 'https://spreadsheets.google.com/feeds/cells/1UUpfeHLrl59rYUywu0RPJLTqw1LOW8jX7LLaSbI2VBc/od6/R390C2',
//    row: 390,
//    col: 2,
//    batchId: 'R390C2',
//    _links: 
//     [ self: 'https://spreadsheets.google.com/feeds/cells/1UUpfeHLrl59rYUywu0RPJLTqw1LOW8jX7LLaSbI2VBc/od6/private/full/R390C2',
//       edit: 'https://spreadsheets.google.com/feeds/cells/1UUpfeHLrl59rYUywu0RPJLTqw1LOW8jX7LLaSbI2VBc/od6/private/full/R390C2' ],
//    _formula: undefined,
//    _numericValue: undefined,
//    _value: '' },

function update_cell(cells,x,y,value)
{
    offset = x + (y * xsize);
    cells[offset].value = value;
}

function update_google_done()
{
console.log("update_google_done");
//console.log(util.inspect(arguments));
}

function update_google_cells(err,cells)
{
var d = new Date();
     
     console.log("Updating Google cell - " + util.inspect(d));
     //console.log("Xsize = " + xsize + "Ysize = " + ysize );
     //console.log("Err " + util.inspect(err));
     //console.log(util.inspect(restdata));
     //console.log(util.inspect(cells));
     // Fix up headers
     headings = Object.keys(restdata[0]);
     update_cell(cells,xsize - 1,0,util.inspect(d));
     cnt = headings.length;
     for (var i = 0; i < cnt; i++){
         colhead = changeCase.titleCase(headings[i])
         update_cell(cells,i,0,colhead);
         }
     x = 0;
     y = 0; 
     cnt = restdata.length;
     for (var i = 0; i < cnt; i++){
          item = restdata[i];
          y++;
          x = 0;
          for (var p in item){
             if (item.hasOwnProperty(p)){
                update_cell(cells,x++,y,item[p]);
                }
             }
         }
    sheet.bulkUpdateCells(cells,update_google_done);
}

function update_google_getdata()
{
    var cellctl = {};

    console.log("update_google_getdata");
    cellctl["min-row"] = 1;
    cellctl["max-row"] = ysize;
    cellctl["return-empty"] = true;
    //console.log(util.inspect(cellctl));
    sheet.getCells(cellctl,update_google_cells);
}

function update_google_sheet_size()
{

    console.log("update_google_sheet_size");
    xsize = newxsize + 2;
    ysize = newysize + 4;
    sheet.rowCount = ysize;
    sheet.colCount = xsize;
    sheet.resize({rowCount: ysize, colCount: xsize},update_google_getdata);
}
function google_info(err,info)
{
console.log("google_info");

//console.log(util.inspect(info));
sheet = find_sheet(info,'Sheet1');
//console.log(util.inspect(sheet));
if (newxsize != sheet.rowCount) update_needed = 1;
if (newysize != sheet.colCount) update_needed = 1;

if (update_needed == 1){
   console.log("Update Google Is Needed");
   update_google_sheet_size();
   }
}
function updatedata()
{
//console.log(util.inspect(arguments));
console.log("Update Data");
doc.getInfo(google_info);
}


function do_google(){
	console.log("Set Auth");
        doc.useServiceAccountAuth(creds, updatedata);
}

function update_rest_data(){

	client.get(URL,
         	   function(err, req, res, obj){
        	       //console.log(util.inspect(err));
                       newxsize = _.size(obj[1]);
                       newysize = obj.length;
                       //console.log("Length = " + newysize);
                       //console.log("Width = " +  newxsize);
                       updated_needed = 0;
                       if (newxsize != xsize) update_needed = 1;
                       if (newysize != ysize) update_needed = 1;
                       restdata = obj;
                       console.log("Data captured");
                       do_google();
                       } );
}

// thecron = '0 * * * *' = every hour
// thecron = '* * * * *' = every minute
cron.schedule(thecron,update_rest_data);

