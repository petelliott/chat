var ws = new WebSocket("ws://"+window.location.host+"/websocket");

var name = localStorage.getItem("name") || "guest";
var recentname = null;

ws.onmessage = function (evt) {
    var Mname = evt.data.substr(0,evt.data.indexOf(':'));
    var Mdat = evt.data.substr(evt.data.indexOf(':')+1);
    var element = document.getElementById("chat");

    var article = document.createElement("article");
    article.className = "message"

    if (recentname != Mname) { //only use name if its a different user
        var head = document.createElement("h3");
        var name_node = document.createTextNode(Mname);
        head.appendChild(name_node);
        head.className = "name";
        article.appendChild(head);
        recentname = Mname;
    }

    if (Mdat.indexOf("@"+name) != -1) { //highlight @name mentions
        article.className += " mention"
    }
    article = doMentions(article, Mdat)

    element.appendChild(article);

    window.scrollTo(0,document.body.scrollHeight);
};

function doMentions(element, str){
    str = str.split(" ");
    var para = document.createElement("p");

    for (var i = 0; i < str.length; i++) {
        if (str[i].substring(0,1) == "@") {
            var span = document.createElement("span");
            var node = document.createTextNode(str[i]+" ");

            span.appendChild(node);
            span.className = "color";
            para.appendChild(span);
        } else {
            var node = document.createTextNode(str[i]+" ");
            para.appendChild(node);
        }
    }

    element.appendChild(para);
    return element;
}

function submit() {
    var inp = document.getElementById("inp")
    if (inp.value != "") {
        ws.send(name+":"+inp.value);
        inp.value = ""
    }
}

window.onbeforeunload = function() {
    ws.close()
};

document.onkeypress = function (e) {
    e = e || window.event;
    e = e.which || e.KeyCode
    if (e == 13) {
        submit();
    }
};
