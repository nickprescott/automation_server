/*
 * Reusable javascript function for sending HTTP requests
 * courtesy of: http://stackoverflow.com/questions/247483/http-get-request-in-javascript
 *
 * Example usage:
 * client = new HttpClient();
 * client.get("http://webapp/blah?with=args", function(answer) {
 *    <do stuff with answer>
 *    });
 */
var HttpClient = function() {
    this.get = function(url, callbackFunction) {
        anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() {
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                callbackFunction(anHttpRequest.responseText);
        }

        anHttpRequest.open("GET", url, true);
        anHttpRequest.send(null)
    }
}
