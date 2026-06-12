/*
Golbal Execusion context (GEC) - created when js file run
funtional Execusion context (FEC) - funtions run
Eval Execusion context (EEC) -Execute a str in js code
 */

function ages(name)
{
    console.log(`suesh age is ${name} \nthanku`);
}
let suresh=prompt("Suresh is your age ?");
let Haresh=prompt("Haresh is your age ?");
let Naresh=prompt("Naresh is your age ?");


ages(suresh);
ages(Haresh);
ages(Naresh);
