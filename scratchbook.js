timeString="2018-11-15T22:10:22.482Z";
var currentMiliseconds = Date.now();//-13*60*1000; 
var oneDate = new Date(timeString);
var oneDateMiliseconds = oneDate.getTime();
var difference = currentMiliseconds-oneDateMiliseconds;

console.log(difference);