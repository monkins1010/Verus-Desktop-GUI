var terminalText = ""

if (window.module) {
  module = window.module;
}

function getURLParameter(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');

    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
}

function startBootstrap() {
  const chainTicker = getURLParameter("ticker")
  const bootstraps = require("@electron/remote").require(
    "./routes/children/fetch-bootstrap/bootstraps/index"
  );

  if (chainTicker && chainTicker.length > 0 && bootstraps[chainTicker.toLowerCase()]) {
    bootstraps[chainTicker.toLowerCase()].setup((text) => {
      terminalText = terminalText.concat(text)
      let obj = document.getElementById("bootstrap-terminal-text");
      obj.innerText = terminalText;
      window.scrollTo(0, document.body.scrollHeight);
    })
  }
}