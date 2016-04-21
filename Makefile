#
# WeedTraQR Makefile
#

#
# Help, the default target
help:
	@echo
	@echo "You must supply a make command"
	@echo
	@grep -ozP "^#\n#.*\n[a-zA-Z_-]+:" $(MAKEFILE_LIST) \
		| awk '/[a-zA-Z_-]+:/ { printf " \033[0;49;31m%-15s\033[0m%s\n", $$1, gensub(/^# /, "", "", x) }; { x=$$0 }' \
		| sort
	@echo

#
# Build a Package for Chrome
chrome-extension.zip: js-vendor
	cd "chrome-extension" && zip --recurse-paths \
		../chrome-extension.zip \
		./manifest.json \
		./background.html \
		./options.html \
		./popup.html \
		./css/chrome-options.css \
		./css/base.css \
		./img/icon*.png \
		./js/vendor/*.js \
		./js/*.js

#
# Get all the necessary Vendor JS
js-vendor:
	mkdir -p chrome-extension/js/vendor

	# JWT
	curl -qs https://raw.githubusercontent.com/michaelrhanson/jwt-js/master/src/jwt-token.js > chrome-extension/js/vendor/jwt-token.js

	# SJCL.js
	curl -qs https://raw.githubusercontent.com/bitwiseshiftleft/sjcl/1.0.3/sjcl.js > chrome-extension/js/vendor/sjcl.js

	# Zepto
	curl -qs https://raw.githubusercontent.com/madrobby/zepto/v1.1.6/src/zepto.js > chrome-extension/js/vendor/zepto.js

