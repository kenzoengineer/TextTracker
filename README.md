# Text Tracker
Your all-in-one generic solution for discord channel message tracking.

Uses discord.js and mongodb

## Introduction
Do you sometimes notice that a certain member of your discord server tends to say the same word on the daily? Perhaps it's a slang term thats currently popular, or maybe it's an inside joke. Regardless, you want to know how many times they say it, but discord search is clunky and just not as nice as a bot.

This bot can scale across many different servers, and acts as an easy to use text tracker that works right out of the box.

## Command List
`!add <user> <word>`

Adds a word to be tracked

`!list`

Lists all tracked words

`!remove <user> <word>`

Removes a currently tracked word

`!count <user> <word>`

Gets the amount of times the word has been said

`!chart <user> <word>`

Plots the occurances of words over a period of 5 days

## Future Commands

`!<custom>`

Custom command wrapper for count

`!compare <user1> <word1> <user2> <word2> ...`

Compare the counts of multiple tracked words

## Next steps
- Remake it in typescript
- Use js object schemas instead of raw querying
- Use the new discord slash commands rather than prefixing

## Privacy Policy
This bot does not store messages, user information or server information. However, some information is stored to facilitate the permanent storage of word counts. Only information about tracked users are stored.

User data we keep:
- User IDs of those being tracked
- The server ID that the above user is in 