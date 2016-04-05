
chrome-package: vendor_js
	cd "chrome-extension"
	zip --recurse-paths \
		../chrome-extension.zip \
		./manifest.json \
		./background.html \
		./options.html \
		./popup.html \
		./css/chrome-options.css \
		./css/base.css \
		./img/icon*.png \
		./js/*.js


vendor_js:
	mkdir -p chrome-extension/js/vendor

	# JWT
	curl -qs https://raw.githubusercontent.com/michaelrhanson/jwt-js/master/src/jwt-token.js > chrome-extension/js/vendor/jwt-token.js

	# SJCL.js
	curl -qs https://raw.githubusercontent.com/bitwiseshiftleft/sjcl/1.0.3/sjcl.js > chrome-extension/js/vendor/sjcl.js

	# Zepto
	curl -qs https://raw.githubusercontent.com/madrobby/zepto/v1.1.6/src/zepto.js > chrome-extension/js/vendor/zepto.js

