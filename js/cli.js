/*
    Copyright (C) 2019 Eric Qian.
    <https://enumc.com/>
    All rights reserved. 
*/

console.log("CLI loading stated.");
window.scrollTo(0, 0);

if (typeof commandData == "undefined") {
    let commandData = {};
}
try {
    initCLI();
}
catch (err) {
    $("#cli-container").html("<p class='cli-text'>CLI initialization error: " + err + ".</p>" +
        "<p class='cli-text'>Please report this issue with the abovementioned error message here: \n<a href='https://github.com/EnumC/EnumC.com/issues'>https://github.com/EnumC/EnumC.com/issues</a></p>");
    throw new Error("CLI initialization error: " + err);
}

/* Add HTML content to log. */
function addLog(content) {
    $('.log').append(content);
    logContent.push(content);
    window.scrollTo(0, document.body.scrollHeight);
}

/* Recursive method to type text to log with delay between each character.
   content:     HTML content
   delayTime:   Delay between character in ms
*/
function typeText(content, delayTime, isInProg, inProgObj) {

    if (isInProg != true) {
        var typingElement = $('<pre class="cli-text" style="overflow: visible; line-height: 0.5em;"></pre>');
        var typingElementComplete = $('<pre class="cli-text" style="overflow: visible; line-height: 0.5em;"></pre>').html(content);
        logContent.push(typingElementComplete);
        $('.log').append(typingElement);
    }
    else {
        var typingElement = inProgObj;
    }
    if (content.length === 0) {
        return;
    }
    
    setTimeout(function () {
        typingElement.html(typingElement.html() + content.charAt(0));
        content = content.substr(1);
        typeText(content, delayTime, true, typingElement);
        
    }, delayTime);
}

