function verifyy()
{
    const age=document.getElementById("age").value;
const name=document.getElementById("name").value;
const result=document.getElementById("result");
if(age<18)
{
 result.innerHTML= `  You are an Child ${name}`;

}
else if(age>=18 && age<=20)
{
    result.innerHTML = `  You are an Teenager ${name}`;
}
else if(age>20 && age<=40)
{
    result.innerHTML = `  You are im middle age ${name}`;
}
else{
    result.innerHTML = `  You are an Older ${name}`;
}
}


/* git checkout Vaishnavi-Gurramkonda
 git status
 git add .
 git commit -m "Your message"
 git pull origin Vaishnavi-Gurramkonda --rebase
 git push origin Vaishnavi-Gurramkonda
*/