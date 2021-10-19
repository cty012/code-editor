"use strict";

const savedCode = {
    java: startCode.java,
    kotlin: startCode.kotlin
}
var currentLanguage = startLanguage;
var xhttp = new XMLHttpRequest();

function switchTheme(isDark) {
    if (isDark) {
        document.body.classList.remove("dark");
        editor.updateOptions({ theme: "vs-light" });
    } else {
        document.body.classList.add("dark");
        editor.updateOptions({ theme: "vs-dark" });
    }
    Array.prototype.forEach.call(document.getElementsByClassName('.dark-mode-btn-svg'), btnSvg => {
        btnSvg.style.color = isDark ? "#000000" : "#ffffff";
    });
}

function darkModeBtnOnClick() {
    switchTheme(document.body.classList.contains("dark"));
}

function selectTab(language) {
    savedCode[currentLanguage] = editor.getValue();
    currentLanguage = language;
    editor.setValue(savedCode[language]);
    monaco.editor.setModelLanguage(editor.getModel(), language);
    if (language == "java") {
        document.getElementById("editor-tab-java").classList.add("selected");
        document.getElementById("editor-tab-kotlin").classList.remove("selected");
    } else if (language == "kotlin") {
        document.getElementById("editor-tab-java").classList.remove("selected");
        document.getElementById("editor-tab-kotlin").classList.add("selected");
    }
}

function submit(lang=currentLanguage) {
    // hide last result
    document.getElementById("editor-output").classList.add("hidden");
    // send request
    xhttp.onreadystatechange = function() {
        if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
            document.getElementById("editor-output").innerHTML = xhttp.responseText;
            document.getElementById("editor-output").classList.remove("hidden");
        }
    };
    xhttp.open("POST", `/submission/${lang}`, true);
    xhttp.setRequestHeader("Content-Type", "text/plain");
    xhttp.send(editor.getValue());
}
