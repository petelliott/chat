var ws = new WebSocket("ws://" + window.location.host + "/websocket");


var recentname = null;

window.onload = signin;

const sizes = ['xx-small', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large'];


function getTok(evt) {
    var data = JSON.parse(evt.data);
    console.log(evt.data);

    if (data.type == "tok") {
        localStorage.setItem("tok", data.tok);
        ws.onmessage = getMessages;
    } else if (data.type == "rejectedname") {
        alert("That username can not be used");
        signin();
    } else if (data.type == "roomnotfound") {
        alert("That room could not be found");
        signin();
    } else if(data.type == "reciveerror"){
        console.log(data.message);
    } else if(data.type == "roomid"){
      localStorage.setItem("room", data.room);
    }
}

function getMessages(evt) {
    var data = JSON.parse(evt.data);
    console.log(evt.data);``

    var element = document.getElementById("chat");

    var article = document.createElement("article");
    article.className = "message";

    if (recentname != data.username) { //only use name if its a different user
        var head = document.createElement("h3");
        var name_node = document.createTextNode(data.username);
        head.appendChild(name_node);
        head.className = "name";
        article.appendChild(head);
        recentname = data.username;
    }

    if (data.mess.indexOf("@" + localStorage.getItem("name")) != -1) { //highlight @name mentions
        article.className += " mention"
    }

    article = doMentions(article, emojione.shortnameToUnicode(data.mess), data.size);
    element.appendChild(article);
    var chat = document.getElementById("chat");
    chat.scrollTop = chat.scrollHeight;
    doMathjax();
}

function signin() {
    localStorage.setItem("name", null);

    var signbox = document.getElementById("signin");
    var chatbox = document.getElementById("chatbar");
    var chatbar = document.getElementById("inp");

    chatbox.style.filter = "blur(6px)";
    signbox.style.visibility = "visible";
    chatbar.disabled = true;

    ws.onmessage = getTok;
}

function setname() {
    var inpname = document.getElementById("inpname");
    var rm = document.getElementById("inproomname");
    var pw = document.getElementById("inproompass");

    if (inpname.value != "") {
        name = inpname.value;
        ws.send(JSON.stringify({
            "type": "signin",
            "username": name,
            "room": rm.value,
            "passwd": pw.value
        }));
        localStorage.setItem("name", name);
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

    if (inp.value != "") {
        ws.send(JSON.stringify({
            "mess": inp.value,
            "type": "msg",
            "room": localStorage.getItem("room"),
            "tok": localStorage.getItem("tok"),
            "size": sizes[document.getElementById("sizepicker").value]
        }));
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
