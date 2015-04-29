var automationMetrics = (function () {

    var configMap = {
            main_html:
	        '<div class="application-container">'
                + '<div class=chart-container>'
	            + '<h2>Test Case Execution Times (seconds)</h2>'
		    + '<select id="testSelector"></select>'
		    + '<canvas id="executionTimeChart"></canvas>'
	         +'</div>'
                + '<table id="statusTable"></table>'
	      + '</div>',
            server: 'http://'+ location.host
        },
        initModules, displayChart, getTestCaseData, getTests, formatDate;

    initModule = function($container) {
        var selector; 

        $container.html(configMap.main_html);
        getTests($container.find('#testSelector'), getTestCaseData);

        selector = $container.find('#testSelector');
        selector.on('change', getTestCaseData);
    }

    getTestCaseData = function() {
        var client = new HttpClient();
        var testcaseName;

        testcaseName = $('#testSelector :selected').text();

        client.get(configMap.server + '/api/getfile?files='+testcaseName, function(results) {
            var data = JSON.parse(results);
            var times = [];
            var timestamps = [];
            var statuses = [];
            var x, row;

            for(x=0; x<data.length; x++) {
                row = data[x];
                times.push(row.execution_time);
                timestamps.push(formatDate(row.date));
                statuses.push(row.status);
            }
            displayChart('#executionTimeChart', timestamps, times, statuses);
        });
    }

    displayChart = function(elementId, labels, values, statuses) {
        var chartElement = $(elementId)[0].getContext("2d");
        var lineChart, data, x, color, options;

        options = {
            pointDotRadius: 6,
            pointHitDetectionRadius: 0
        }
        //Chart.defaults.global.tooltipTemplate = "<%= value %>";
        Chart.defaults.global.showTooltips = false;

        data = {
        labels: labels,
        datasets: [
                  {
                    label: "testcase",
		    fillColor: "rgba(230,237,236,0.4)",
                    strokeColor: "rgba(230,237,236,0.9)",
                    data: values
                   }
                ]
              }; 

        lineChart = new Chart(chartElement).Line(data, options);
        //set point color based on status 
        for (x=0; x<statuses.length;x++) {
            if (statuses[x].toLowerCase() == 'pass')
                color = "#7fe87f";
            else
                color = "red";
            lineChart.datasets[0].points[x].fillColor = color;
        }
        lineChart.update();
    }

    /*
     * populate the test selector element with the names of all test cases
     * TODO: Could move the view logic somewhere else
     */
    getTests = function($container, callback) {
        var client = new HttpClient();

        client.get(configMap.server + '/api/getAllTestNames', function(results) {
            var data, x, tempHtml;
            data = JSON.parse(results);

            for(x=0; x<data.length;x++) {
                tempHtml = "<option value='"+x+"'>"+data[x]['name']+"</option>";
                $(tempHtml).appendTo($container);   
            }
            callback();
        });
    };

    formatDate = function(epochDateString) {
        //unix timestamp is in seconds, js is in milliseconds
        var date = new Date(epochDateString * 1000);
        return date.toLocaleString('en-US', {hour12: false});
    }

    return {
        initModule: initModule
    }
})()
