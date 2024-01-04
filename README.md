# Shit Happened

The main purpose of this is to get alert if shit happened (BTC ETF Rejection)

For now:
- just run a cron server in your computer keep it on

REQUIREMENTS:
- node.js / pkgx
- gemini api key from google https://ai.google.dev/tutorials/setup



to run:
```
pnpm start
```

to do a shit_happened dry-run uncomment

FUTURE IF THERE IS:
Components:
- Server - scrapes news headlines, analyze if the title means rejection, then flags firestore as shit happened
- Mobile App - flutter app that listens to the firestore doc if shit happened and triggers an alarm

Usage is just keep it on and disable your android devices screen lock
