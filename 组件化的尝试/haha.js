// 事件注册函数,兼容IE8
var addEvent = document.addEventListener ?
        function(ele,type,listener,useCapture){
          ele.addEventListener(type,listener,useCapture);
        }:
        function(ele,type,listener){
          ele.attachEvent('on'+type,listener);
        };
  // 将HTML转换为节点
function html2node(str){
  var container = document.createElement('div');
  container.innerHTML = str;
  return container.children[0];
}
// setTimeout,setInterval关于'this'的问题.
// 直接setInterval.call(this,this.func,1000)会报错,setInterval运行环境中的this还是指向window
// MDN给出了解决方案
// 代码来源:https://developer.mozilla.org/zh-CN/docs/Web/API/Window/setInterval
// var __nativeST__ = window.setTimeout, __nativeSI__ = window.setInterval;

// window.setTimeout = function (vCallback, nDelay /*, argumentToPass1, argumentToPass2, etc. */) {
//   var oThis = this, aArgs = Array.prototype.slice.call(arguments, 2);
//   return __nativeST__(vCallback instanceof Function ? function () {
//     vCallback.apply(oThis, aArgs);
//   } : vCallback, nDelay);
// };

// window.setInterval = function (vCallback, nDelay /*, argumentToPass1, argumentToPass2, etc. */) {
//   var oThis = this, aArgs = Array.prototype.slice.call(arguments, 2);
//   return __nativeSI__(vCallback instanceof Function ? function () {
//     vCallback.apply(oThis, aArgs);
//   } : vCallback, nDelay);
// };

// 赋值属性
// extend({a:1}, {b:1, a:2}) -> {a:1, b:1}
function extend(o1, o2){
  for(var i in o2) if(typeof o1[i] === 'undefined'){
    o1[i] = o2[i]
  } 
  return o1
}
/**
 * [Ajax get请求封装]
 * @param  {Str}   url      [请求地址]
 * @param  {Obj}   options  [请求参数]
 * @param  {Function} callback [执行回调函数]
 */
function get(url,options,callback){
  function serialize(options){
    if(!options) return '';
    var pairs = [];
    for(var name in options){
      if(!options.hasOwnProperty(name)) continue;
      if(typeof options[name] === 'function') continue;
      var value = options[name].toString();
      name = encodeURIComponent(name);
      value = encodeURIComponent(value);
      pairs.push(name + '=' + value);
    }
    return pairs.join('&');
      }
  var xhr = new XMLHttpRequest;
  xhr.onreadystatechange = function(){
    if(xhr.readyState == 4){
      if((xhr.status >= 200 && xhr.status<300) || (xhr.status == 304 )){
        callback(JSON.parse(xhr.responseText));
      }
    }
  }
  xhr.open('get',url + '?' + serialize(options),true);
  xhr.send(null);
}

// course课程模块
// ----
   
var templateC = 
  "<li class='u-course'>\
    <a class='img'>\
      <img width = '223px' height = '124px'>\
      <div class='detail'>\
       <div class='top f-cb'>\
          <img class='dimg' width = '223px' height = '124px'>\
          <div class='content'>\
            <div class='dttl'></div>\
            <div class='dlcount icn'></div>\
            <div class='dprv'></div>\
            <div class='dcategory'></div>\
          </div>\
        </div>\
        <div class='descr'></div>\
      </div>\
    </a>\
  <div class='ttl'></div>\
  <div class='prv'></div>\
  <div class='lcount icn'></div>\
  <div class='price'></div>\
  </li>";

function Course(options){

  options = options || {};
  // 主容器
  this.container = document.querySelector(".m-courselist");
  // 当前页课程数
  this.coursecount = this.container.getElementsByClassName("u-course");
  // 页码器
  this.page = document.querySelector(".m-page"),
  // 页数
  this.pagecount = document.getElementsByClassName("pageindex");

  extend(this,options);

  this._initEvent();

}



