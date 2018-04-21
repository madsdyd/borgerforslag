// Scripts for tracking data in borgerforslag
var bf = function() {
    var res = {};

    // This is where we store the raw data received from the server.
    // The data is assumed to have two elements, reg_time and count;
    res.data = [];

    // This is where we store the data that should be added to the chart.
    res.newChartData = [];
    

    /** Add some data from the server. 
     * The source format contains three datapoints, the name, reg_time and count.
     * Convert to javascript data types, then add to our list */
    res.addDataFromServer = function(arr) {
	// Convert all reg_time to Date objects
	arr.forEach( e => e.reg_time = new Date(e.reg_time) );

	// Filter out all that are younger than our cutoff (we are async ftw)
	// (But not racecondition proof. If you click too may times... hmm).
	cutoff = this.getLastRegTime();
	arr = arr.filter( e => e.reg_time.getTime() > cutoff.getTime() );

	// Finally, add all data that meet our criteria to the "newChartData" array
	// TODO : Do some nifty thing here.
	arr.forEach( e => this.newChartData.push(e) );
    }

    /** Get the last element. 
     * If no elements, return undefined */
    res.getLastElement = function() {
	if (this.data.length > 0) {
	    return this.data[this.data.length-1];
	} else {
	    return undefined;
	}
    }
    
    res.getLastRegTime = function() {
	var lastData = this.getLastElement();
	if ( ! lastData ) {
	    // Before the first borgerforslag... 
	    return new Date ( 2018, 01, 01, 12, 0, 0, 0 );
	} else {
	    return lastData.reg_time;
	}
    }


    return res;
}();




// Returns a data object with the last date in "Støtter"
// Hack upon hack in here.
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
    if ( getCutoff.nextCutoff ) {
	return getCutoff.nextCutoff;
    }

    // We start the chart with a single value, otherwise the chart software is weird
    // We therefore ignore the first value...
    if (chart.data('Støtter').length > 0 && chart.data('Støtter')[0].values.length > 1) {
	dataArray = chart.data('Støtter')[0].values;
	cutoff = dataArray[dataArray.length-1].x;
    } else {
	// Before the first borgerforslag... 
	// cutoff = new Date ( 2018, 01, 01, 12, 0, 0, 0 );
	// Show only the last week, initially
	cutoff = new Date();
	cutoff.setDate(cutoff.getDate() - 7);
    }
    return cutoff;
}

getCutoff.nextCutoff = undefined;


function getLastValue() {
    if (chart.data('Støtter').length > 0 ) {
	dataArray = chart.data('Støtter')[0].values;
	value = dataArray[dataArray.length-1].value;
    } else {
	// Before the first borgerforslag... 
	value = -1;
    }
    return value;
}



// Create a spinner on load, and display it
var spinner = new Spinner({
    lines: 8, // The number of lines to draw
    length: 4, // The length of each line
    width: 5, // The line thickness
    radius: 6, // The radius of the inner circle
    color: '#000', // #rbg or #rrggbb
    speed: 1, // Rounds per second
    trail: 100, // Afterglow percentage
    shadow: true // Whether to render a shadow
}).spin(document.getElementById("spinner")); 

function onLoad() {
    document.getElementById('autoupdate').checked = true;
    getNewData();
}

// Get new data, if auto update enabled
function onAutoUpdate() {
    if ( document.getElementById('autoupdate').checked ) {
	// alert('Getting data');
	getNewData();
    } else {
	// alert('Not getting data');
    }
}

// Install a handler, every 5 minute
window.setInterval(function() {
    onAutoUpdate();
}, 5*60*1000 );


