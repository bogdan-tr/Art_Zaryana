  //form validation
  document.getElementById('newsletterForm').addEventListener('submit', function(event){
    event.preventDefault();
    console.log('test');
    let name = document.getElementById('name').value;
    let email = document.getElementById('email').value;
    const nameEl = document.getElementById('name');
    const emailEl = document.getElementById('email')
    name = name.trim();
    console.log(name);
    console.log(email);
    if ((name.length<2 || name.length>50)&&(!email.includes('@'))){
      window.alert('Pleae enter valid name and email!');
      nameEl.style.border = '1px solid red';
      emailEl.style.border = '1px solid red';
      return;
    }
    if(name.length<2 || name.length>50){
      window.alert('Please enter valid name.');
      nameEl.style.border = '1px solid red';
      return;
    }
    if(!email.includes('@')){
      window.alert('Please enter valid email.');
      emailEl.style.border = '1px solid red';
      return;
    }
    window.alert('Form submitted succesfully. Thank you for subscribing!')
    console.log(name);
    console.log(email);
  });

  //Back to top button (only visible on some pages on phones and when user scrolls over 500px from top)
  let backtopArray = document.getElementsByClassName('back-to-top');
  let width = document.documentElement.clientWidth; //width excluding the scroll bars
  console.log(width);
  window.onscroll = function(){
    if ((document.body.scrollTop > 500 || document.documentElement.scrollTop > 500) && (width <584)){
      backtopArray[0].style.display = "block";
      // backtopButton.style.display = "block";
  } else {
      backtopArray[0].style.display = "none";
      // backtopButton.style.display = "none";

  }
  };
  //making the button actually work
  backtopArray[0].addEventListener('click', function(){
    document.body.scrollTop = 0; //for safari browser
    document.documentElement.scrollTop = 0; // for normal browsers
  });






  