function setCookie(cookieName, cookieValue, expiryInDays) {
    var expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() + (expiryInDays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + expiryDate.toUTCString();
    document.cookie = cookieName + "=" + cookieValue + ";" + expires + ";path=/";
}

function getCookie(cookieName) {
    var name = cookieName + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function onMD5In(inputFile) {
    addLog("<div class='cli-text'id='md5PendingProgressText'>Parsing. Please wait.</div><progress id='md5PendingProgressBar'></progress>");
    console.log(inputFile);
    var progBar = document.getElementById("md5PendingProgressBar");

    var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
        file = inputFile.files[0],
        chunkSize = 2097152,                             // Read in chunks of 2MB
        chunks = Math.ceil(file.size / chunkSize),
        currentChunk = 0,
        spark = new SparkMD5.ArrayBuffer(),
        fileReader = new FileReader();

        progBar.max = chunks;

    fileReader.onload = function (e) {
        progBar.value = currentChunk;
        console.log('read chunk nr', currentChunk + 1, 'of', chunks);
        spark.append(e.target.result);                   // Append array buffer
        currentChunk++;

        if (currentChunk < chunks) {
            loadNext();
        } else {
            console.log('finished loading');
            // console.info('computed hash', spark.end());  // Compute hash
            $('#md5PendingProgressText').remove();
            $("#md5PendingProgressBar").remove();
            addLog("<div class='cli-text'>" + inputFile.files[0].name + " -> " + 
                    "MD5 -> " + spark.end().toUpperCase() + "</div>");
            $("#md5Input").remove();
        }
    };

    fileReader.onerror = function () {
        console.warn('oops, something went wrong.');
    };

    function loadNext() {
        var start = currentChunk * chunkSize,
            end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;

        fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
    }

    loadNext();

    
}

function commandHandler(command, args, directoriesAndFiles) {
    try {
            addLog("$ [" + currentDirectory + "] " + command + " " + args + "<br>");
            switch (command) {
                case "help":
                    addLog('<div class="cli-text">available commands: </div><br><div class="cli-text">cd, ls, open, echo, fetch, time, man, ping, pwd, login, su, whoami, md5, clear, exit</div>');
                    break;
                case "cd": {

                
                    console.log("dir requested: " + args.trim());

                    if (args.trim().toUpperCase() == "..") {
                        currentDirectory = "/";
                    }
                    else if ((args.trim().toUpperCase() in directoriesAndFiles)) {
                        currentDirectory = args.toUpperCase();
                    }
                    else {
                        let files = directoriesAndFiles[currentDirectory].split("\n");
                        let fileFound = false;
                        files.forEach(element => {
                            if (element == args) {
                                fileFound = true;
                            }
                        });
                        if (args.trim() == "") {
                            addLog("<div class='cli-text'>cd: " + "No path specified. Type 'man cd' to display example syntax." + ".</div>");
                        }
                        else if (!fileFound) {
                            addLog("<div class='cli-text'>cd: " + args + ": No such file or directory" + ".</div>");
                        }
                        else {
                            addLog("<div class='cli-text'>cd: " + args + ": is a file" + ".</div>");
                        }
                    }
                    $('#mark').text("$ [" + currentDirectory + "]");
                    console.log("currentDirectory changed to: " + currentDirectory);
                    switch (currentDirectory) {
                        case "/":
                            $('#path').text('C:\\ENUMC.COM\\');
                            break;
                        case "~/":
                            $('#path').text('C:\\ENUMC.COM\\SYSTEM\\');
                            break;
                        default:
                            $('#path').text('C:\\ENUMC.COM\\' + currentDirectory + '\\');
                    }
                    break;
                }
                case "time":
                    addLog(Date());
                    break;
                case "echo":
                    addLog("<div class='cli-text'>" + args + "</div>");
                    break;
                case "ls":
                    // addLog("<div class='blinking cli-text'>Access Denied.</div>");
                    // addLog("<img src='https://httpstatusdogs.com/img/401.jpg' style='height:20em' class='blinking'></img> <p style='font-size: 6px;'>Image supplied by https://httpstatusdogs.com/ <3</p>");
                    addLog("<p class='cli-text' style='white-space: pre-line;'>" + directoriesAndFiles[currentDirectory] + "</p>");
                    // addLog("<p class='cli-text' style='white-space: pre-line;'>resume\nprofile\nmenu\ncli</p>");
                    break;
                case "fetch":
                    $.getJSON('https://dog.ceo/api/breeds/image/random', function (data) {
                        console.info(data.message);
                        addLog("<img src='" + data.message + "' style='height:20em' class=''></img> <p style='font-size: 6px;'>Image supplied by https://dog.ceo/dog-api/ <3</p>");
                    });
                    break;
                case "open": {
                    let files = directoriesAndFiles[currentDirectory].split("\n");
                    let fileFound = false;
                    files.forEach(element => {
                        if (element == args) {
                            fileFound = true;
                        }
                    });

                    if (args.trim() == "") {
                        addLog("<div class='cli-text'>open: " + "No file specified. Type 'man open' to display example syntax." + ".</div>");
                    }
                    else if (!fileFound || args.trim().toUpperCase() in directoriesAndFiles) {
                        addLog("<div class='cli-text'>open: " + args + ": No such file. To open a directory, use cd. " + ".</div>");
                    }
                    else {
                        loadPath(args, function () { });
                    }
                    break;
                }
                case "md5": {
                    // $.getScript("https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/core.js", function (data, textStatus, jqxhr) {
                    //     $.getScript("https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/md5.js", function (data, textStatus, jqxhr) {
                    //         addLog("<form><input type='file' id='md5Input' onchange='onMD5In(document.getElementById(`md5Input`));'></form>");
                    //     });
                    // });

                    $.getScript(
						"https://cdnjs.cloudflare.com/ajax/libs/spark-md5/3.0.0/spark-md5.min.js",
						function (data, textStatus, jqxhr) {
							addLog(
								"<form><input type='file' id='md5Input' onchange='onMD5In(document.getElementById(`md5Input`));'></form>"
							);
						}
					);                  
                    
                    break;
                }
                case "signup":
                    if (args.trim() == "gravity") {
                        
                        if (typeof commandData == "undefined" || commandData["email"] == undefined) {
                            commandData = { "email": undefined, "firstName": undefined, "lastName": undefined };
                        } 
                        console.log(commandData);
                        if(commandData["email"] == undefined) {
                            addLog("<div class='cli-text'>What is your email?</div>");
                            addLog("<input id='emailIn' onblur='this.focus()' autofocus style='color:black'></input>")
                            $('#emailIn').keypress(function (event) {
                                if ((event.keyCode ? event.keyCode : event.which) == '13') {
                                    
                                    document.getElementById("emailIn").disabled = true;
                                    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test($('#emailIn').val().trim())) {
                                        commandData["email"] = $('#emailIn').val().trim();
                                    }
                                    else {
                                        addLog("<div class='cli-text'>invalid email address. Please try again.</div>");
                                        $(this).remove(); 
                                    }
                                    $('#emailIn').unbind("keypress");
                                    console.log(commandData);
                                    commandHandler("signup", "gravity");
                                }

                            });
                            document.getElementById("emailIn").select();
                        }
                        else if (commandData["firstName"] == undefined) {
                            addLog("<div class='cli-text'>What is your first name?</div>");
                            addLog("<input id='fNameIn' onblur='this.focus()' autofocus style='color:black'></input>")
                            $('#fNameIn').keypress(function (event) {
                                if ((event.keyCode ? event.keyCode : event.which) == '13') {
                                    document.getElementById("fNameIn").disabled = true;
                                    if ($('#fNameIn').val().trim().length > 0){
                                        commandData["firstName"] = $('#fNameIn').val().trim();
                                    }
                                    else {
                                        addLog("<div class='cli-text'>First name cannot be blank. Please try again.</div>");
                                        $(this).remove();
                                    }
                                    $('#fNameIn').unbind("keypress");
                                    console.log(commandData);
                                    commandHandler("signup", "gravity");
                                }

                            });
                            document.getElementById("fNameIn").select();
                        }
                        else if (commandData["lastName"] == undefined) {
                            addLog("<div class='cli-text'>What is your last name?</div>");
                            addLog("<input id='lNameIn' onblur='this.focus()' autofocus style='color:black'></input>")
                            $('#lNameIn').keypress(function (event) {
                                if ((event.keyCode ? event.keyCode : event.which) == '13') {
                                    document.getElementById("lNameIn").disabled = true;
                                    if ($('#lNameIn').val().trim().length > 0) {
                                        commandData["lastName"] = $('#lNameIn').val().trim();
                                    }
                                    else {
                                        addLog("<div class='cli-text'>Last name cannot be blank. Please try again.</div>");
                                        $(this).remove();
                                    }
                                    $('#lNameIn').unbind("keypress");
                                    console.log(commandData);
                                    commandHandler("signup", "gravity");
                                }

                            });
                            document.getElementById("lNameIn").select();
                        }
                        else {
                            addLog("<div class='cli-text'>Submitting information...</div>");
                            addLog("<progress id='infoPendingProgressBar'></progress>");
                            $.getJSON('https://gravity.enumc.com/newSubscriber.php?email=' + commandData["email"] + '&fname=' + commandData["firstName"] + '&lname=' + commandData["lastName"], function (data) {
                                let items = {};
                                $.each(data, function (key, val) {
                                    items[key] = val;
                                });

                                if (items["success"] == true) {
                                    if (items["message"] == "pending") {
                                        addLog("<div class='cli-text'>One last step!</div>");
                                        addLog("<div class='cli-text'>Email confirmation is required.</div>");
                                        addLog("<div class='cli-text'>You will receive a confirmation email within a couple minutes.</div>");
                                    }
                                    else {
                                        addLog("<div class='cli-text'>You have been successfully added to the mailing list!</div>");
                                    }
                                    
                                }
                                else {
                                    addLog("<div class='cli-text' style='word-break: break-all; width: 25em;'>An error occured. Reason: " + items["message"] + "</div>");
                                    addLog("<div class='cli-text' style='word-break: break-all; width: 25em;'>You may retry by either typing 'signup gravity' or by refreshing the page.</div");
                                    commandData = undefined;
                                }
                                $('#infoPendingProgressBar').remove();
                                console.log(items);

                            }).fail(function(e) {
                                $('#infoPendingProgressBar').remove();
                                console.log(e);
                                addLog("<div class='cli-text'>Error: AJAX request failed. Please check your internet connection and try again in a few minutes. If it still doesn't work,</div>");
                                addLog("<p class='cli-text'>please report this issue with the abovementioned error message here: \n<a href='https://github.com/EnumC/EnumC.com/issues'>https://github.com/EnumC/EnumC.com/issues</a></p>");
                            });
                        }

                    }
                    break;
                case "startx":
                    addLog("<div class='cli-text'>Display loading...</div>");
                    loadPath('gui');
                    break;
                case "pwd":
                    addLog("<div class='cli-text'>" + currentDirectory + "</div>");
                    break;
                case "ping": {
                    addLog("<div class='cli-text'>Checking Ping...</div>");
                    addLog("<progress id='infoPendingProgressBar'></progress>");
                    let path = "https://dyno.enumc.com:443/latency.php";

                    var xhr = new XMLHttpRequest();
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === XMLHttpRequest.DONE) {
                            addLog("<div class='cli-text'>latency to server:</div>");

                            if (xhr.status === 200) {
                                // success(JSON.parse(xhr.responseText));
                                addLog("<div class='cli-text'>" + String(window.performance.now() - start) + "ms</div>");
                            } else {
                                addLog("<div class='cli-text'>ERROR. Request failed.</div>");
                                // error(xhr);                    
                            }
                        }
                        $('#infoPendingProgressBar').remove();
                    };
                    xhr.open('GET', path, true);
                    let start = window.performance.now();
                    xhr.send();
                    break;
                }
                    
                case "man":
                    switch (args) {
                        case "":
                            addLog("<div class='cli-text'>No argument defined. Enter 'man command_name_here' for usage. </div>");
                            break;
                        case "help":
                            addLog("<div class='cli-text'>Display help page</div>");
                            addLog("<div class='cli-text'>Usage: help</div>");
                            break;
                        case "cd":
                            addLog("<div class='cli-text'>Set directory</div>");
                            addLog("<div class='cli-text'>Usage: cd [directoryname]</div>");
                            break;
                        case "time":
                            addLog("<div class='cli-text'>Display current time</div>");
                            addLog("<div class='cli-text'>Usage: time</div>");
                            break;
                        case "echo":
                            addLog("<div class='cli-text'>Echo arg</div>");
                            addLog("<div class='cli-text'>Usage: echo [arg]</div>");
                            break;
                        case "ls":
                            addLog("<div class='cli-text'>List files in current directory</div>");
                            addLog("<div class='cli-text'>Usage: ls</div>");
                            break;
                        case "fetch":
                            addLog("<div class='cli-text'>:3</div>");
                            addLog("<div class='cli-text'>Usage: fetch</div>");
                            break;
                        case "open":
                            addLog("<div class='cli-text'>Open file</div>");
                            addLog("<div class='cli-text'>Usage: open [filename]</div>");
                            break;
                        case "man":
                            addLog("<div class='cli-text'>Get command usage</div>");
                            addLog("<div class='cli-text'>Usage: man [commandname]</div>");
                            break;
                        case "login":
                            addLog("<div class='cli-text'>Authenticate server-side</div>");
                            addLog("<div class='cli-text'>Usage: login [credentials]</div>");
                            break;
                        case "ping":
                            addLog("<div class='cli-text'>Check dynamic server response time</div>");
                            addLog("<div class='cli-text'>Usage: ping</div>");
                            break;
                        case "pwd":
                            addLog("<div class='cli-text'>Get current path</div>");
                            addLog("<div class='cli-text'>Usage: pwd</div>");
                            break;
                        case "su":
                            addLog("<div class='cli-text'>Authenticate server-side with privilege</div>");
                            addLog("<div class='cli-text'>Usage: su [credentials]</div>");
                            break;
                        case "whoami":
                            addLog("<div class='cli-text'>Get logged in user info</div>");
                            addLog("<div class='cli-text'>Usage: whoami</div>");
                            break;
                        case "md5":
                            addLog("<div class='cli-text'>Get md5 hash of input file</div>");
                            addLog("<div class='cli-text'>Usage: md5</div>");
                            break;
                        case "command_name_here":
                            addLog("<div class='cli-text'>What did your instructor say about blindly copy pasting commands?!</div>");
                            addLog("<div class='cli-text'>To request the manual for a command, use an actual command name.</div>");
                            break;
                        case "clear":
                            addLog("<div class='cli-text'>Clear terminal</div>");
                            addLog("<div class='cli-text'>Usage: clear</div>");
                            break;
                        case "exit":
                            addLog("<div class='cli-text'>Exit terminal</div>");
                            addLog("<div class='cli-text'>Usage: exit</div>");
                            break;
                        default:
                            addLog("<div class='cli-text'>man page for " + args + " does not exist.</div>")
                            break;
                    }
                    break;

                // Server-side requests
                case "login":
                    // addLog("not implemented");
                    addLog("<div class='cli-text'>enumc.com login: </div>");
                    addLog("<input id='loginInfo' onblur='this.focus()' autofocus style='color:black'></input>")
                    $('#loginInfo').keypress(function (event) {
                        if ((event.keyCode ? event.keyCode : event.which) == '13') {
                            document.getElementById("loginInfo").disabled = true;
                            if ($('#loginInfo').val().trim().length > 0) {
                                // commandData["firstName"] = $('#loginInfo').val().trim();
                                var username = $('#loginInfo').val().trim();
                                addLog("<div class='cli-text'>Submitting information...</div>");
                                addLog("<progress id='infoPendingProgressBar'></progress>");

                                if (devMode) {
                                    console.warn("su on test portal");
                                    var loginPortal = "https://gravity.enumc.com/getLogin.php?login=";
                                }
                                else {
                                    var loginPortal = "https://dyno.enumc.com/getLogin.php?login=";
                                }

                                $.getJSON(loginPortal + username + '&action=login', function (data) {
                                    let items = {};
                                    $.each(data, function (key, val) {
                                        items[key] = val;
                                    });
                                    if (items["message"] != "invalid" && items["message"] != "undefined" && items["message"] != "unknown") {
                                        addLog("<div class='cli-text'>" + items["message"] + "</div>");
                                    }
                                    else if (items["message"] == "unknown") {
                                        addLog("<div class='cli-text'>User Not Found.</div>");
                                    }
                                    else {
                                        addLog("<div class='cli-text'>Invalid user" + "</div>");
                                    }

                                    $('#infoPendingProgressBar').remove();
                                    console.log(items);

                                }).fail(function (e) {
                                    $('#infoPendingProgressBar').remove();
                                    console.log(e);
                                    addLog("<div class='cli-text'>Error: AJAX request failed. Please check your internet connection and try again in a few minutes. If it still doesn't work,</div>");
                                    addLog("<p class='cli-text'>please report this issue with the abovementioned error message here: \n<a href='https://github.com/EnumC/EnumC.com/issues'>https://github.com/EnumC/EnumC.com/issues</a></p>");
                                });
                            }
                            else {
                                addLog("<div class='cli-text'>Invalid credentials.</div>");
                                $(this).remove();
                            }
                            $('#loginInfo').unbind("keypress");
                            $('#loginInfo').prop('id', '');
                            console.log(username);
                            document.getElementsByClassName("commandline")[0].select();
                            // commandHandler("signup", "gravity");
                        }

                    });
                    document.getElementById("loginInfo").select();
                    break;
                case "su":
                    // addLog("not implemented");
                    addLog("<div class='cli-text'>enumc.com login: </div>");
                    addLog("<input id='loginInfo' onblur='this.focus()' autofocus style='color:black'></input>")
                    $('#loginInfo').keypress(function (event) {
                        if ((event.keyCode ? event.keyCode : event.which) == '13') {
                            document.getElementById("loginInfo").disabled = true;
                            if ($('#loginInfo').val().trim().length > 0) {
                                // commandData["firstName"] = $('#loginInfo').val().trim();
                                var username = $('#loginInfo').val().trim();
                                addLog("<div class='cli-text'>Submitting information...</div>");
                                addLog("<progress id='infoPendingProgressBar'></progress>");

                                if (devMode) {
                                    console.warn("su on test portal");
                                    var loginPortal = "https://gravity.enumc.com/getLogin.php?login=";
                                }
                                else {
                                    var loginPortal = "https://dyno.enumc.com/getLogin.php?login=";
                                }

                                $.getJSON(loginPortal + username + '&action=su', function (data) {
                                    let items = {};
                                    $.each(data, function (key, val) {
                                        items[key] = val;
                                    });

                                    if (items["message"] != "invalid" && items["message"] != "undefined" && items["message"] != "unknown") {
                                        setCookie('user', items["message"], 1);
                                        addLog("<div class='cli-text'>Logged in as: " + username + "</div>");
                                    }
                                    else {
                                        addLog("<div class='cli-text'>Invalid user" + "</div>");
                                    }

                                    $('#infoPendingProgressBar').remove();
                                    console.log(items);
                                    

                                }).fail(function (e) {
                                    $('#infoPendingProgressBar').remove();
                                    console.log(e);
                                    addLog("<div class='cli-text'>Error: AJAX request failed. Please check your internet connection and try again in a few minutes. If it still doesn't work,</div>");
                                    addLog("<p class='cli-text'>please report this issue with the abovementioned error message here: \n<a href='https://github.com/EnumC/EnumC.com/issues'>https://github.com/EnumC/EnumC.com/issues</a></p>");
                                });
                            }
                            else {
                                addLog("<div class='cli-text'>Invalid credentials.</div>");
                                $(this).remove();
                            }
                            $('#loginInfo').unbind("keypress");
                            $('#loginInfo').prop('id', '');
                            console.log(username);
                            // commandHandler("signup", "gravity");
                            document.getElementsByClassName("commandline")[0].select();
                        }

                    });
                    document.getElementById("loginInfo").select();
                    break;
                case "whoami": {
                    // addLog("not implemented");
                    // addLog("<div class='cli-text'>enumc.com login: </div>");
                    // addLog("<input id='loginInfo' onblur='this.focus()' autofocus style='color:black'></input>")

                    if (devMode) {
                        console.warn("su on test portal");
                        var loginPortal = "https://gravity.enumc.com/getLogin.php?login=";
                    }
                    else {
                        var loginPortal = "https://dyno.enumc.com/getLogin.php?login=";
                    }
                    var user = getCookie('user');
                    if (user == "") {
                        user = "undefined";
                        addLog("<div class='cli-text'>Not logged in" + "</div>");
                        break;
                    }
                    $.getJSON(loginPortal + user + '&action=whoami', function (data) {
                        let items = {};
                        $.each(data, function (key, val) {
                            items[key] = val;
                        });

                        if (items["message"] != "invalid" && items["message"] != "undefined") {
                            addLog("<div class='cli-text'>Current user: " + items["message"] + "</div>");
                        }
                        else {
                            addLog("<div class='cli-text'>Invalid user" + "</div>");
                        }

                        $('#infoPendingProgressBar').remove();
                        console.log(items);

                    }).fail(function (e) {
                        $('#infoPendingProgressBar').remove();
                        console.log(e);
                        addLog("<div class='cli-text'>Error: AJAX request failed. Please check your internet connection and try again in a few minutes. If it still doesn't work,</div>");
                        addLog("<p class='cli-text'>please report this issue with the abovementioned error message here: \n<a href='https://github.com/EnumC/EnumC.com/issues'>https://github.com/EnumC/EnumC.com/issues</a></p>");
                    });

                    break;
                }
                    
                // End server-side requests

                // Exception testing.
                case "breakme":
                    throw new Error("debug error");
                    break;
                case "reseterror":
                    document.getElementById("content-error-icon").style.display = "none";
                    break;
                // End exception testing.

                case "clear":
                    $('.log').html("");
                    logContent = [];
                    break;
                case "exit":
                    loadPath("menu", function () { });
                    break;
                default:
                    addLog("<div class='cli-text'>eCLI: " + command + ": command not found" + ".</div>");
            }
        addLog('<br><br>');
        document.getElementsByClassName("commandline")[0].select();
    }
    catch (err) {
        let errCommand = $('.commandline').val().trim();
        $("#cli-container").html("<p class='cli-text'>CLI command error: " + err + ".</p>" +
            "<br><p class='cli-text'>Command: " + errCommand + ".</p>" +
            "<p class='cli-text'>Please report this issue with the abovementioned error message here: \n<a href='https://github.com/EnumC/EnumC.com/issues'>https://github.com/EnumC/EnumC.com/issues</a></p>");
        throw new Error("CLI command error: " + err);
    };
}

