var sw = 20,  //方块的宽度
    sh = 20,  //方块的高度
    tr = 30,  //行数
    td = 30;  //列数
var snake = null, //蛇的实例
    food = null,  //食物的实例
    game = null; //游戏的实例

//方块构造函数用来创建蛇head body food等
function Square(x, y, classname) {
    //方块左上角的坐标应该是0,0第二个20,0第三个40,0实际开发的坐标20px一位;  
    // 0,0 1,0 2,0;用户传进来的坐标是这样的
    //0,0    0,0
    //1,0   20,0
    //2,0   40,0
    //20px一位用户走一位 程序走20px;
    this.x = x * sw; //用户传进来的坐标乘方块的宽度20px;就可以得到1,0对应20,0;
    this.y = y * sh; //同理
    this.class = classname; //没有大写Name是因为这是一个变量

    this.viewContent = document.createElement('div'); //方块对应的DOM元素
    this.viewContent.className = this.class; //这个className大写是viewContent里的一个属性
    this.parent = document.getElementById('snakeWrap'); //获取方块父级的位置
};
//添加方块方法
Square.prototype.create = function () {
    //创建方块DOM
    this.viewContent.style.position = 'absolute';
    this.viewContent.style.width = sw + 'px';
    this.viewContent.style.height = sh + 'px';
    this.viewContent.style.left = this.x + 'px';
    this.viewContent.style.top = this.y + 'px';
    this.parent.appendChild(this.viewContent); //碰到食物添加一个小方块
};
//添加移除方法
Square.prototype.remove = function () {
    //移除方块
    this.parent.removeChild(this.viewContent);//移除一个小方块
};
//位置等存储信息
function Snake() {
    this.head = null;//存一下蛇头的信息
    this.tail = null;//存一下蛇尾的信息
    this.pos = []; //存一下蛇身上每一个方块的位置

    this.directionNum = {//存储蛇走的方向 用一个对象来表示
        left: {
            x: -1,
            y: 0,
            rotate:180//蛇头在不同方向中应该进行旋转
        },
        right: {
            x: 1,
            y: 0,
            rotate:0
        },
        up: {
            x: 0,
            y: -1,
            rotate:-90

        },
        down: {
            x: 0,
            y: 1,
            rotate:90
        }


    }

};
//init初始化信息
Snake.prototype.init = function () {
    //创建蛇头
    var snakeHead = new Square(2, 0, 'snakeHead');
    snakeHead.create();
    this.head = snakeHead; //存储蛇头信息
    this.pos.push = ([2, 0]); //把蛇头的位置存起来 用push方法存在pos数组最后一位

    //创建蛇身体1
    var snakeBody1 = new Square(1, 0, 'snakeBody');
    snakeBody1.create();
    this.pos.push = ([1, 0]); //存储蛇身1的坐标

    //创建蛇尾
    var snakeBody2 = new Square(0, 0, 'snakeBody');
    snakeBody2.create();
    this.tail = snakeBody2; //存储蛇尾信息
    this.pos.push = ([0, 0]);

    //形成链表关系
    snakeHead.last = null; //last代表蛇头的右侧 没有方块表示null没有链表
    snakeHead.next = snakeBody1;

    snakeBody1.last = snakeHead;
    snakeBody1.next = snakeBody2;

    snakeBody2.last = snakeBody1;
    snakeBody2.next = null;

    //初始化时给蛇添加一个默认方向通过添加一条属性用来表示蛇走的方向

    this.direction = this.directionNum.right;//默认让蛇往右走

};
//这个方法用来获取蛇头下一个位置对应的元素，要根据元素做不同的判断
Snake.prototype.getNextPos = function () {
    var nextPos = [
        //蛇头要走的下一个点的坐标
        //这里要用1,0的坐标 要和方向去运算出该加1还是减1
        this.head.x / sw + this.direction.x,
        this.head.y / sh + this.direction.y
    ]

    // 判断下一个坐标点发生的事件
    // 1.撞到自己要 game over

    var selfCollied = false;	//是否撞到了自己
    this.pos.forEach(function (value) {
        if (value[0] == nextPos[0] && value[1] == nextPos[1]) {
            //如果数组中的两个数据都相等，就说明下一个点在蛇身上里面能找到，代表撞到自己了
            selfCollied = true;
        }
    });
    if (selfCollied) {
        console.log('撞到自己了！');

        this.strategies.die.call(this);

        return;
    }
    //2.下个点是围墙 game over
    if (nextPos[0] < 0 || nextPos[1] < 0 || nextPos[0] > td - 1 || nextPos[1] > tr - 1) {

        this.strategies.die.call(this);
        return;
    }
    //3.下个点是食物 要增加自身方块的长度个数

    if(food && food.pos[0]==nextPos[0] && food.pos[1]==nextPos[1]){
        //如果这个条件成立说明蛇头要走的下一个点是食物的那个点
        this.strategies.eat.call(this);
        return;
   }
    //4.下个点什么都没有 继续走

    this.strategies.move.call(this);
};
//处理碰撞后要做的事
Snake.prototype.strategies = {
    move: function (format) { //这个参数用于决定要不要删除蛇尾 当传了这个参数后就表示要做的事情是吃
        var newBody = new Square(this.head.x / sw, this.head.y / sh, 'snakeBody');

        //更新链表的关系 无法直接找到Body1 通过找到蛇头在找到Body1
        newBody.next = this.head.next;
        newBody.next.last = newBody;        // newBody 左边表示Body1.last  就是Body1的右边也就是自身
        newBody.last = null;                //还没有添加新蛇头所以是null
        this.head.remove();                 //把旧蛇头从原来的位置删除
        newBody.create();                   //把新的身体放在旧蛇头的位置

        //创建新蛇头 (蛇头下一个要走的点)
        var newHead = new Square(this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y, 'snakeHead');


        //更新链表关系
        newHead.next = newBody;
        newHead.last = null;
        newBody.last = newHead;
        newHHead.viewContent.style.transform='rotate('+this.direction.rotate+'deg)';
        newHead.create();
        //蛇身每一个方块的坐标要更新 this.pos[]


        this.pos.splice(0, 0, [this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y]);
        this.head = newHead; //更新this.head信息
        //第0位开始替换0个也就是插入一个 

        if (!format) {//如果format为false表示需要删除(除了吃之外的操作)
            this.tail.remove();
            this.tail = this.tail.last; //snakeBody2的last
            this.pos.pop(); //数组的方法把最后一位删除


        }


    },
    eat: function () {
        this.strategies.move.call(this, true);
        createFood();
        game.score++;

    },
    die: function () {
        // console.log('die')
        game.over();
    }

}
snake = new Snake();

