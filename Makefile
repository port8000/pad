all: css js

css: static/pad.css

static/pad.css: static/pad.scss static/_*.scss
	sass $< | cssmin > $@

js: static/pad.js

static/pad.js: static/pad-dev.js static/textarea-caret-position.js
	browserify $< | uglifyjs -m -c > $@