/* Initializes CLI and set up command, filesystem, and data. */
function initCLI() {
    if (typeof lastAuthored != "string") {
        updateCommitDetails(function () {
            $("#lastModElement").html($("#lastModElement").html() + lastAuthored);
        });
    }
    else {
        $("#lastModElement").html($("#lastModElement").html() + lastAuthored);
    }

    logContent.forEach(element => {
        addLog(element);
    });

    // Define files in CLI filesystem. 
    let directoriesAndFiles = {
        "/": "SYSTEM\nHOME\nTEST",
        SYSTEM: "..\nmenu\ncli",
        HOME: "..\nresume\nprofile",
        TEST: "..\ndirTest\nfileTest",
        DIRTEST: "..\nnestedDir",
        NESTEDDIR: "..\nNESTED2",
        NESTED2: "..\nfileTest"
    };

    // CURRENTDIRECTORY MOVED TO INDEX.JS
    $('#mark').text("$ [" + currentDirectory + "]");
    
    $('.commandline').keypress(function (event) {
        let keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            let command = $('.commandline').val().trim();
            let args = "";
            console.log('New command entered.');
            if (command.indexOf(' ') != -1) {
                args = command.substr(command.indexOf(' ') + 1);
                command = command.substr(0, command.indexOf(' '));
            }
            console.log("command: " + command);
            console.log("args: " + args);
            commandHandler(command, args, directoriesAndFiles);
            $('.commandline').val("");
        }
        
    });
}

$(".log").bind("DOMSubtreeModified", function () {
    // Scroll to bottom whenever log is updated.
    window.scrollTo(0, document.body.scrollHeight);
});

document.getElementsByClassName("commandline")[0].select();
$('#cli-container').click(function() {
    document.getElementsByClassName("commandline")[0].select();
});

// Log load completion.
console.log("CLI loading completed.");
hideLoading();