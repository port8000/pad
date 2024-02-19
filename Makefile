PORT := 8099
PHP := php

all: js
.PHONY: all

js: static/pad.js
.PHONY: js

static/pad.js: static/pad-dev.js static/textarea-caret-position.js
	browserify $< | uglifyjs -m -c > $@

run:
	$(PHP) -S localhost:$(PORT)
.PHONY: run
