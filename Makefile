node_modules: package.json
	npm install
	touch node_modules

build: node_modules
	BABEL_ENV=commonjs $(CURDIR)/node_modules/.bin/babel src/redux-testing.js --out-dir lib
	$(CURDIR)/node_modules/.bin/babel src/redux-testing.js --out-dir es

publish:
	npm publish

test t: node_modules
	@./node_modules/.bin/jest

RELEASE ?= patch
release:
	make build
	bumpversion $(RELEASE)
	make publish
	git checkout master
	git merge develop
	git checkout develop
	git push origin develop master
