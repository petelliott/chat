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
    } else if (data.type == "reciveerror") {
        console.log(data.message);
    } else if (data.type == "roomid") {
        localStorage.setItem("room", data.room);
    }
}

function getMessages(evt) {
    var data = JSON.parse(evt.data);
    console.log(evt.data);

    if (data.type == "reciveerror") {
        console.log(data.message);
        signin();
    }

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
    $("#chat").animate({
        scrollTop: $('#chat').height()
    }, 1000);
    doMathjax();
}

function signin() {
    localStorage.setItem("name", null);

    $("#chatbar").css("filter", "blur(6px)");
    $("#signin").css("visibility", "visible");
    $("#inp").prop('disabled', true);

    ws.onmessage = getTok;
}

function setname() {
    if ($("#inpname").val() != "") {
        name = $("#inpname").val();
        ws.send(JSON.stringify({
            "type": "signin",
            "username": name,
            "room": $("#inproomname").val(),
            "passwd": $("#inproompass").val()
        }));
        localStorage.setItem("name", name);

        $("#chatbar").css("filter", "");
        $("#signin").css("visibility", "hidden");
        $("#inp").prop('disabled', false);
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

    if ($("#inp").val() != "") {
        ws.send(JSON.stringify({
            "mess": $("#inp").val(),
            "type": "msg",
            "room": localStorage.getItem("room"),
            "tok": localStorage.getItem("tok"),
            "size": sizes[document.getElementById("sizepicker").value]
        }));
        $("#inp").val("");
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

document.onkeydown = function(e) { // bind enter to submit
    e = e || window.event;
    e = e.which || e.KeyCode;

    if (e == 13) {
        repeatMessageIndex = 0;
        submit();
    }
};
var repeatMessageIndex = 0;
$(document).keydown(function(e) {
    switch (e.which) {
        case 38:
            repeatMessageIndex++;
            if ($("#chat article:nth-last-child(" + repeatMessageIndex + ")").text() != "")
                $("#inp").val($("#chat article:nth-last-child(" + repeatMessageIndex + ")").text());
            e.preventDefault();
            break;
        case 40:
            repeatMessageIndex--;
            if ($("#chat article:nth-last-child(" + repeatMessageIndex + ")").text() != "")
                $("#inp").val($("#chat article:nth-last-child(" + repeatMessageIndex + ")").text());
            e.preventDefault();
            break;
    }
});
