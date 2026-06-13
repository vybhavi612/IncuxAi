let raceNumber = Math.floor(Math.random() * 1000);
let registeredEarly = false;
let age =18;
if(age>=18 && registeredEarly===true ){
  let raceNumber=1000;
} 
if(age >18 && registeredEarly===true){
  console.log('Start the race at 9:30 am with ',raceNumber);

}
else if(age>18 && registeredEarly === false){
  console.log('Start the race at 11:00am ',raceNumber);
}
else{
  console.log('Start race at 12:30pm',raceNumber);
}
// This code explains about runners age and permission based starting the race
