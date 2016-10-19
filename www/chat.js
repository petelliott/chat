var ws = new WebSocket("ws://" + window.location.host + "/websocket");


var recentname = null;

window.onload = function() {
    if (localStorage.getItem("name") === null) {
        signin();
    }
}
const sizes = ['xx-small', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large'];

ws.onmessage = function(evt) {
    var data = evt.data.split(":");
    var Mname = data[0];
    var Mdat = data[1];
    var Msize = data[2];
    var element = document.getElementById("chat");

    var article = document.createElement("article");
    article.className = "message";

    if (recentname != Mname) { //only use name if its a different user
        var head = document.createElement("h3");
        var name_node = document.createTextNode(Mname);
        head.appendChild(name_node);
        head.className = "name";
        article.appendChild(head);
        recentname = Mname;
    }

    if (Mdat.indexOf("@" + name) != -1) { //highlight @name mentions
        article.className += " mention"
    }

    article = doMentions(article, Mdat, Msize);
    element.appendChild(article);
    window.scrollTo(0, document.body.scrollHeight);
    doMathjax();
};

function signin() {
    var signbox = document.getElementById("signin");
    var chatbox = document.getElementById("chatbar");
    var chatbar = document.getElementById("inp");

    chatbox.style.filter = "blur(6px)";
    signbox.style.visibility = "visible";
    chatbar.disabled = true;
}

function setname() {
    var inpname = document.getElementById("inpname");

    if (inpname.value != "") {
        name = inpname.value;
        localStorage.setItem("name",name);
        
        var signbox = document.getElementById("signin");
        var chatbox = document.getElementById("chatbar");
        var chatbar = document.getElementById("inp");

        chatbox.style.filter = "";
        signbox.style.visibility = "hidden";
        chatbar.disabled = false;
    }
}

function doMentions(element, str, size) {
    str = str.split(" ");
    var para = document.createElement("p");
    para.style.cssText = "font-size:" + size + ";";

    for (var i = 0; i < str.length; i++) {
        if (str[i].substring(0, 1) == "@") {
            let span = document.createElement("span");
            let node = document.createTextNode(str[i] + " ");

            span.appendChild(node);
            span.className = "color";
            para.appendChild(span);
        } else {
            let node = document.createTextNode(str[i] + " ");
            para.appendChild(node);
        }
    }
    element.appendChild(para);
    return element;
}


function submit() {
    var inp = document.getElementById("inp");
    console.log(sizes[document.getElementById("sizepicker").value]);
    if (inp.value != "") {
        ws.send(name + ":" + inp.value + ":" + sizes[document.getElementById("sizepicker").value]);
        inp.value = "";
    }
}


function doMathjax() {
    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
}


window.onbeforeunload = function() {
    ws.close();
};


document.onkeypress = function(e) { // bind enter to submit
    e = e || window.event;
    e = e.which || e.KeyCode;

    if (e == 13) {
        submit();
    }
};
