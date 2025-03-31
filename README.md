## Instalation

1. Clone the repository
2. Create `config.json` `discord-ids.json` `times.json`
3. `config.json` will look like this:  
```
{
    "token": "",
    "clientId": "",
    "guildId": "",
    "databasePassword": "",
    "databaseName": ""
}
```
4. `discord-ids.json` will look like this:  
```
{
  "server": "",
  "bills": "",
  "laws": "",
  "president_office": "",
  "main": "",
  "president_role": "",
  "me": ""
}
```
5. `times.json` will look like this:
```
{
  "check_bills": ,
  "check_election": ,
  "checks_election": ,
  "bill_voting_time": ,
}
```
#### Explaination of values
(Go into developer mode first)
token: your bot token  
clientId: go to bot website > general information > copy application id  
guildId: right click server name and click _Copy Server Id_  
databasePassword: your mysql database password  
databaseName: your mysql database name  
server: same as guildId  
bills: right click the bills channel and click _Copy Channel ID_  
laws: same as bills but for laws channel  
president_office: same as bills but for presidents office  
main: same as bills but for main chatting channel  
president_role: go to president role and click more then click _Copy Role ID_  
me: right click yourself and click _Copy User ID_  
check_bills: how often to check for bills to send to president (in miliseconds)  
check_election: how often to check to count votes for president (in miliseconds)  
checks_election: if the election should be automatic (boolean)  
bill_voting_time: how long does a bill have to be voted on (in seconds)  

6. Go to the main directory and run `npm i`  
7. Run `tsc`
8. Run `node .`
