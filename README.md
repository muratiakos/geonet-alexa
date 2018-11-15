## Alexa Geonet

### Setup
```
npm install
```

### Local Usage
Invoke locally with an Intent JSONs
```
# Latest Intent test
slss invoke local -f geonet --path ./test/fixtures/LatestQuakeIntent.json

## Was that A???
slss invoke local -f geonet --path ./test/fixtures/WasThatAQuakeIntent.json

## Read news
slss invoke local -f geonet --path ./test/fixtures/ReadNewsIntent.json
```
