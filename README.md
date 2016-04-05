h1. Twilio Chrome Extension

To package this extension for deployment:

# Update src/manifest.json with a new version

# Minifiy JS http://fmarcia.info/jsmin/test.html
# Execute ./package.sh
# Upload ctp.zip to the web-store


# Package with Chromium - Doesn't Work

This is more for sending to your friends

* chromium --user-data-dir=./cr-twilio
* Load Extension from ./src
* Pack Extension
* Extension Root Directory: /home/atom/svn.cte/src
* Private key file: /home/atom/svn.cte/ectp.pem
* Upload Packaged File to Chrome Web-Store
