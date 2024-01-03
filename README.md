# Shit Happened

The main purpose of this is to get alert if shit happened (BTC ETF Rejection)

Components:
- Server - scrapes news headlines, analyze if the title means rejection, then flags firestore as shit happened
- Mobile App - flutter app that listens to the firestore doc if shit happened and triggers an alarm

Usage is just keep it on and disable your android devices screen lock
