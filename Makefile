
build: components maple.js
	@component build --dev

components: component.json
	@component install --dev

clean:
	rm -fr build components

opensauce:
	@node test/opensauce.js

.PHONY: clean
