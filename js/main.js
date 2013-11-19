function Animator ( element, animate, duration ) {
    this.element = element;
    this.options = {
        duration: 1000
    };
    this.animationsStack = []; // В этом массиве хранятся функции, рассчитывающие каждый кадр анимации этого аниматора

    if ( duration ) {
        this.duration( duration )
    }

    if ( animate ) {
        this.animation( animate );
        this.start();
    }
}

Animator.prototype.globalAnimationsStack = []; // В этом массиве хранятся ссылки на все Аниматоры с активной анимацией

/**
 * Перерисовывает всю анимацию на странице
 */
Animator.prototype.draw = function() {
    var that = Animator.prototype;
    
    // Запускаем анимацию только тогда, когда есть анимация в глобальном стеке
    if ( !that.globalAnimationsStack.length ) { return false; }
    that.drawGlobalStack();
    setTimeout(that.draw, 10);
}

/**
 * Запускает все функции анимации
 */
Animator.prototype.drawGlobalStack = function() {
    for (var i = 0; i < this.globalAnimationsStack.length; i++) {
        var animator = this.globalAnimationsStack[i]
          , frame = animator.animationsStack; // Берем первый шаг анимации

        // Вырезаем аниматоры без анимаций
        if ( !frame.length ) {
            this.globalAnimationsStack.splice(0,1);
            
            if (animator.options.callback) {
                animator.options.callback.apply(animator); // Запускаем callback после завершения анимации
            }
        }

        // Запускаем все шаги анимации аниматора
        for (var j = 0; j < frame.length; j++) {
            var frameFunc = frame[j]
              , isStop = frameFunc();

            // Удаляем отработавшую анимацию
            if ( isStop ) {
                frame.splice(j,1);
            }
        }
    }
}

/**
 * Генерирует функции для отрисовки анимации.
 */
Animator.prototype.getStepFunc = function( property, value ) {
    var that = this
      , startTime = new Date
      , prop = property
      , paramsValue = parseInt(that.element.style[prop], 10) || 0
      , val = value - paramsValue
      , step = val / 100;

    if ( !val ) { return false; } // Если анимация не нужна

    return function () {
        var progress = (new Date - startTime)/that.options.duration
          , newVal = paramsValue + ( progress*val );
        
        if (progress > 1) { progress = 1; }
        if ( progress === 1 ) {
            that.element.style[ prop ] = newVal + 'px';
            return true; // Возвращаем true при остановке анимации для ее удаления из стека
        }

        that.element.style[ prop ] = newVal + 'px';
        return false;

    };
};

/**
 * Добавляет новую анимацию в очередь на отрисовку
 */
Animator.prototype.animation = function( params ) {
    var propertys = params || {};

    for ( property in propertys ) {
        var value = propertys[ property ]
          , animationFunc = this.getStepFunc(property, value);
            
        if ( animationFunc ) {
            this.animationsStack.push( animationFunc ); // Добавляем новую анимацию
        }
    }

    return this;
};

Animator.prototype.start = function() {
    this.globalAnimationsStack.push( this ); // Передаем ссылку на аниматор в глобальный стек анимаций
    this.draw();
    return this;
};

Animator.prototype.stop = function () {
    this.animationsStack = [];
}

/**
 * Задает длительность анимации
 */
Animator.prototype.duration = function( duration ) {
    duration = parseInt(duration, 10);
    
    if ( typeof duration === 'number' ) { 
        this.options.duration = duration;
    }

    return this;
};

/**
 * Записывает callback, который вызовется после завершения всей анимации
 */
Animator.prototype.done = function( callback ) {
    this.options.callback = callback;
    return this;
}