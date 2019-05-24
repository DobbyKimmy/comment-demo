!function () {
    var view = document.querySelector('div.message');
    var model = {
        init:function () {
            var APP_ID = 'f8faatBQkxdhuJJ9CS5zuhxh-gzGzoHsz';
            var APP_KEY = 'MoFx0cvMshHjCx2pNNKP9vBI';

            AV.init({
                appId: APP_ID,
                appKey: APP_KEY
            });
        },
        // 获取数据
        fetch:function () {
            var query = new AV.Query('Comment');
            return query.find()// 返回 Promise对象
        },
        // 保存数据
        save:function (name,comment) {
            var Comment = AV.Object.extend('Comment');
            var c = new Comment();
            return c.save({
                'name': name,
                'comment': comment
            }) // 返回 Promise对象
        }
    };
    var controller = {
        view:null,
        model:null,
        init: function(view,model) {
            this.view = view;
            this.model = model;
            this.model.init();
            this.loadMessage();
            this.bindEvents();
        },
        bindEvents:function(){
            var form = this.view.querySelector('form');
            form.addEventListener('submit',(e)=>{
                e.preventDefault();
                this.saveMessage();
            })
        },
        saveMessage:function(){
            let name = this.view.querySelector('input[name=name]').value;
            let comment = this.view.querySelector('input[name=comment]').value;
            this.model.save(name,comment)
                .then(function(object) {
                    // 将数据新增到页面上
                    let ul = this.view.querySelector('.messageList');
                    let li = this.view.createElement('li');
                    li.innerText = name+' : '+comment;
                    ul.appendChild(li);
                    // 将两个input输入框的内容清空
                    this.view.querySelector('input[name=name]').value = '';
                    this.view.querySelector('input[name=comment]').value = '';
                })
        },
        loadMessage:function(){
            this.model.fetch()
                .then((e)=>{
                    let array = e.map((item)=>{return item.attributes});
                    let ul = document.querySelector('.messageList');
                    array.forEach((e)=>{
                        let li = document.createElement('li');
                        li.innerText = e.name+' : '+e.comment;
                        ul.appendChild(li);
                    })
                })
        }
    }
    controller.init.call(controller,view,model);
}.call()
