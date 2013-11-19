[Пример работы слайдера](http://mrfranke.github.io/animator/)

```javascript
new Animator( document.getElementById('test_block') )
                    .animation({ borderWidth: 10, width: 100 })
                    .duration(1000)
                    .animation({ left: 100 })
                    .duration(200)
                    .animation({ left: 0 })
                    .duration(1000)
                    .animation({ left: 1000 })
                    .duration(100)
                    .start()
                    .done(function () {
                       console.log(a = this);
                    });
```

##TODO:
- Добавить разные виды анимаций
- Добавить возможность анимировать цвета