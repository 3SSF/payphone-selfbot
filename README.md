# payphone-selfbot
## A discord automatic messaging base for payphone-like bots.
### Please don't use this for PayPhone! We only use it as an example

# if you are an admin or developer of payphone and would like the ongoing nuisance of our bots running multiple instances advertising this repo, please friend @\lexintrus on discord, we will immediately stop it, we just wanted to have a bit of fun and be noticed (you can unfriend after, obviously)

# This is a selfbot, and against Discord TOS. We do not take responsibility for any bans issued.
- We are not associated with Discord nor the Discord.js-selfbot project.


# For windows users only:
Swap to [this](https://github.com/3SSF/payphone-selfbot/tree/windows-dev) branch!

# Setup
1. Install Node.JS

2. Run setup.sh

3. Input correct variables

4. Make a file named "names" and leave it blank.

5. **(OPTIONAL!)** If you want a default argument configuration, in the root directory of the project create a file named "args.json" and make an array in it called "args", and format it with arguments as you would normally, the only difference being a comma between each argument stack, and it surrounded by double quotes.

example:

{
    "args" : ["-nlm", "-H", "/path/to/file"]
}


# Future plans
- Less hardcoding on variables
- ~~json reading for configs~~
- ~~A script to automatically make the said json~~
- More ease of use for non techy people
- More generality on the use of this bot
- Cleaner overall code
- 100% compatibility on window
- GUI, yes, im really planning this, i dont know if this will ever happen.

# Contributing to the bot
### If you plan on contributing, then please follow these standards:

1. camelCase - Use camelCasing for our variable names.
2. variable declaration - Declare related variables near the top, close to eachother.
3. constant variabels - Declare variables as constants if that is feasable.
4. asynchronous execution - Anything after initialization, must be asynchronous to prevent delays.
5. descriptive function names - Any functions that are added, must have descriptive names that are easy to understand.
6. descriptive variable names - Same thing as functions, but with variables.
