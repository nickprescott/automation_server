var automationMetrics = (function () {

    var configMap = {
            main_html:
	        '<div class="application-container">'
                + '<div class="chart-container">'
                    + '<h2 style="float:left">Aggregate Test Status Counts</h2>'
                    + '<ul id="aggLegend" class="legend"></ul>'
                    + '<canvas id="aggTestCounts"></canvas>'
                    + '<div id="failure-popup" class="popup">'
                        + '<div id="failure-popup-title" class="popup-title">List of failed testcases <span id="close-failure-popup">X</span></div>'
                        + '<div id="failure-content" class="popup-content"></div>'
                    + '</div>'
                + '</div>'
                + '<div class="chart-container">'
                    + '<h2>Total Execution Time (mins)</h2>'
                    + '<canvas id="aggExecutionChart"></canvas>'
                + '</div>'
                + '<div class="chart-container">'
	                + '<h2>Test Case Execution Times (seconds)</h2>'
		            + '<select id="testSelector"></select>'
		            + '<canvas id="executionTimeChart"></canvas>'
	            + '</div>'
	        + '</div>',
            server: 'http://'+ location.host
        },
        initModules, displayChart, getAggTestCounts, displayAggTestCounts, 
        displayAggExectutionChart, getAggExecutionTimes, 
        displayListOfFailedTests, getTestCaseData, getTests, formatDate;

    initModule = function($container) {
        var selector; 

        $container.html(configMap.main_html);
        
        getAggTestCounts($container.find('#aggTestCounts'));
        getAggExecutionTimes($container.find('#aggExecutionChart'));
        getTests($container.find('#testSelector'), getTestCaseData);

        selector = $container.find('#testSelector');
        selector.on('change', getTestCaseData);

        $('#close-failure-popup').on('click', function() {
            $('#failure-popup').css('display', 'none');
        });
    }

    getTestCaseData = function() {
        var testcaseName;
        testcaseName = $('#testSelector :selected').text();

        $.ajax({
            url: configMap.server + '/api/testcases',
            data: { tests: testcaseName},
            type: 'GET',
            dataType: 'json',
            success: function(results) {
                var times = [];
                var timestamps = [];
                var statuses = [];
                var x, row;

                for(x=0; x<results.length; x++) {
                    row = results[x];
                    times.push(row.execution_time);
                    timestamps.push(formatDate(row.date));
                    statuses.push(row.status);
                }
                displayChart('#executionTimeChart', timestamps, times, statuses);
            }
        });
    }

    displayChart = function(elementId, labels, values, statuses) {
        var chartElement = $(elementId)[0].getContext("2d");
        var lineChart, data, x, color, options;

        options = {
            pointDotRadius: 6,
            pointHitDetectionRadius: 0
        }

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

    //TODO: abstract chart displaying logic
    displayAggExectutionChart = function(elementId, labels, values) {
        var chartElement = $(elementId)[0].getContext("2d");
        var lineChart, data, options;

        options = { pointHitDetectionRadius: 2 }

        data = {
        labels: labels,
        datasets: [
                  {
                    label: "Execution Time",
                    fillColor: "rgba(230,237,236,0.4)",
                    pointColor: "#A9C4C3",
                    strokeColor: "rgba(230,237,236,0.9)",
                    data: values
                   }
                ]
              }; 

        lineChart = new Chart(chartElement).Line(data, options);
    }

    getAggExecutionTimes = function(elementId) {
        var execTime;
        $.ajax({
            url: '/api/totalExecutionTimeByDay',
            type: 'GET',
            dataType: 'json',
            success: function(results) {
                var labels = [];
                var values = [];
                var x;
                for (x=0; x<results.length; x++) {
                    labels.push(formatDate(results[x].date));
                    //execution time in mins with only 2 decimal places
                    execTime = Math.round(parseInt(results[x].time)/60 *100)/100; 
                    values.push(execTime);
                }
                displayAggExectutionChart(elementId, labels, values);
            }
        });
    }

    getAggTestCounts = function (elementId) {
        $.ajax({
            url : configMap.server + '/api/allTestStatuses',
            type : 'GET',
            dataType: 'json',
            success : function (results) {
                aggChart = displayAggTestCounts(elementId, results); 
                $(elementId).click(function (evt) {
                    var activePoints = aggChart.getPointsAtEvent(evt);
                    displayListOfFailedTests(activePoints);
                });
            }
        });
    }

    displayAggTestCounts = function(elementId, results) {
        var chartElement = $(elementId)[0].getContext("2d");
        var aggregateChart;
        var  x, row, i, listItem, options;
        var dates, pass_data, fail_data,skip_data;
        dates = [];
        pass_data = [];
        fail_data = [];
        skip_data = [];

        for(x=0; x<results.length; x++) {
            row = results[x];
            dates.push(formatDate(row.date));
            pass_data.push(row.pass_count);
            fail_data.push(row.fail_count + row.error_count);
            skip_data.push(row.skip_count);
        }

        options = { pointHitDetectionRadius: 2 }

        data = {
        labels: dates,
        datasets: [
                  {
                    label: "Passing tests",
                    pointColor: "#6CD960",
                    fillColor: "rgba(230,237,236,0.4)",
                    strokeColor: "rgba(230,237,236,0.9)",
                    data: pass_data
                   },
                   {
                    label: "Failing tests",
                    pointColor: "red",
                    fillColor: "rgba(230,237,236,0.4)",
                    strokeColor: "rgba(230,237,236,0.9)",
                    data: fail_data
                   },
                   {
                    label: "Skipped tests",
                    pointColor: "blue",
                    fillColor: "rgba(230,237,236,0.4)",
                    strokeColor: "rgba(230,237,236,0.9)",
                    data: skip_data
                   }
                ]
              }; 

        aggregateChart = new Chart(chartElement).Line(data, options);
        
        //create the legend
        for (i=0; i<data.datasets.length; i++) {
            listItem = "<li style='color:"+data.datasets[i].pointColor+"'>"+data.datasets[i].label+"</li>";
            $(listItem).appendTo($('#aggLegend'));
        }
        return aggregateChart;
    }

    /*
     *Display a tooltip with the names of the failed testcases.
     */
    displayListOfFailedTests = function(dataPoints) {

        //get the date in unix-epoch format
        var failureDate = Date.parse(dataPoints[1].label)/1000;
        var allResults = [];

        $.ajax({
            url : configMap.server + '/api/testNamesByDateAndStatus',
            data: { date: failureDate, status: 'failure'},
            type : 'GET',
            dataType: 'json',
            success : function (results) {
                allResults = allResults.concat(results);
                //need the tests whose status was 'error' as well
                $.ajax({
                    url : configMap.server + '/api/testNamesByDateAndStatus',
                    data: { date: failureDate, status: 'error'},
                    type : 'GET',
                    dataType: 'json',
                    success : function (moreResults) {
                        var output, x;
                        allResults = allResults.concat(moreResults);
                        output = "";

                        for( x=0; x < allResults.length; x++) {
                            output += allResults[x].name + "<br>";
                        }
                        //display popup with failed test names
                        $('#failure-content').html(output);
                        $('#failure-popup').css('display', 'block');
                    }
                });
            }
        });
    };

    /*
     * populate the test selector element with the names of all test cases
     * TODO: Could move the view logic somewhere else
     */
    getTests = function($container, callback) {
        $.ajax({
            url: configMap.server + '/api/allTestNames',
            type: 'GET',
            dataType: 'json',
            success: function(results) {
                var x, tempHtml;

                for(x=0; x<results.length;x++) {
                    tempHtml = "<option value='"+x+"'>"+results[x]['name']+"</option>";
                    $(tempHtml).appendTo($container);   
                }
                callback();
            }
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