// cutoff is a Date object.
function getNewDataCutoff(cutoff) {
    spinner.spin();
    setStatus("Fetching data newer than " + cutoff);
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
    setStatus("Got new data, converting from json to js.");

    // Get rid of all other than FT-00124
    // Should not really contain any though.
    arr = arr.filter( e => e.name === "FT-00124" );

    // Convert all reg_time to Date objects
    arr.forEach( e => e.reg_time = new Date(e.reg_time) );

    // Filter out all that are younger than our cutoff (we are async ftw)
    // (But not racecondition proof. If you click too may times... hmm).
    var cutoff = getCutoff();
    // alert("cutoff is" + cutoff + ", " + cutoff.getTime());
    arr = arr.filter( e => e.reg_time.getTime() > cutoff.getTime() );

    // Add all the data to the chart "Støtter" dataseries.
    var x = [ 'x' ];
    var stoetter = [ 'Støtter' ];
    var columns = [ x, stoetter ];
    arr.forEach( e => { x.push(e.reg_time) ; stoetter.push(e.count); } );

    // alert("Columns are : " + JSON.stringify(columns, null, 2));

    setStatus("Got new data, loading data into graph");
    
    // We have to update the xgrids before floating the values.
    updateXGrids(x);

    
    // Flow it.
    // Note, first load, we load (set) it, otherwise we flow (append).
    if (gotTheNewData.clearNextTime) {
	chart.load({
	    columns: columns,
	    length: 0
	});
	gotTheNewData.clearNextTime = false;
    } else {
	chart.flow({
	    columns: columns,
	    length: 0
	});
    }

    // Reset nextCutoff, if it was set earlier
    getCutoff.nextCutoff = undefined;

    // Make sure the page is updated
    // Note, that the chart can still be rendering when this is called.
    // There is no event to check this. Sadly.
    updatePage();

    // Hide the spinner
    // document.getElementById("spinner").;
    spinner.stop();
}

// Hackish..
gotTheNewData.clearNextTime = true;

////////////////////////////////////////////////////////////////////////////////
// Functions to update the page when new data has been registered in the chart.

////////////////////////////////////////////////////////////////////////////////
// The gauge
// Value is between 0 and 100%
function updateGauge(dataArray) {
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
    gauge.load({columns:[['data', completion]]});
}

////////////////////////////////////////////////////////////////////////////////
// Global variable tracks xgrids, and gets updated based on new data.
xgrids = [{value: new Date("2018-02-01T12:00:00"), text: '12:00'}];
// Argument is array of date values.
function updateXGrids(values) {
    // Find the last existing value
    curMax = xgrids[xgrids.length - 1].value;
    // First element is "x"
    for (var i = 1; i < values.length; ++i) {
	while ( values[i].getTime() > curMax.getTime() ) {
	    // Add a new, 6 hours in the future
	    var nextDate = new Date(curMax);
	    nextDate.setTime(curMax.getTime() + (6*60*60*1000));
	    xgrids.push( { value: nextDate, text: nextDate.getHours() + ":00" } );
	    curMax =  nextDate;
	}
    }
    // alert( "Got this: " + JSON.stringify(xgrids) );
    chart.xgrids(xgrids);
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
    updateGauge(dataArray);
    updateStatus();
    // ISSUE: Adding a lot of data, screws up the ticks sometimes.
}







////////////////////////////////////////////////////////////////////////////////
// INTERFACE FEEDBACK
// "Low level" set status function
function setStatus(text) {
    document.getElementById("status").innerHTML = text;
}

////////////////////////////////////////////////////////////////////////////////
// The status label is updated with data here.
function updateStatus() {
    var rd = getCutoff();
    var value = getLastValue();
    var d = new Date();
    var ts = d.getHours() + ":" + (d.getMinutes()<10?'0':'') + d.getMinutes() + ":" + (d.getSeconds()<10?'0':'') + d.getSeconds();
    var rts = rd.getHours() + ":" + (rd.getMinutes()<10?'0':'') + rd.getMinutes() + ":" + (rd.getSeconds()<10?'0':'') + rd.getSeconds();
    setStatus("Last update at " + ts + ". Last value is " + value + ", retrieved at " + rts + ".");
}



////////////////////////////////////////////////////////////////////////////////
// BUTTON HANDLERS
// Can we make XMLHttpRequest?
function getNewData() {
    getNewDataCutoff(getCutoff());
}

// This is for Lena
// All is a hack.
function getAllData() {
    gotTheNewData.clearNextTime = true;
    getCutoff.nextCutoff = new Date ( 2018, 01, 01, 12, 0, 0, 0 );
    getNewDataCutoff(getCutoff());
    // Reset of nextCutoff goes into async handler...
}



