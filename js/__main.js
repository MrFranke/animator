function Animator ( element ) {
    this.element = element;
    this.options = {
        duration: 1000
    };
}

/**
 * Создает новую анимацию
 */
Animator.prototype.animation = function ( propertys ) {
    var that = this 
      , startTime = new Date;

    var intervalID = setInterval(function () {
        var progress = (new Date - startTime)/that.options.duration;
        if (progress > 1) progress = 1;
        that.element.style.marginLeft = progress*500 + 'px';
        if (progress == 1) clearInterval(intervalID);
    }, 14);
}




$('.start_animation_btn-jquery').click(function () {
    $('.test_block').animate({marginLeft: 200});
});
$('.start_animation_btn').click(function () {
    var a = new Animator( document.querySelector('.test_block') ).animation({ marginLeft: 100 })//.start();
    setTimeout(function () {
        console.log('!');
        console.log(document.querySelector('.test_block').style.marginLeft);
        //a.stop();
    }, 1000)
});