// 创建食物
function createFood() {
    //食物的小方块的随机坐标
    var x = null;
    var y = null;

    var include = true; //循环跳出的条件，true表示食物的坐标在蛇身上 继续让它循环 false表示食物的坐标不在蛇身上，表示不循环
    while (include) {
        x = Math.round(Math.random() * (td - 1));
        y = Math.round(Math.random() * (tr - 1));


        snake.pos.forEach(function (value) {
            if (x != value[0] && y != value[1]) {
                //这个条件成立说明随机出来的坐标在蛇的身上并没有找到
                include = false;
            }
        });


    }
    //生成食物
    food=new Square(x,y,'food');
    food.pos=[x,y]; //存储一下生成食物的坐标，用于跟蛇头要走的下一个点做对比
    var foodDom=document.querySelector('food'); //单粒设计模式不需要移除添加只需要改变left和top值
    if(foodDom){
        foodDom.style.left=x*sw+'px';
        foodDom.style.top=y*sh+'px';

    }else{
        food.create();
    }

}

//创建游戏的实例
function Game() {

    this.timer = null;
    this.score = 0;
}
Game.prototype.init = function () {
    snake.init();
    // snake.getNextPos();
    createFood();

    document.onkeydown=function(ev){
        if(ev.which==37 && snake.direction!=snake.directionNum.right){ //用户按下左键的时候这条蛇不能是正在向右边走
            snake.direction=snake.directionNum.left;
        }else if(ev.which==38 && snake.direction!=snake.directionNum.down){
            snake.direction=snake.directionNum.up;
        }else if(ev.which==39 && snake.direction!=snake.directionNum.left){
            snake.direction=snake.directionNum.right;
        }else if(ev.which==40 && snake.direction!=snake.directionNum.up){
            snake.direction=snake.directionNum.down;
        }
    }

    this.start();
}
Game.prototype.start=function(){ //开始游戏
    this.timer=setInterval(function(){
        snake.getNextPos();
    },200);

}
Game.prototype.pause=function(){
    clearInterval(this.timer);
}
Game.prototype.over=function(){
    clearInterval(this.timer);
    alert('你的得分为：'+this.score);

    //游戏回到最初始状态
    var snakeWrap=document.getElementById('snakeWrap');
    snakeWrap.innerHTML='';
    snake=new Snake();
    game=new Game();

    var startBtnWrap=document.querySelector('startBtn');
    startBtnWrap.style.display='block';
}
//开启游戏
game=new Game();
var startBtn= document.querySelector('.startBtn button');
startBtn.onclick=function(){
    startBtn.parentNode.style.display='none';
    game.init();

}
//暂停
var snakeWrap=document.getElementById('snakeWrap');
var pauseBtn=document.querySelector('pauseBtn button');
snakeWrap.onclick=function(){
    game.pause();
    pauseBtn.parentNode.style.display='block'
}

pauseBtn.onclick=function(){
    game.start();
    pauseBtn.parentNode.style.display='none';
}