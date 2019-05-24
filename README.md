# 从使用LeanCloud开发评论功能理解MVC

> 学习笔记：使用LeanCloud开发网页上简易的评论留言功能

示例效果:
<br>
![](https://user-gold-cdn.xitu.io/2019/5/25/16aeb2b06d54cd93?w=880&h=842&f=png&s=124721)
<br>
## 关于LeanCloud
LeanCloud 是国内领先的针对移动应用的一站式云端服务,可以为开发提供强而有力的后端支持，它包含数据存储，即时通讯等多种服务，拿网页的comment评论留言功能为例，目前很多个人博客的留言功能都是由LeanCloud支持的。在注册完LeanCloud账号，并创建好新应用后，我们就需要安装或在线CDN引入LeanCloud的SDK了。本示例选择了通过script标签引入SDK的方式，即：
````html
<!-- 存储服务 -->
<script src="//cdn.jsdelivr.net/npm/leancloud-storage@3.13.2/dist/av-min.js">
</script>
````
如果使用了CDN加载LeanCloud的SDK,那么第一步需要进行初始化：
````javascript
var APP_ID = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
var APP_KEY = 'xxxxxxxxxxxxxxxxxxxxx';

AV.init({
  appId: APP_ID,
  appKey: APP_KEY
});
````
值得一提的是，在LeanCloud首页的快速入门项中关于初始化一项所给的示例则会自动替换成我们当前应用的APP_ID和APP_Key。快速入门的链接在这里：[quickStart](https://leancloud.cn/docs/start.html) 。
<br>
初始化完毕后，如果我们能在控制台上打印出"AV"这个对象，则说明LeanCloud的SDK引入成功。
## 提交数据到LeanCloud数据库
本示例的HTML结构如下：
````html
<div class="message">
    <h1>Comment</h1>
    <hr>
    <ul class="messageList"></ul>
    <form action="">
        <label for="">name</label>
        <input type="text" name="name">
        <label for="">comment</label>
        <input type="text" name="comment">
        <input type="submit" value="submit">
    </form>
</div>
````
首先我们要完成的功能是点击submit提交按钮后，两个input标签输入的内容能够上传至我们在LeanCloud新建的数据表Comment中。所以很显然我们需要绑定form表单的submit事件，实现代码如下:
````javascript  
  var form = document.querySelector('div.message>form');

    form.addEventListener('submit',(e)=>{
        // 首先要阻止 form表单默认功能
        e.preventDefault();
        // 在LeanCloud中已经创建了 Comment 数据表
        var Comment = AV.Object.extend('Comment');
        var c = new Comment();

        let name = document.querySelector('input[name=name]').value;
        let comment = document.querySelector('input[name=comment]').value;
        c.save({
            'name': name,
            'comment':comment
        }).then(function(object) {
            // 将数据新增到页面上
            let ul = document.querySelector('.messageList');
            let li = document.createElement('li');
            li.innerText = name+' : '+comment;
            ul.appendChild(li);
            // 将两个input输入框的内容清空
            document.querySelector('input[name=name]').value = '';
            document.querySelector('input[name=comment]').value = '';
        })
    })
````
关于此段代码，需要说明的是对于form表单来说，每次提交都会刷新页面所以需要阻止form表单的默认功能,即``e.preventDefault();``。
## 将数据显示在页面上
我们可以通过查看LeanCloud的javascript文档查找相关的API。在批量操作一项中，有这段代码:
````javascript
var query = new AV.Query('Todo');
  query.find().then(function (todos) {
    todos.forEach(function(todo) {
      todo.set('status', 1);
    });
    return AV.Object.saveAll(todos);
  }).then(function(todos) {
    // 更新成功
  }, function (error) {
    // 异常处理
  });
````
如果将``query.find()``的结果打印在控制台上，我们就知道其结果是一个数组，并且数组的每一项的attributes中则存放着我们存储的用户留言名以及留言信息。我们只需要将数据库中的数据生成在页面上即可，代码如下：
````javascript
var query = new AV.Query('Comment');
    query.find().then((e)=>{
        let array = e.map((item)=>{return item.attributes});
        let ul = document.querySelector('.messageList');
        array.forEach((e)=>{
            let li = document.createElement('li');
            li.innerText = e.name+' : '+e.comment;
            ul.appendChild(li);
        })
    })
````
## 使用MVC思想整合代码
MVC是什么？其实MVC很简单,它只是一种思想。
MVC将代码分为Model,View,Controller三种格局
Model层只跟数据库打交道，负责数据的部分
View视图层则获取可视化页面上的元素信息
Controller逻辑层则负责调用视图层及Model层进行逻辑交互
拿本示例的留言功能为例：
Model层负责获取服务器数据库内的数据，并交互给逻辑层的代码
逻辑层的代码则通过视图层将数据显示在页面上。
如果用户点击submit,则一样 form表单被提交，View层通知Controller层，通过
Model层将数据写入数据库，并更新视图层。这就是MVC。现在对代码整合结果如下：
````javascript
!function () {
    var view = document.querySelector('div.message');
    var model = {
        init:function () {
            var APP_ID = 'xxxxxxxxxxx-xxxxxx';
            var APP_KEY = 'xxxxxxxxxxxxxx';

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

````