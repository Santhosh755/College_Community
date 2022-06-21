$('.hero-btn').click(function(){
  if(!$('.hero-btn').parent().hasClass('active')){
    $(this).parent().stop().addClass('active');
    setTimeout(function(){  
      $('.hero-btn').parent().removeClass('active'); 
    }, 2000);
  }
});
function delay(){
  document.getElementById('delaymsg').innerHTML="Please wait lets\'s start within <span id='countdown' '> 5 </span> seconds...."
  var count=5;
  setInterval(function(){
    count--;
    document.getElementById('countdown').innerHTML=count;
    if(count==0){
      window.location='/entrance';
    }
  },1000);
}