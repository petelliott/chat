var ws = new WebSocket("ws://"+window.location.host+"/websocket");


window.onload = function() {
    if (localStorage.getItem("name") === null) {
        signIn();
    }
}


ws.onmessage = function(evt) {
    var Mname = evt.data.substr(0,evt.data.indexOf(':'));
    var Mdat = evt.data.substr(evt.data.indexOf(':')+1);
    var element = document.getElementById("chat");

    var dom_message = document.createElement("article");
    dom_message.className = "message";

    if (this.recentname != Mname) { //only use name if its a different user
        let head = document.createElement("h3");
        let name_node = document.createTextNode(Mname);
        head.appendChild(name_node);
        head.className = "name";
        dom_message.appendChild(head);
        this.recentname = Mname;
    }

    if (Mdat.indexOf("@"+name) != -1) { //highlight @name mentions
        dom_message.className += " mention"
    }

    dom_message = doMentions(dom_message, Mdat);

    element.appendChild(dom_message);
    window.scrollTo(0,document.body.scrollHeight);
    doMathjax();
};


function doMentions(element, str){
    str = str.split(" ");
    var para = document.createElement("p");

    for (var i = 0; i < str.length; i++) {
        if (str[i].substring(0,1) == "@") {
            let span = document.createElement("span");
            let node = document.createTextNode(str[i]+" ");

            span.appendChild(node);
            span.className = "color";
            para.appendChild(span);
        } else {
            let node = document.createTextNode(str[i]+" ");
            para.appendChild(node);
        }
    }

    element.appendChild(para);
    return element;
}


function submit() {
    var inp = document.getElementById("inp");

    if (inp.value != "") {
        ws.send(name + ":" + inp.value);
        inp.value = "";
    }
}


function signIn() {
    var signbox = document.getElementById("signin");
    var chatbox = document.getElementById("chatbar");
    var chatbar = document.getElementById("inp");

    chatbox.style.filter = "blur(6px)";
    signbox.style.visibility = "visible";
    chatbar.disabled = true;
}


function setName() {
    var inpname = document.getElementById("inpname");

    if (inpname.value != "") {
        name = inpname.value;
        localStorage.setItem("name", name);

        var signbox = document.getElementById("signin");
        var chatbox = document.getElementById("chatbar");
        var chatbar = document.getElementById("inp");

        chatbox.style.filter = "";
        signbox.style.visibility = "hidden";
        chatbar.disabled = false;
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
