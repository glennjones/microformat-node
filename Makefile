REPORTER = list
test:
	./node_modules/.bin/mocha \
		--reporter $(REPORTER)

.PHONY: test
