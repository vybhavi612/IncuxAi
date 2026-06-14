const dis=document.getElementById("display")
function appendToDisplay(Text){
dis.value+=Text;
}
function clearToDisplay(){
dis.value="";
}
function calculate(){
    try{
    dis.value=eval(dis.value);}
    catch(error){
        dis.value=error;
    }
}