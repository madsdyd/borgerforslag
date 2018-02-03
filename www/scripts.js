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
    var xmlhttp = new XMLHttpRequest();
    var url = "data.php";

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
