PORT := 8099
PHP := php

all: css js
.PHONY: all

css: static/pad.css
.PHONY: css

static/pad.css: static/pad.scss static/_*.scss
	sass $< | cssmin > $@

js: static/pad.js
.PHONY: js

static/pad.js: static/pad-dev.js static/textarea-caret-position.js
	browserify $< | uglifyjs -m -c > $@

run:
	$(PHP) -S localhost:$(PORT)
.PHONY: run
