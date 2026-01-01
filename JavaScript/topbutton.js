// for history page button
let backtopArray1 = document.getElementsByClassName('back-to-top1');
let width = document.documentElement.clientWidth; //width excluding the scroll bars
console.log(width);
window.onscroll = function(){
  if ((document.body.scrollTop > 500 || document.documentElement.scrollTop > 500) && (width <584)){
    backtopArray1[0].style.display = "block";
    // backtopButton.style.display = "block";
} else {
    backtopArray1[0].style.display = "none";
    // backtopButton.style.display = "none";

}
};
//making the button actually work
backtopArray1[0].addEventListener('click', function(){
  document.body.scrollTop = 0; //for safari browser
  document.documentElement.scrollTop = 0; // for normal browsers
});