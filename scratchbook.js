time="2018-11-14T23:53:22.482Z";
var currentMiliseconds = Date.now(); 
var oneDate = new Date(time);
var oneDateMiliseconds = oneDate.getTime();
var difference = currentMiliseconds-oneDateMiliseconds;

console.log(difference);