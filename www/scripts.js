// Test function.
function updateData(chart) {
    chart.flow({
	columns: [
	    ['x', '2018-02-04T12:00:00' ],
	    ['Støtter', 10000]
	],
	length: 0
    });
}
    

// Can we make XMLHttpRequest?
function getNewData() {
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
    // alert("cutoff: " + JSON.stringify(cutoff));
    getNewDataCutoff(cutoff);
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


function gotTheNewData(arr) {
    alert("Got this: " + JSON.stringify(arr));
}