extend(Course.prototype,{

  _layout: html2node(templateC),
  // 增加课程
  addcourse:function(i){

    this.container.appendChild(this._layout.cloneNode(true));
    this.setcourse(i);

  },
  // 设置课程样式
  setcourse:function(i){
    var s = this.container.children[i],
        l = this.list[i];
    s.children[0].firstElementChild.src = l.middlePhotoUrl;
    s.children[0].lastElementChild.firstElementChild.children[0].src = l.middlePhotoUrl;
    s.children[0].lastElementChild.firstElementChild.lastElementChild.children[0].textContent = l.name;
    s.children[0].lastElementChild.firstElementChild.lastElementChild.children[1].textContent = l.learnerCount + "人在学"
    s.children[0].lastElementChild.firstElementChild.lastElementChild.children[2].textContent = "发布者:" + l.provider;
    s.children[0].lastElementChild.firstElementChild.lastElementChild.children[3].textContent = "分类:" + (l.categoryName?l.categoryName:"无");
    s.children[0].lastElementChild.lastElementChild.textContent = l.description;
    s.children[1].textContent = l.name
    s.children[2].innerHTML = l.provider;
    s.children[3].innerHTML = l.learnerCount;
    s.children[4].innerHTML = l.price == 0? "免费" : '￥'+ l.price;
  },
  // 页码器
  pager:function(event){
    if(event.target.tagName == "LI"){
      var index = Number(event.target.dataset.index),
          pageNo = data.pageNo;

      // -1为上一页,0为下一页
      switch(index){
        case -1:
          if(pageNo>1){
            data.pageNo = data.pageNo - 1;
            get(url,data,function(obj){
              extend(obj,data)
              list = new Course(obj)
            })
          }
        
        break;
        case 0:
          if(pageNo<list.totalPage){
            data.pageNo += 1;
            get(url,data,function(obj){
              extend(obj,data);
              list = new Course(obj);
            })
          }
        
        break;
        default:
          if(index>0 && index != pageNo){
            data.pageNo = index;
            get(url,data,function(obj){
              extend(obj,data);
              list = new Course(obj);
            })
          }
      }
    }
  },

  // 初始化事件,根据现有的课程数和获取到的课程数来增删/设置课程
  _initEvent:function(){
    var clength = this.coursecount.length,
        llength = this.list.length;
    if(clength == 0){
      for(var i = 0,length=llength;i<length;i++){
        this.addcourse(i);
      }
    }else if(clength == llength){
      for(var i = 0,length=llength;i<length;i++){
        this.setcourse(i)
      }
    }else if(clength>llength){
      for(var i = 0,length=llength;i<length;i++){
        this.setcourse(i)
      }
      for(var i=llength,length=clength;i<length;i++){
        this.container.removeChild(this.container.lastElementChild)
      }
    }else{
      for(var i = 0;i<clength;i++){
        this.setcourse(i)
      }
      for(var i=clength;i<llength;i++){
        this.addcourse(i);
      }
    }
    // 设置页码数
    if(this.pagecount.length == 0){
      for(var i=0 ,length = this.totalPage;i<length;i++){
        var pageindex = document.createElement("li");
        (i+1) == this.pageNo ? pageindex.className = "pageindex z-sel" : pageindex.className = "pageindex";
        pageindex.setAttribute("data-index",i+1);
        pageindex.innerHTML = i+1 ;
        this.page.insertBefore(pageindex,this.page.lastElementChild);
        /**  对页码器进行事件代理
             这里有个疑问,原想法
             this.pager.bind(this);addEvent(this.page,"click",this)
             当点击翻页或页码时,会执行2次pager,还请老师解答一下 **/
        addEvent(this.page,"click",this.pager);
        // 注册tab的点击事件
        var coursetab = document.getElementsByClassName("u-tab");
        addEvent(coursetab[0].firstElementChild,"click",function(){
          data.type = 10;
          data.pageNo = 1;
          coursetab[0].firstElementChild.className = "z-sel";
          coursetab[0].lastElementChild.className = "";
          get(url,data,function(obj){
            extend(obj,data)
            list = new Course(obj)
          });
        });
        addEvent(coursetab[0].lastElementChild,"click",function(){
          data.type = 20;
          data.pageNo = 1;
          coursetab[0].lastElementChild.className = "z-sel";
          coursetab[0].firstElementChild.className = "";
          get(url,data,function(obj){
            extend(obj,data)
            list = new Course(obj);
          });
        })
  
      }
    }
    // 设置页码状态
    for(i=0;i<this.totalPage;i++){
      (i+1) == this.pageNo ? this.pagecount[i].className = "pageindex z-sel" : this.pagecount[i].className = "pageindex";
    }
  }
})

// 热门课程模块
//
var templateHotC = "<li class=u-hot f-cb>\
                    <img width='50px' height='50px'>\
                    <div>\
                      <div class='cttl'></div>\
                      <div class='lcount icn'></div>\
                    </div>\
                  </li>";

