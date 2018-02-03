var chart = c3.generate({
    bindto: '#chart',
    legend: {
        hide: true
                //or hide: 'data1'
                //or hide: ['data1', 'data2']
                },

            zoom : {
        enabled: true,
                rescale : true
                
                },
            point : {
        r : 1.5,
                focus : {
            expand : {
                r : 5

                        }
            }

        },
            subchart: {
        show: false
                },

            grid: {
        y: {
            show:true
                    },
                x: {
            show:false,
                    lines: [                            ]
   
                    }
        },
            data: 

    {"columns":[["x","2018-02-01T15:09:59"],
		["Støtter","650" ]
	       ],
     "xFormat":"%Y-%m-%dT%H:%M:%S",
     "x":"x"}

        ,
            axis: {
        x: {
            type: 'timeseries',
                    tick: {
                format: '%d %H:%M'
                        }
            }
        }
    });


var gauge = c3.generate({
    bindto: '#gauge',
            data: {
        columns: [
                  ['data', 0]
                  ],
                type: 'gauge'
                },
            gauge: {
            //        label: {
            //            format: function(value, ratio) {
            //                return value;
            //            },
            //            show: false // to turn off the min/max labels.
            //        },
            //    min: 0, // 0 is default, //can handle negative min e.g. vacuum / voltage / current flow / rate of change
            //    max: 100, // 100 is default
            //    units: ' %',
            //    width: 39 // for adjusting arc thickness
        },
            color: {
        pattern: ['#FF0000', '#F97600', '#F6C600', '#60B044'], // the three color levels for the percentage values.
                threshold: {
                //            unit: 'value', // percentage is default
                //            max: 200, // 100 is default
            values: [30, 60, 90, 100]
                    }
        },
            size: {
        height: 150
                }
    });
