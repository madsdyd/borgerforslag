
function updateData(chart) {
    chart.flow({
	columns: [
	    ['x', '2018-02-04T12:00:00' ],
	    ['Støtter', 10000]
	],
	length: 0
    });
    updatePage();
}
    
// Returns a data object with the last date in "Støtter"
function getCutoff() {
    // Get the latest date from the chart data1 series, and fetch from that point
    /* This is formatted like this:
    
    cutoff: [ {"id":"Støtter",
	       "id_org":"Støtter",
	       "values":[ {"x":"2018-02-01T14:09:59.000Z",
			   "value":650,
			   "id":"Støtter",
			   "index":0},
			  {"x":"2018-02-01T14:14:59.000Z",
			   "value":692,
			   "id":"Støtter",
			   "index":1},
			  ....
     */
    dataArray = chart.data('Støtter')[0].values;
    if ( dataArray.length > 0 ) {
	cutoff = dataArray[dataArray.length-1].x;
    } else {
	// Before the first borgerforslag... 
	cutoff = new Date ( 2018, 01, 01, 12, 0, 0, 0 );
    }
    return cutoff;
}


// Can we make XMLHttpRequest?
function getNewData() {
    getNewDataCutoff(getCutoff());
}

// cutoff is a Date object.
function getNewDataCutoff(cutoff) {
    var xmlhttp = new XMLHttpRequest();
    var url = "data.php?cutoff=" + encodeURI(cutoff.toISOString());

    xmlhttp.onreadystatechange = function() {
	if (this.readyState == 4 && this.status == 200) {
	    var myArr = JSON.parse(this.responseText);
	    gotTheNewData(myArr);
	}
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

/* Function called when we get new data. The array contains information in this format:
[ {"0":"FT-00005",
   "1":"2018-02-03 11:20:55",
   "2":39093,
   "name":"FT-00005",
   "reg_time":"2018-02-03T11:20:55+01:00",
   "count":39093},
  {"0":"FT-00005",
   "1":"2018-02-03 11:22:56",
   "2":39101,
   "name":"FT-00005",
   "reg_time":"2018-02-03T11:22:56+01:00",
   "count":39101},
 That is, an array with new data points to add..
  */
function gotTheNewData(arr) {
    // alert("Got this: " + JSON.stringify(arr));

    // Convert all reg_time to Date objects
    arr.forEach( e => e.reg_time = new Date(e.reg_time) );

    // Get rid of all other than FT-00124
    arr = arr.filter( e => e.name === "FT-00124" );

    // Filter out all that are younger than our cutoff (we are async ftw)
    // (But not racecondition proof. If you click too may times... hmm).
    cutoff = getCutoff();
    // alert("cutoff is" + cutoff + ", " + cutoff.getTime());
    arr = arr.filter( e => e.reg_time.getTime() > cutoff.getTime() );

    // Add all the data to the chart "Støtter" dataseries.
    x = [ 'x' ];
    stoetter = [ 'Støtter' ];
    columns = [ x, stoetter ];
    arr.forEach( e => { x.push(e.reg_time) ; stoetter.push(e.count); } );

    // alert("Columns are : " + JSON.stringify(columns, null, 2));
    
    // Flow it.
    chart.flow({
	columns: columns,
	length: 0
    });

    // Make sure the page is update
    updatePage();
}

////////////////////////////////////////////////////////////////////////////////
// Functions to update the page when new data has been registered in the chart.

// Value is between 0 and 100%
function updateGauge(value) {
    gauge.load({columns:[['data', value]]});
}


// This function should be called when new data arrives.
function updatePage() {
    // Get the chart data - we are going to use that for our updates.
    /* Format something like this.
    cutoff: [ {"id":"Støtter",
	       "id_org":"Støtter",
	       "values":[ {"x":"2018-02-01T14:09:59.000Z",
			   "value":650,
			   "id":"Støtter",
			   "index":0},
			  {"x":"2018-02-01T14:14:59.000Z",
			   "value":692,
			   "id":"Støtter",
			   "index":1},
			  ....
     */
    dataArray = chart.data('Støtter')[0].values;

    // Calculate the stuff for the gauge and update it
    if ( dataArray.length > 0 ) {
	// We always need 50000 supporters
	completion = dataArray[dataArray.length-1].value/50000*100;
    } else {
	completion = 0;
    }
    if (completion > 100.0) {
	completion = 100.0;
    }
    updateGauge(completion);
    
    
    // ISSUE: Adding a lot of data, screws up the ticks... 
    // TODO: Update chart with vertical lines
    // TODO: Update other stuff?


}