function Hotcourse(options){
  options = options || {};
  // 将返回的数组放入list中,再放入Hotcourse
  this.list = [];

  extend(this.list,options);

  this.container = document.querySelector(".hot").children[0];

  this.supcontainer = this.container.parentNode;

  this._mt = 0;

  this._initEvent();

}

extend(Hotcourse.prototype,{

  _layout:html2node(templateHotC),
  // 设置课程样式
  setcourse:function(i){

    this.container.children[i].firstElementChild.src = this.list[i].smallPhotoUrl;

    this.container.children[i].lastElementChild.firstElementChild.textContent = this.list[i].name;

    this.container.children[i].lastElementChild.lastElementChild.textContent = this.list[i].learnerCount;
  },
  // 滚动排行榜
  scroll:function(){

    if(this._mt == -1400){
      this._mt = 0;

      this.container.style.cssText = "";
      // 通过获取位置属性来清除浏览器对样式的缓存
      // 代码来源:https://segmentfault.com/q/1010000008720117,我自己的提问.
      this.container.offsetHeight;
    }

    this._mt += -70;

    var str = "margin-top:"+this._mt +"px;" + "transition-property:margin-top;transition-duration:1s;transition-timing-function:linear";
    
    this.container.style.cssText = str;

  },
  // 开始滚动
  start:function(){
    this.timer = setInterval(this.scroll.bind(this),5000)
  },
  // 停止
  stop:function(){
    clearInterval(this.timer);
  },
  // 初始化事件
  _initEvent:function(){
    // 调用Course的addcourse函数
    for(var i = 0,length=this.list.length;i<length;i++){
      list.addcourse.call(this,i)
    }
    // 克隆一个节点,用于后期滚动
    this.supcontainer.appendChild(this.container.cloneNode(true));

    this.start();

    addEvent(this.supcontainer,"mouseover",this.stop.bind(this))
  }

})

// slider
// 
var templateS = "<div class='m-slider'>\
                  <img class='slide'>\
                  <div class='pointer'>\
                    <i class='u-p' data-index='1'></i>\
                    <i class='u-p' data-index='2'></i>\
                    <i class='u-p' data-index='3'></i>\
                  </div>\
                </div>"
function Slider(options){
  extend(this,options);

  options = options || {};

  this.container = this.container || document.body;

  this.slider = this._layout.cloneNode(true);

  this.slides = this.slider.querySelector(".slide");

  this.pointer = this.slider.querySelector(".pointer")

  this.pointes = this.slider.querySelectorAll(".u-p");

  this.pageNum = this.images.length;
  // 判断pageindex是否合法/输入,默认为1
  this.pageindex = (0<this.pageindex && this.pageindex<this.pageNum +1)? this.pageindex : 1;

  this.container.appendChild(this.slider);

  this._initEvent();
}

extend(Slider.prototype,{

  _layout:html2node(templateS),

  change:function(){
    index = this.pageindex;
    index ++;
    index >3?index=1:index=index;
    for(var i = 0,length=this.pageNum;i<length;i++){
      this.pointes[i].className = "u-p";
    }
    // 当前"圆点"添加"z-crt"类名
    this.pointes[index-1].className += " z-crt";
    // 改变src,实现轮播
    this.slides.src = this.images[index-1];
    // 淡入效果
    this.slides.style.cssText = "opacity:0;";

    this.slides.offsetHeight;

    this.slides.style.cssText = "opacity:1;transition-property:opacity;transition-duration:0.5s;transition-timing-function:ease-in;"

    this.pageindex = index;
  },
  // 开始轮播
  start:function(){
    this.timer = setInterval(this.change.bind(this),5000)
  },
  // 停止轮播
  stop:function(){
    clearInterval(this.timer);
  },
  // 初始化,设置'首页'图片以及对应"圆点"样式,开始轮播
  _initEvent:function(){
    this.slides.src = this.images[this.pageindex-1];
    this.pointes[this.pageindex-1].className+=" z-crt";
    this.start();
  }
})

// 登录Modal
// 
var templateL = 
  "<div class='m-login'>\
    <div class='align'></div>\
    <div class='wrap'>\
      <form class='form' name='loginForm'>\
        <div class='u-ttl'>登录网易云课堂</div>\
        <div class='icn'></div>\
        <input id='account' name='name' type='text' placeholder='账号''>\
        <input id = 'password' name='password' type='password' placeholder='密码'>\
        <div class='msg'>111</div>\
        <button class='loginbtn'>登录</button>\
       </form>\
     </div>\
   </div>";

