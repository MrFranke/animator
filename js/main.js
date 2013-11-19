function Animator ( element, animate, duration ) {
    this.element = element;
    this.options = {
        duration: 1000
    };

    this.startTime = new Date;
    this.steps = []; // Тут храняться все шаги аниматора
    this.animationsStack = []; // В этом массиве хранятся функции, рассчитывающие каждый кадр анимации этого аниматора
    this.isPause = false;

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

        if ( animator.isPause ) { break; } // Пропускаем анимацию, если она на паузе

        // Когда стек анимаций пустой, но есть другие шаги анимации, переходим к следующему шагу
        if ( animator.steps.length && !frame.length ) {
            animator.changeStep();
            break;
        }

        // Вырезаем аниматоры без анимаций
        if ( !frame.length ) {
            this.globalAnimationsStack.splice(i,1);
            
            if (animator.options.callback) {
                animator.options.callback.apply(animator); // Запускаем callback после завершения анимации
            }

            break;
        }

        // Запускаем все шаги анимации аниматора
        for (var j = 0; j < frame.length; j++) {
            var frameFunc = frame[j]
              , isStop = frameFunc();

            // Удаляем отработавшую анимацию
            if ( isStop ) {
                frame.splice(j,1);
                break;
            }
        }
    }
}

/**
 * Меняет шаг анимации
 */
Animator.prototype.changeStep = function() {
    if ( !this.steps.length ) { return false; }
    this.startTime = new Date;
    this.animationsStack = [];
    this.options.duration = this.steps[ 0 ].duration;
    var propertys = this.steps[ 0 ].step;
    this.steps.shift();

    // Создаем новую анимацию с актуальными данными
    for ( property in propertys ) {
        var value = propertys[ property ]
          , animationFunc = this.getStepFunc(property, value);
            
        if ( animationFunc ) {
            this.animationsStack.push( animationFunc ); // Добавляем новую анимацию
        }
    }
}

/**
 * Генерирует функции для отрисовки анимации.
 */
Animator.prototype.getStepFunc = function( property, value ) {
    var that = this
      , prop = property
      , paramsValue = parseInt(getComputedStyle(that.element, '')[prop], 10) || 0
      , val = value - paramsValue
      , step = val / 100;

    if ( !val ) { return false; } // Если анимация не нужна

    return function () {
        var progress = (new Date - that.startTime)/that.options.duration
          , newVal;
        
        if (progress > 1) { progress = 1; }
        newVal = paramsValue + ( progress*val );

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
    var propertys = params || {}
      , step = [];

    for ( property in propertys ) {
        var value = propertys[ property ]
          , animationFunc = this.getStepFunc(property, value);
            
        if ( animationFunc ) {
            step.push( animationFunc ); // Добавляем новую анимацию
        }
    }

    // Если анимаций еще не было, то не пушим новы шаг, а добавляем его сразу в стек анимаций
    if (!this.animationsStack.length) {
        this.animationsStack = step;
        return this;
    }

    this.steps.push({
        duration: this.options.duration,
        step: params // В следующий шаг передаем параметры для создания функции при следующем шаге
    });

    return this;
};

Animator.prototype.start = function() {
    this.startTime = new Date
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

    if ( typeof duration !== 'number' ) { return false; }

    // Добавляет время исполнения анимации последнего шага
    if ( this.steps.length ){
        this.steps[ this.steps.length-1 ].duration = duration;
        return this;
    }

    this.options.duration = duration;

    return this;
};

/**
 * Записывает callback, который вызовется после завершения всей анимации
 */
Animator.prototype.done = function( callback ) {
    this.options.callback = callback;
    return this;
}