function Login(){
  this.container = this._layout.cloneNode(true)

  this.form = this.container.querySelector(".form");

  this.cls = this.form.children[1];

  this._initEvent();
}

extend(Login.prototype,{
  _layout:html2node(templateL),

  show:function(){
    document.body.appendChild(this.container);
  },

  hide:function(){
    document.body.removeChild(this.container);
  },

  _initEvent:function(){
    addEvent(this.form,"submit",function(e){
      e.preventDefault();
      var account = hex_md5(this.account.value),
          pswd = hex_md5(this.password.value),
          url = "http://study.163.com/webDev/login.htm",
          data = {userName:account,password:pswd};

      get(url,data,function(num){
        try{
          if(num==1){
            this.hide();
            document.cookie = "loginSuc=1";
            document.cookie = "followSuc=1";
            // follow.style.display = "none";
            // followed.style.display = "block";
            follow.status_un();
          }else if(num==0){
            alert("账号/密码错误")
          }
        }catch(ex){
          //
        }
      }.bind(this))
    });

    addEvent(this.cls,"click",this.hide.bind(this));
  },

})


// 关注模块
// 
var templateFo = 
"<div class='u-follow'>\
  <div id='follow' class='icn'>关注</div>\
  <div class='followed'>\
    <div class='icn'></div>已关注<span class='cancel'>| <span class='unfollow'>取消</span></span>\
  </div>\
  <span>粉丝 45</span>\
</div>"

function Follow(){
  this.container = this._layout.cloneNode(true);

  this.follow = this.container.firstElementChild;

  this.followed = this.container.children[1];

  this.unfollow = this.followed.querySelector(".unfollow");

  this._initEvent();

  document.getElementsByClassName("m-ct f-cb")[0].insertBefore(this.container,document.querySelector(".links"))
}

extend(Follow.prototype,{
  _layout:html2node(templateFo),

  status_ava:function(){
    this.follow.style.display = "inline-block";
    this.followed.style.display = "none";
  },

  status_un:function(){
    this.follow.style.display = "none";
    this.followed.style.display = "block";
  },

  _initEvent:function(){
    if(document.cookie.indexOf("loginSuc=") != -1){
      if(document.cookie.indexOf("followSuc=") != -1){
        this.status_un();
      }
    }
    addEvent(this.unfollow,"click",function(){
    document.cookie = "followSuc=1; max-age=0;"
    this.status_ava();
    }.bind(this));

    addEvent(this.follow,"click",function(){
      if(document.cookie.indexOf("loginSuc=")==-1){
        login.show();
      }else{
        var url = "http://study.163.com/webDev/attention.htm";
        get(url,"",function(num){
          try{
            if(num==1){
              document.cookie = "followSuc=1";
              this.status_un();
            }
          }catch(ex){
            //
          }
        }.bind(this));
      }
    }.bind(this));
  }
})

var templateVModal = 
"<div class='m-vct'>\
  <div class='zttl'>遇见更好的自己</div>\
  <div class='zcls'></div>\
  <div class='u-playbtn'></div>\
  <video src='http://mov.bn.netease.com/open-movie/nos/mp4/2014/12/30/SADQ86F5S_shd.mp4'  autoplay='autoplay' width='889' height='537'></video>\
</div>"

function VModal(options){
  extend(this,options);

  // this.container = document.body;

  this.container = this._layout.cloneNode(true);

  this.mask = document.createElement("div");

  this.mask.className = "f-mask";

  this.cls = this.container.querySelector(".zcls");

  this.playbtn = this.container.querySelector(".u-playbtn");

  this.vcontent = this.container.getElementsByTagName("video")[0];

  this._initEvent();
}

extend(VModal.prototype,{
  _layout:html2node(templateVModal),

  show:function(){
    document.body.appendChild(this.container);

    document.body.appendChild(this.mask);
  },

  hide:function(){
    document.body.removeChild(this.container);


    document.body.removeChild(this.mask);
  },

  play:function(){
    this.vcontent.play();
    this.playbtn.style.display = "none";
  },

  pause:function(){
    this.vcontent.pause();
    this.playbtn.style.display = "block";
  },

  judge:function(){
    if(this.vcontent.paused){
      this.play()
    }else {this.pause()}
  },

  _initEvent:function(){

    addEvent(this.cls,"click",this.hide.bind(this));

    addEvent(this.mask,"click",this.hide.bind(this));

    addEvent(this.vcontent,"click",this.judge.bind(this));

    this.show();
  }
})